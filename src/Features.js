/**
 * Provide feature detection
 * @class Features
 */
export class Features {
  /**
   * If the browser has WebGL support
   * @property {boolean} webgl
   */
  static get webgl() {
    const canvas = document.createElement('canvas');

    return !!(
      canvas &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  }

  /**
   * If the browser has Canvas support
   * @property {boolean} canvas
   */
  static get canvas() {
    const canvas = document.createElement('canvas');
    return !!(canvas !== null && canvas.getContext && canvas.getContext('2d'));
  }

  /**
   * If the browser has WebAudio API support
   * @property {boolean} webaudio
   */
  static get webaudio() {
    return 'webkitAudioContext' in window || 'AudioContext' in window;
  }

  /**
   * If the browser has Web Sockets API
   * @property {boolean} websockets
   */
  static get websockets() {
    return 'WebSocket' in window || 'MozWebSocket' in window;
  }

  /**
   * If the browser has Geolocation API
   * @property {boolean} geolocation
   */
  static get geolocation() {
    return 'geolocation' in navigator;
  }

  /**
   * If the browser has Web Workers API
   * @property {boolean} webworkers
   */
  static get webworkers() {
    return 'function' === typeof Worker;
  }

  /**
   * If the browser has touch
   * @property {boolean} touch
   */
  static get touch() {
    return !!(
      'ontouchstart' in window || // iOS & Android
      (navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0) || // IE10
      (navigator.pointerEnabled && navigator.maxTouchPoints > 0)
    ); // IE11+
  }

  /**
   * Test for basic browser compatiliblity
   * @method basic
   * @static
   * @return {String} The error message, if fails
   */
  static basic() {
    if (!Features.canvas) {
      return 'Browser does not support canvas';
    } else if (!Features.webaudio) {
      return 'Browser does not support WebAudio';
    }
    return null;
  }

  /**
   * See if the current bowser has the correct features
   * @method test
   * @static
   * @param {object} capabilities The capabilities
   * @param {object} [capabilities.features] The features
   * @param {object} [capabilities.features.webgl] WebGL required
   * @param {object} [capabilities.features.geolocation] Geolocation required
   * @param {object} [capabilities.features.webworkers] Web Workers API required
   * @param {object} [capabilities.features.webaudio] WebAudio API required
   * @param {object} [capabilities.features.websockets] WebSockets required
   * @param {object} [capabilities.sizes] The sizes
   * @param {Boolean} [capabilities.sizes.xsmall] Screens < 480
   * @param {Boolean} [capabilities.sizes.small] Screens < 768
   * @param {Boolean} [capabilities.sizes.medium] Screens < 992
   * @param {Boolean} [capabilities.sizes.large] Screens < 1200
   * @param {Boolean} [capabilities.sizes.xlarge] Screens >= 1200
   * @param {object} [capabilities.ui] The ui
   * @param {Boolean} [capabilities.ui.touch] Touch capable
   * @param {Boolean} [capabilities.ui.mouse] Mouse capable
   * @return {String|null} The error, or else returns null
   */
  static test(capabilities) {
    // check for basic compatibility
    const err = this.basic();
    if (err) {
      return err;
    }

    const features = capabilities.features;
    const ui = capabilities.ui;
    const sizes = capabilities.sizes;

    for (const name in features) {
      if ('undefined' !== typeof features[name] && !Features[name]) {
        // Failed built-in feature check
        return 'Browser does not support ' + name;
      }
    }

    // Failed negative touch requirement
    if (!ui.touch && Features.touch) {
      return 'Game does not support touch input';
    }

    // Failed mouse requirement
    if (!ui.mouse && !Features.touch) {
      return 'Game does not support mouse input';
    }

    // Check the sizes
    const size = Math.max(window.screen.width, window.screen.height);

    if (!sizes.xsmall && size < 480) {
      return 'Game doesn\'t support extra small screens';
    }
    if (!sizes.small && size < 768) {
      return 'Game doesn\'t support small screens';
    }
    if (!sizes.medium && size < 992) {
      return 'Game doesn\'t support medium screens';
    }
    if (!sizes.large && size < 1200) {
      return 'Game doesn\'t support large screens';
    }
    if (!sizes.xlarge && size >= 1200) {
      return 'Game doesn\'t support extra large screens';
    }
    return null;
  }

  /**
   * Returns browser feature support info
   * @returns {string}
   */
  static get info() {
    return `Browser Feature Detection
				Canvas support ${Features.canvas ? '\u2713' : '\u00D7'}
				WebGL support ${Features.webgl ? '\u2713' : '\u00D7'}
				WebAudio support ${Features.webAudio ? '\u2713' : '\u00D7'}`;
  }
}
