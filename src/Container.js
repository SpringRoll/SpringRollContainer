import { Bellhop } from 'bellhop-iframe';
import { Features } from './Features';
// @ts-ignore
import { version } from '../package.json';

//private/static variables
let PLUGINS = [];
const CLIENT = new Bellhop();
/**
 * The application container
 * @class Container
 * @property {Bellhop} client Communication layer between the container and application
 * @property {Boolean} loaded Check to see if a application is loaded
 * @property {Boolean} loading Check to see if a application is loading
 * @property {HTMLIFrameElement} dom The DOM object for the iframe
 * @property {HTMLIFrameElement} main The current iframe object
 * @property {Object} release The current release data
 * @property {HTMLIFrameElement} dom
 * @static @property {Array<BasePlugin>} plugins The collection of Container plugins
 * @static @property {String} version The current version of the library
 *
 * @constructor
 * @param {string} iframeSelector selector for application iframe container
 */
export class Container {
  /**
   *Creates an instance of Container.
   * @param {string} iframeSelector
   * @memberof Container
   */
  constructor(iframeSelector) {
    this.main = document.querySelector(iframeSelector);
    Container.sortPlugins();

    if (null === this.main) {
      throw new Error('No iframe was found with the provided selector');
    }
    this.dom = this.main;
    this.loaded = false;
    this.loading = false;
    this.release = null;
    //Plugin init
    this.plugins = Container.plugins;
    this.plugins.forEach(plugin => plugin.setup(this));
    this.preload();
  }

  /**
   * The game is starting to load
   * @memberof Container
   */
  onLoading() {
    this.client.trigger('opening');
  }

  /**
   * The game preload is progressing
   * @memberof Container
   */
  onProgress() {
    this.client.trigger('progress');
  }

  /**
   * Reset the mutes for audio and captions
   * @memberof Container
   */
  onLoadDone() {
    this.loading = false;
    this.loaded = true;
    this.main.classList.remove('loading');

    this.plugins.forEach(plugin => plugin.opened(this));

    /**
     * Event when the application gives the load done signal
     * @event opened
     */
    this.client.trigger('opened');
  }

  /**
   * The application ended and destroyed itself
   * @memberof Container
   */
  onEndGame() {
    this.reset();
  }
  /**
   * Handle the local errors
   * @method onLocalError
   * @private
   * @param  {Event} $event Bellhop event
   */
  onLocalError($event) {
    this.client.trigger($event.type);
  }

  /**
   * Reset all the buttons back to their original setting
   * and clear the iframe.
   * @memberof Container
   */
  reset() {
    const wasLoaded = this.loaded || this.loading;

    // Destroy in the reverse priority order
    if (wasLoaded) {
      this.plugins
        .slice()
        .reverse()
        .forEach(plugin => plugin.closed(this));
    }

    if (wasLoaded) {
      this.client.trigger('closed');
    }

    // Reset state
    this.loaded = false;
    this.loading = false;

    // Clear the iframe src location
    this.main.setAttribute('src', '');
    this.main.classList.remove('loading');
  }

  /**
   * Set up communication layer between site and application.
   * May be called from subclasses if they create/destroy Bellhop instances.
   * @memberof Container
   */
  initClient() {
    // @ts-ignore
    this.client.connect(this.dom);

    //Handle bellhop events coming from the application
    this.client.on('loading', this.onLoading.bind(this));
    this.client.on('progress', this.onProgress.bind(this));
    this.client.on('loaded', this.onLoadDone.bind(this));
    this.client.on('endGame', this.onEndGame.bind(this));
    this.client.on('localError', this.onLocalError.bind(this));
  }

  /**
   * If there was an error when closing, reset the container
   * @memberof Container
   */
  _onCloseFailed() {
    this.reset(); // force close the app
  }

  /**
   * Open a application or path
   * @param {string} userPath The full path to the application to load
   * @param {Object} [userOptions] The open options
   * @param {Boolean} [userOptions.singlePlay=false] If we should play in single play mode
   * @param {Object | null} [userOptions.playOptions=null] The optional play options
   * @memberof Container
   */
  _internalOpen(userPath, { singlePlay = false, playOptions = null } = {}) {
    const options = { singlePlay, playOptions };
    this.reset();

    this.loading = true;
    this.initClient();

    const err = Features.basic();
    if (err) {
      console.error('ERROR:', err);
      this.client.trigger('unsupported');
    }
    this.plugins.forEach(plugin => plugin.open(this));

    let path = userPath;
    if (null !== options.playOptions) {
      const playOptionsQueryString =
        'playOptions=' +
        encodeURIComponent(JSON.stringify(options.playOptions));

      path =
        -1 === userPath.indexOf('?')
          ? `${userPath}?${playOptionsQueryString}`
          : `${userPath}&${playOptionsQueryString}`;
    }

    this.main.classList.add('loading');
    this.main.setAttribute('src', path);

    this.client.respond('singlePlay', { singlePlay });
    this.client.respond('playOptions', { playOptions });
    this.client.trigger('open');
  }

  /**
   *
   *
   * @param {string} path
   * @param {object} [options={}]
   * @param {object} [playOptions={}]
   * @memberof Container
   */
  openPath(path, options = {}, playOptions = {}) {
    // This should be deprecated, support for old function signature
    if ('object' !== typeof options) {
      console.warn(
        'SpringRoll Container.openPath was passed a invalid options parameter. Using default parameters instead'
      );
      options = {};
    }

    this._internalOpen(
      path,
      Object.assign(
        {
          singlePlay: false,
          playOptions: playOptions
        },
        options
      )
    );
  }

