import { PageVisibility } from '../PageVisibility';
import { BasePlugin } from './BasePlugin';

/**
 *
 *
 * @export
 * @class FocusPlugin
 * @extends {BasePlugin}
 */
export class FocusPlugin extends BasePlugin {
  /**
   *Creates an instance of FocusPlugin.
   * @param {*} options
   * @memberof FocusPlugin
   */
  constructor({ options } = {}) {
    super(90);
    // Add the default option for pauseFocusSelector
    this.options = Object.assign(
      {
        pauseFocusSelector: '.pause-on-focus'
      },
      options
    );

    this.pageVisibility = new PageVisibility(
      this.onContainerFocus.bind(this),
      this.onContainerBlur.bind(this)
    );

    this._appBlurred = false;
    this._keepFocus = false;
    this._containerBlurred = false;
    this._focusTimer = null;
    document.addEventListener('focus', this.onDocClick.bind(this));
    document.addEventListener('click', this.onDocClick.bind(this));
    this.pauseFocus = document.querySelector(this.options.pauseFocusSelector);

    if (null !== this.pauseFocus) {
      this.pauseFocus.addEventListener('focus', function() {
        this._isManualPause = this.paused = true;
        this.pauseFocus.addEventListener(
          'blur',
          () => {
            this._isManualPause = this.paused = false;
            this.focus();
          },
          {
            once: true
          }
        );
      });
    }
  }

  /**
   *
   *
   * @memberof FocusPlugin
   */
  focus() {
    document.contentWindow.focus();
  }

  /**
   *
   *
   * @memberof FocusPlugin
   */
  blur() {
    this.dom.contentWindow.blur();
  }

  /**
   *
   *
   * @memberof FocusPlugin
   */
  manageFocus() {
    // Unfocus on the iframe
    if (this._keepFocus) {
      this.blur();
    }

    // we only need one delayed call, at the end of any
    // sequence of rapidly-fired blur/focus events
    if (this._focusTimer) {
      clearTimeout(this._focusTimer);
    }

    // Delay setting of 'paused' in case we get another focus event soon.
    // Focus events are sent to the container asynchronously, and this was
    // causing rapid toggling of the pause state and related issues,
    // especially in Internet Explorer
    this._focusTimer = setTimeout(
      function() {
        this._focusTimer = null;
        // A manual pause cannot be overriden by focus events.
        // User must click the resume button.
        if (this._isManualPause) {
          return;
        }

        this.paused = this._containerBlurred && this._appBlurred;

        // Focus on the content window when blurring the app
        // but selecting the container
        if (this._keepFocus && !this._containerBlurred && this._appBlurred) {
          this.focus();
        }
      }.bind(this),
      100
    );
  }

  /**
   * When the document is clicked
   * @method _onDocClicked
   * @private
   */
  onDocClick() {
    if (!this.loaded) {
      return;
    }

    this.focus();
  }

  /**
   * Handle the keep focus event for the window
   * @method onKeepFocus
   * @private
   */
  onKeepFocus(event) {
    this._keepFocus = !!event.data;
    this.manageFocus();
  }

  /**
   * Handle focus events sent from iFrame children
   * @method onFocus
   * @private
   */
  onFocus(e) {
    this._appBlurred = !e.data;
    this.manageFocus();
  }

  /**
   * Handle focus events sent from container's window
   * @method onContainerFocus
   * @private
   */
  onContainerFocus() {
    this._containerBlurred = false;
    this.manageFocus();
  }

  /**
   * Handle blur events sent from container's window
   * @method onContainerBlur
   * @private
   */
  onContainerBlur(e) {
    //Set both container and application to blurred,
    //because some blur events are only happening on the container.
    //If container is blurred because application area was just focused,
    //the application's focus event will override the blur imminently.
    this._containerBlurred = this._appBlurred = true;
    this.manageFocus();
  }

  /**
   *
   *
   * @memberof FocusPlugin
   */
  open() {
    this.client.on('focus', onFocus.bind(this));
    this.client.on('keepFocus', onKeepFocus.bind(this));
  }

  /**
   *
   *
   * @memberof FocusPlugin
   */
  opened() {
    this.focus();
  }

  /**
   *
   *
   * @memberof FocusPlugin
   */
  close() {
    // Stop the focus timer if it's running
    if (this._focusTimer) {
      clearTimeout(this._focusTimer);
    }
  }

  /**
   *
   *
   * @memberof FocusPlugin
   */
  teardown() {
    const pauseFocus = document.querySelector(this.options.pauseFocusSelector);

    if (pauseFocus !== null) {
      pauseFocus.removeEventListener('focus');
    }

    document.removeEventListener('focus', this._onDocClick);
    document.removeEventListener('click', this._onDocClick);

    if (this.pageVisibility) {
      this.pageVisibility.destroy();
    }
  }
}
