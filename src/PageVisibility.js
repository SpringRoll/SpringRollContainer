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
  onToggle() {
    document.hidden ? this.onBlur() : this.onFocus();
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
    document.removeEventListener('visibilityChange', this.onToggle, false);
    // @ts-ignore
    window.removeEventListener('blur', this.onBlur);
    // @ts-ignore
    window.removeEventListener('focus', this.onFocus);
    // @ts-ignore
    window.removeEventListener('pagehide', this.onBlur);
    // @ts-ignore
    window.removeEventListener('pageshow', this.onFocus);
    window.removeEventListener('visibilityChange', this.onToggle);

    if (this._enabled) {
      document.addEventListener('visibilityChange', this.onToggle, false);
      // @ts-ignore
      window.addEventListener('blur', this.onBlur);
      // @ts-ignore
      window.addEventListener('focus', this.onFocus);
      // @ts-ignore
      window.addEventListener('pagehide', this.onBlur);
      // @ts-ignore
      window.addEventListener('pageshow', this.onFocus);
      window.addEventListener('visibilityChange', this.onToggle, false);
    }
  }
}
