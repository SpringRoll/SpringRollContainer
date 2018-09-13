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
    this.onFocus = onFocus;
    this.onBlur = onBlur;
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
   * @memberof PageVisibility
   */
  onToggle($event) {
    document.hidden ? this.onBlur($event) : this.onFocus($event);
  }

  /**
   * If this object is enabled.
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
    // @ts-ignore
    window.removeEventListener('blur', this.onBlur.bind(this));
    // @ts-ignore
    window.removeEventListener('focus', this.onFocus.bind(this));
    // @ts-ignore
    window.removeEventListener('pagehide', this.onBlur.bind(this));
    // @ts-ignore
    window.removeEventListener('pageshow', this.onFocus.bind(this));
    window.removeEventListener('visibilitychange', this.onToggle.bind(this));

    if (this._enabled) {
      document.addEventListener(
        'visibilitychange',
        this.onToggle.bind(this),
        false
      );
      // @ts-ignore
      window.addEventListener('blur', this.onBlur.bind(this));
      // @ts-ignore
      window.addEventListener('focus', this.onFocus.bind(this));
      // @ts-ignore
      window.addEventListener('pagehide', this.onBlur.bind(this));
      // @ts-ignore
      window.addEventListener('pageshow', this.onFocus.bind(this));
      window.addEventListener(
        'visibilitychange',
        this.onToggle.bind(this),
        false
      );
    }
  }
}
