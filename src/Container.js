import { Features } from './Features';
import PluginManager from './PluginManager';
// @ts-ignore
import { version } from '../package.json';

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
 * @static @property {String} version The current version of the library
 *
 * @constructor
 * @param {string} iframeSelector selector for application iframe container
 */
export class Container extends PluginManager {
  /**
   *Creates an instance of Container.
   * @param {string} iframeSelector
   * @memberof Container
   */
  constructor(iframeSelector) {
    super();
    this.main = document.querySelector(iframeSelector);

    if (null === this.main) {
      throw new Error('No iframe was found with the provided selector');
    }
    this.plugins = [];
    this.dom = this.main;
    this.loaded = false;
    this.loading = false;
    this.release = null;
    this.setupPlugins();
  }

  /**
   * The game is starting to load
   * @memberof Container
   */
  onLoading() {
    this.client.trigger('opening');
  }

  /**
   * Reset the mutes for audio and captions
   * @memberof Container
   */
  onLoadDone() {
    this.loading = false;
    this.loaded = true;
    this.main.classList.remove('loading');

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
    console.error('SpringRoll Container error: ', $event, new Error().stack);
  }

  /**
   * Reset all the buttons back to their original setting
   * and clear the iframe.
   * @memberof Container
   */
  reset() {
    const wasLoaded = this.loaded || this.loading;

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
    //Handle bellhop events coming from the application
    this.client.on('loading', this.onLoading.bind(this));
    this.client.on('loaded', this.onLoadDone.bind(this));
    this.client.on('loadDone', this.onLoadDone.bind(this));
    this.client.on('endGame', this.onEndGame.bind(this));
    this.client.on('localError', this.onLocalError.bind(this));
    // @ts-ignore
    this.client.connect(this.dom);
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

    this.client.respond('singlePlay', singlePlay);
    this.client.respond('playOptions', playOptions);
    this.client.trigger('open');
  }

  /**
   *
   *
   * @param {string} path
   * @param {object} [options={}]
   * @memberof Container
   */
  openPath(path, options = {}) {
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
          playOptions: {}
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
   * @param {null | object} [options.playOptions=null]
   * @memberof Container
   */
  openRemote(api, { query = '', singlePlay = false, playOptions = null } = {}) {
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
      this.client.trigger('close');
      // Start the close
      this.client.send('close');
    } else {
      this.reset();
    }
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
}
