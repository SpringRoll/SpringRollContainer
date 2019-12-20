import { Features } from './Features';
import PluginManager from './PluginManager';
// @ts-ignore
import { version } from '../package.json';

/**
 * The application container
 * @class Container
 * @property {Bellhop} client Communication layer between the container and application
 * @property {boolean} loaded Check to see if a application is loaded
 * @property {boolean} loading Check to see if a application is loading
 * @property {object} release The current release data
 * @property {HTMLIFrameElement} iframe The DOM object for the iframe
 * @static @property {string} version The current version of the library
 */
export class Container extends PluginManager {
  /**
   *Creates an instance of Container.
   * @param {object} config
   * @param {Array<BasePlugin> | null} [config.plugins=[]]
   * @param {string} config.iframeSelector
   * @memberof Container
   */
  constructor({ iframeSelector, plugins = [] }) {
    super({ plugins: plugins });

    this.iframe = document.querySelector(iframeSelector);

    if (null === this.iframe) {
      throw new Error('No iframe was found with the provided selector');
    }
    this.loaded = false;
    this.loading = false;
    this.release = null;

    this.initClient();
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
    this.iframe.classList.remove('loading');

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
    this.iframe.setAttribute('src', '');
    this.iframe.classList.remove('loading');
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
    this.client.connect(this.iframe);
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
   * @param {object} [userOptions] The open options
   * @param {boolean} [userOptions.singlePlay=false] If we should play in single play mode
   * @param {object | null} [userOptions.playOptions=null] The optional play options
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

    this.iframe.classList.add('loading');
    this.iframe.setAttribute('src', path);

    this.client.respond('singlePlay', { singlePlay });
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
   * @returns {Promise<void>}
   * @memberof Container
   */
  async openRemote(
    api,
    { query = '', singlePlay = false, playOptions = null } = {}
  ) {
    this.release = null;

    return fetch(api, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(json => {
        // if SpringRollConnect denoted that something failed, send that error back
        if (!json.success) {
          return Promise.reject(new Error(json.error));
        }

        // If the browser doesn't support the capabilities requested by this game, also fail.
        const release = json.data;
        const error = Features.test(release.capabilities);
        if (error) {
          this.client.trigger('unsupported', { error });
          return Promise.reject(new Error(error));
        }

        // otherwise, open the game
        this.release = release;
        this._internalOpen(release.url + query, {
          singlePlay,
          playOptions
        });
      });
  }

  /**
   * Destroy and don't use after this
   * @memberof Container
   */
  destroy() {
    this.reset();

    this.iframe = null;
    this.options = null;
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
