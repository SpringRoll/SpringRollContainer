/**
 * Handle the page visiblity change, if supported. Application uses one of these to
 * monitor page visibility. It is suggested that you listen to `pause`, `paused`,
 * or `resumed` events on the Application instead of using one of these yourself.
 *
 * @export
 * @class PageVisibility
 * @constructor
 * @param {Function} onFocus Callback when the page becomes visible
 * @param {Function} onBlur Callback when the page loses visibility
 */
export class PageVisibility {
  /**
   *Creates an instance of PageVisibility.
   * @param { function } [onFocus=function() {}]
   * @param { function } [onBlur=function() {}]
   * @memberof PageVisibility
   */
  constructor(onFocus = function() {}, onBlur = function() {}) {
    this._onFocus = onFocus;
    this._onBlur = onBlur;
    this.onFocus = function() {
      if (this.enabled) {
        this._onFocus();
      }
    }.bind(this);
    this.onBlur = function() {
      if (this.enabled) {
        this._onBlur();
      }
    }.bind(this);
    this._enabled = false;
    this.enabled = true;
  }

  /**
   * Disable the detection
   * @memberof PageVisibility
   */
  destroy() {
    this.enabled = false;
    this.onToggle = null;
    this.onFocus = null;
    this.onBlur = null;
  }

  /**
   * The visibility toggle listener function
   * @param {Event} $event;
   * @memberof PageVisibility
   */
  onToggle($event) {
    if (this.enabled) {
      document.hidden ? this.onBlur($event) : this.onFocus($event);
    }
  }

  /**
   * If this object is enabled.
   * @returns {boolean}
   * @memberof PageVisibility
   */
  get enabled() {
    return this._enabled;
  }

  /**
   * Sets the state of the object
   * @memberof PageVisibility
   */
  set enabled(enable) {
    this._enabled = enable;
    document.removeEventListener(
      'visibilitychange',
      this.onToggle.bind(this),
      false
    );

    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    window.removeEventListener('pagehide', this.onBlur);
    window.removeEventListener('pageshow', this.onFocus);
    window.removeEventListener('visibilitychange', this.onToggle.bind(this));

    if (this._enabled) {
      document.addEventListener(
        'visibilitychange',
        this.onToggle.bind(this),
        false
      );
      window.addEventListener('blur', this.onBlur);
      window.addEventListener('focus', this.onFocus);
      window.addEventListener('pagehide', this.onBlur);
      window.addEventListener('pageshow', this.onFocus);
      window.addEventListener(
        'visibilitychange',
        this.onToggle.bind(this),
        false
      );
    }
  }
}
