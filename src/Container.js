import { Bellhop } from 'bellhop-iframe';

//private variables
let PLUGINS = [];

/**
 * The application container
 * @class Container
 * @constructor
 * @param {string} iframeSelector selector for application iframe container
 * @param {object} [options] Optional parameteres
 * @param {string} [options.helpButton] selector for help button
 * @param {string} [options.captionsButton] selector for captions button
 * @param {string} [options.soundButton] selector for captions button
 * @param {string} [options.voButton] selector for vo button
 * @param {string} [options.sfxButton] selector for sounf effects button
 * @param {string} [options.musicButton] selector for music button
 * @param {string} [options.pauseButton] selector for pause button
 * @param {string} [options.pauseFocusSelector='.pause-on-focus'] The class to pause
 *        the application when focused on. This is useful for form elements which
 *        require focus and play better with Application's keepFocus option.
 */
export class Container {
  /**
   *Creates an instance of Container.
   * @param {*} iframeSelector
   * @param {*} options
   * @memberof Container
   */
  constructor(iframeSelector, options) {
    this.options = options;
    this.main = document.querySelector(iframeSelector);

    if (null === this.main) {
      throw new Error('No iframe was found with the provided selector');
    }

    this.dom = this.main;

    this.client = null;

    this.release = null;
    this.loaded = false;
    this.loaded = false;
    this.loading = false;
    this.plugins = [];
    this.client = new Bellhop();

    //TODO Change how plugins are setup?
    Container.PLUGINS.forEach(plugin => plugin.setup.call(this));
  }

  /**
   * Removes the Bellhop communication layer altogether.
   * @memberof Container
   */
  destroyClient() {
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }
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

    Container.PLUGINS.forEach(plugin => plugin.opened.call(this));

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
      Container.PLUGINS.forEach(plugin => plugin.closed.call(this));
    }

    // Remove bellhop instance
    this.destroyClient();

    // Reset state
    this.loaded = false;
    this.loading = false;

    // Clear the iframe src location
    this.main.setAttribute('src', '');
    this.main.classList.remove('loading');

    if (wasLoaded) {
      //TODO this.off('localError', this._onCloseFailed);

      this.client.trigger('closed');
    }
  }

  /**
   * Set up communication layer between site and application.
   * May be called from subclasses if they create/destroy Bellhop instances.
   * @memberof Container
   */
  initClient() {
    //Setup communication layer between site and application
    this.client = new Bellhop();
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

    const err = true; // TODO Features.basic()
    if (err) {
      return this.client.trigger('unsupported');
    }

    this.loading = true;

    Container.PLUGINS.forEach(plugin => plugin.open.call(this));

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

    this.client.respond('singlePlay', options.singlePlay);
    this.client.respond('playOptions', options.playOptions);
    this.client.trigger('open');
  }

  /**
   *
   *
   * @param {*} path
   * @param {*} [options={}]
   * @param {*} [playOptions={}]
   * @memberof Container
   */
  openPath(path, options = {}, playOptions = {}) {
    // This should be deprecated, support for old function signature
    if (typeof options === 'boolean') {
      options = {
        singlePlay: false,
        playOptions: playOptions
      };
    }
    this._internalOpen(path, options);
  }

  /**
   * Destroy and don't use after this
   * @memberof Container
   */
  destroy() {
    this.reset();
    // Destroy in the reverse priority order
    Container.PLUGINS.forEach(plugin => plugin.teardown.call(this));

    this.main = null;
    this.options = null;
    this.dom = null;
  }

  /**
   * Tell the application to start closing
   * @memberof Container
   */
  close() {
    if (this.loading || this.loaded) {
      Container.PLUGINS.forEach(plugin => plugin.close.call(this));
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
  static get VERSION() {
    return 'CONTAINER_VERSION';
  }

  /**
   * The currently installed plugins
   * @static
   * @memberof Container
   */
  static get PLUGINS() {
    return PLUGINS;
  }

  /**
   *
   * Overwrites the current array of plugins
   * @static
   * @param {array} plugins
   * @memberof Container
   */
  static set PLUGINS(plugins) {
    if (Array.isArray(plugins)) {
      PLUGINS = plugins;
    }
  }
}
