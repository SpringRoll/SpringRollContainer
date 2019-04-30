import { ButtonPlugin } from './ButtonPlugin';
import { PageVisibility } from '../PageVisibility';
/**
 * @class Container
 */
export class PausePlugin extends ButtonPlugin {
  /**
   *Creates an instance of PausePlugin.
   * @param {string} pauseButton
   * @param {string} [selector='.pause-on-focus']
   * @memberof PausePlugin
   */
  constructor(pauseButton, selector = '.pause-on-focus') {
    super('Pause-Button-plugin');
    this._appBlurred = false;
    this._containerBlurred = false;
    this._focusTimer = null;
    this._isManualPause = false;
    this._keepFocus = false;
    this._paused = false;
    this.iFrame = null;
    this.focus = this.focus.bind(this);
    this.manageFocus = this.manageFocus.bind(this);
    this.onKeepFocus = this.onKeepFocus.bind(this);
    this.onPauseFocus = this.onPauseFocus.bind(this);
    this.paused = false;
    this.pauseDisabled = false;

    this.pageVisibility = new PageVisibility(
      this.onContainerFocus.bind(this),
      this.onContainerBlur.bind(this)
    );

    document.addEventListener('focus', this.focus);

    this.pauseButton = document.querySelectorAll(pauseButton);
    if (0 < this.pauseButton.length) {
      const onPauseToggle = this.onPauseToggle.bind(this);

      this.pauseButton.forEach(e => e.addEventListener('click', onPauseToggle));
    }

    this.pauseFocus = document.querySelectorAll(selector);

    if (null !== this.pauseFocus) {
      this.pauseFocus.forEach(e =>
        e.addEventListener('focus', this.onPauseFocus)
      );
    }
  }

  /**
   *
   *
   * @memberof PausePlugin
   */
  set pause(paused) {
    paused = !!paused;
    if (this.pauseDisabled) {
      return;
    }

    this._paused = paused;
    this.client.send('pause', paused);
    this.client.trigger(paused ? 'paused' : 'resumed', {
      paused: this._paused
    });

    // Set the pause button state
    this.pauseButton.forEach(element => {
      element.classList.remove('unpaused');
      element.classList.remove('paused');
      element.classList.add(paused ? 'paused' : 'unpaused');
    });
  }
  /**
   *
   *
   * @memberof PausePlugin
   */
  get pause() {
    return this._paused;
  }

  /**
   * @param {Event} $event
   * @memberof FocusPlugin
   */
  onPauseFocus($event) {
    this._isManualPause = this.paused = this.pause = true;
    $event.srcElement.addEventListener(
      'blur',
      function() {
        this._isManualPause = this.paused = this.pause = false;
        this.focus();
      }.bind(this),
      {
        once: true
      }
    );
  }

  /**
   * @memberof FocusPlugin
   */
  focus() {
    if (!this.hasDom) {
      return;
    }

    this.iFrame.contentWindow.focus();
  }

  /**
   * @memberof FocusPlugin
   */
  blur() {
    if (!this.hasDom) {
      return;
    }
    this.iFrame.contentWindow.blur();
  }

  /**
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

        this.paused = Boolean(this._containerBlurred && this._appBlurred);

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
   * Handle the keep focus event for the window
   * @method onKeepFocus
   * @private
   */
  onKeepFocus($event) {
    this._keepFocus = !!$event.data;
    this.manageFocus();
  }

  /**
   * Handle focus events sent from iFrame children
   * @method onFocus
   * @private
   */
  onFocus($event) {
    this._appBlurred = !$event.data;
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
  onContainerBlur() {
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
   * @memberof PausePlugin
   */
  onPauseToggle() {
    this.pause = !this._paused;
    this._isManualPause = this.paused;
  }

  /**
   * @param {Container} container
   * @memberof FocusPlugin
   */
  init({ iFrame }) {
    this.iFrame = iFrame;
    this.client.on(
      'features',
      function(features) {
        if (features.disablePause) {
          this.pauseDisabled = true;
        }
      }.bind(this)
    );
    this.client.on('focus', this.onFocus.bind(this));
    this.client.on('keepFocus', this.onKeepFocus.bind(this));
    this.pauseButton.forEach(element => element.classList.remove('disabled'));
    this.pause = this._paused;
    this.focus();
  }

  /**
   * Function to check if we have a dom with a contentWindow
   * @readonly
   * @returns {boolean}
   * @memberof PausePlugin
   */
  get hasDom() {
    return Boolean(null !== this.iFrame && this.iFrame.contentWindow);
  }
}
