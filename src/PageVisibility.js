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
    this.onFocus = function(e) {
      if (this.enabled) {
        this._onFocus(e);
      }
    }.bind(this);
    this.onBlur = function(e) {
      if (this.enabled) {
        this._onBlur(e);
      }
    }.bind(this);
    this._enabled = false;
    this.enabled = true;

    this.onToggle = this.onToggle.bind(this);
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

    document.removeEventListener('visibilitychange', this.onToggle, false);
    document.removeEventListener('blur', this.onBlur, false);
    document.removeEventListener('focus', this.onFocus, false);
    window.removeEventListener('pagehide', this.onBlur, false);
    window.removeEventListener('pageshow', this.onFocus, false);
    window.removeEventListener('visibilitychange', this.onToggle, false);

    if (this._enabled) {
      document.addEventListener('visibilitychange', this.onToggle, false);
      document.addEventListener('blur', this.onBlur, false);
      document.addEventListener('focus', this.onFocus, false);
      window.addEventListener('pagehide', this.onBlur, false);
      window.addEventListener('pageshow', this.onFocus, false);
      window.addEventListener('visibilitychange', this.onToggle, false);
    }
  }
}