  /**
   * Open application based on an API Call to SpringRoll Connect
   * @param {string} api
   * @param {object} options
   * @param {string} [options.query='']
   * @param {boolean} [options.singlePlay=false]
   * @param {null | object} [playOptions=null]
   * @memberof RemotePlugin
   */
  openRemote(api, { query = '', singlePlay = false } = {}, playOptions = null) {
    this.release = null;

    fetch(api, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      if (200 !== response.status) {
        return;
      }
      response.json().then(json => {
        const release = json.data;
        console.log(json);
        const error = Features.test(release.capabilities);
        if (error) {
          return this.client.trigger('unsupported');
        }

        this.release = release;
        this._internalOpen(release.url + query, { singlePlay, playOptions });
      });
    });
  }

  /**
   * Destroy and don't use after this
   * @memberof Container
   */
  destroy() {
    this.reset();
    // Destroy in the reverse priority order
    this.plugins
      .slice()
      .reverse()
      .forEach(plugin => plugin.teardown(this));

    this.main = null;
    this.options = null;
    this.dom = null;
    this.release = null;
  }

  /**
   * Tell the application to start closing
   * @memberof Container
   */
  close() {
    if (this.loading || this.loaded) {
      this.plugins.forEach(plugin => plugin.close(this));
      this.client.trigger('close');
      // Start the close
      this.client.send('close');
    } else {
      this.reset();
    }
  }

  /**
   * Runs all plugin require preload functions
   * @async
   * @memberof Container
   */
  preload() {
    const preloader = Promise.resolve();
    this.plugins.forEach(plugin => preloader.then(() => plugin.preload()));
    preloader
      .then(() => this.client.send('plugins loaded'))
      .catch(e =>
        console.error('SpringRoll Container Plugin Preloader error: ', e)
      );
  }

  /**
   * The current version of SpringRollContainer
   * @readonly
   * @static
   * @memberof Container
   */
  static get version() {
    return version;
  }

  /**
   * On Container instantiation all plugins based through this function will be supplied to the Container
   * @static
   * @param {SpringRollContainer.BasePlugin} plugin your plugin. This will be merged with a base plugin to make sure your plugin has certain functions
   * @memberof Container
   */
  static uses(plugin) {
    PLUGINS.push(plugin);
  }

  /**
   * @readonly
   * @static
   * @memberof Container
   * @returns {Array<SpringRollContainer.BasePlugin>}
   */
  static get plugins() {
    return PLUGINS;
  }

  /**
   * Clears all plugin instances from Container
   * @static
   * @memberof Container
   */
  static clearPlugins() {
    PLUGINS = [];
    return PLUGINS;
  }

  /**
   * @readonly
   * @static
   * @returns {Bellhop}
   * @memberof Container
   */
  static get client() {
    return CLIENT;
  }

  /**
   * @readonly
   * @returns {Bellhop}
   * @memberof Container
   */
  get client() {
    return Container.client;
  }

  /**
   * Helper method for sorting plugins in place. Looks at dependency order and performs a topological sort to enforce
   * proper load error
   */
  static sortPlugins() {
    if (PLUGINS.length === 0) {
      return; // nothing to do
    }

    const pluginNames = PLUGINS.map(plugin => plugin.name);
    const pluginLookup = {};
    PLUGINS.forEach(plugin => {
      // for any optional plugins that are missing remove them from the list and warn along the way
      const optionalAvailablePlugins = plugin.optional.filter(
        name => (pluginNames.indexOf(name) === -1 ? false : true)
      );

      pluginLookup[plugin.name] = {
        plugin: plugin,
        name: plugin.name,
        dependencies: []
          .concat(plugin.required)
          .concat(optionalAvailablePlugins)
      };
    });
    const visited = [];
    const toVisit = new Set();

    // first, add items that do not have any dependencies
    Object.keys(pluginLookup)
      .map(key => pluginLookup[key])
      .filter(lookup => lookup.dependencies.length === 0)
      .forEach(lookup => toVisit.add(lookup.name));

    // if there are no items to visit, throw an error
    if (toVisit.size === 0) {
      throw new Error('Every registered plugin has a dependency!');
    }

    while (toVisit.size > 0) {
      // pick an item and remove it from the list
      const item = toVisit.values().next().value;
      toVisit.delete(item);

      // add it to the visited list
      visited.push(item);

      // for every plugin
      Object.keys(pluginLookup).forEach(pluginName => {
        const index = pluginLookup[pluginName].dependencies.indexOf(item);

        // remove it as a dependency
        if (index > -1) {
          pluginLookup[pluginName].dependencies.splice(index, 1);
        }

        // if there are no more dependencies left, we can visit this item now
        if (
          pluginLookup[pluginName].dependencies.length === 0 &&
          visited.indexOf(pluginName) === -1
        ) {
          toVisit.add(pluginName);
        }
      });
    }

    // if there are any dependencies left, that means that there's a cycle
    const uncaughtKeys = Object.keys(pluginLookup).filter(
      pluginName => pluginLookup[pluginName].dependencies.length > 0
    );

    if (uncaughtKeys.length > 0) {
      throw new Error('Dependency graph has a cycle');
    }

    // now, rebuild the array
    PLUGINS = [];
    visited.forEach(name => {
      PLUGINS.push(pluginLookup[name].plugin);
    });
  }
}
