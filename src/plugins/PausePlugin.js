import { ButtonPlugin } from './ButtonPlugin';
import { PageVisibility } from '../PageVisibility';
import { Button } from '../ui-elements';
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
    this.iframe = null;
    this.focus = this.focus.bind(this);
    this.manageFocus = this.manageFocus.bind(this);
    this.onKeepFocus = this.onKeepFocus.bind(this);
    this.onPauseFocus = this.onPauseFocus.bind(this);
    //this.paused = false;
    this.pauseDisabled = false;
    this._pauseButton = [];

    this.pageVisibility = new PageVisibility(
      this.onContainerFocus.bind(this),
      this.onContainerBlur.bind(this)
    );

    document.addEventListener('focus', this.focus);

    this.pauseButtons = document.querySelectorAll(pauseButton);
    if (0 < this.pauseButtons.length) {
      const onPauseToggle = this.onPauseToggle.bind(this);

      for (let i = 0, l = this.pauseButtons.length; i < l; i++) {
        this._pauseButton.push(
          new Button({
            button: this.pauseButtons[i],
            onClick: onPauseToggle,
            channel: 'pause'
          })
        );
      }
    }

    this.pauseFocus = document.querySelectorAll(selector);

    if (!this.pauseFocus) {
      return;
    }
    for (let i = 0, l = this.pauseFocus.length; i < l; i++) {
      this.pauseFocus[i].addEventListener('focus', this.onPauseFocus);
    }
  }

  /**
   *
   *
   * @memberof PausePlugin
   */
  set pause(paused) {
    console.log('paused', paused);
    paused = !!paused;

    if (this.pauseDisabled) {
      return;
    }
    this._paused = paused;
    this.client.send('pause', paused);
    this.client.trigger(paused ? 'paused' : 'resumed', {
      paused: this._paused
    });

    for (let i = 0, l = this._pauseButton.length; i < l; i++) {
      this._pauseButton[i].button.classList.remove('unpaused');
      this._pauseButton[i].button.classList.remove('paused');
      this._pauseButton[i].button.classList.add(paused ? 'paused' : 'unpaused');
    }
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
    console.log('focused');

    this.iframe.contentWindow.focus();
  }

  /**
   * @memberof FocusPlugin
   */
  blur() {
    if (!this.hasDom) {
      return;
    }
    this.iframe.contentWindow.blur();
  }

  /**
   * @memberof FocusPlugin
   */
  manageFocus(string = 'dunno') {
    console.log('SOURCE: ', string);
    // Unfocus on the iframe
    if (this._keepFocus) {
      console.log('keepFocus');
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

        this.pause = Boolean(this._containerBlurred && this._appBlurred);

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
    console.log('keepfocus', $event.data);
    this._keepFocus = !!$event.data;
    this.manageFocus('keep focuys');
  }

  /**
   * Handle focus events sent from iFrame children
   * @method onFocus
   * @private
   */
  onFocus($event) {
    console.log('app focused', $event.data);
    this._appBlurred = !$event.data;
    this.manageFocus('onFocus');
  }

  /**
   * Handle focus events sent from container's window
   * @method onContainerFocus
   * @private
   */
  onContainerFocus(e) {
    console.log('onContainerFocus()', e.type);
    this._containerBlurred = false;
    this.manageFocus('focus');
  }

  /**
   * Handle blur events sent from container's window
   * @method onContainerBlur
   * @private
   */
  onContainerBlur(e) {
    console.log('onContainerBlur()', e.type);
    //Set both container and application to blurred,
    //because some blur events are only happening on the container.
    //If container is blurred because application area was just focused,
    //the application's focus event will override the blur imminently.
    this._containerBlurred = this._appBlurred = true;
    this.manageFocus('blur');
  }

  /**
   *
   *
   * @memberof PausePlugin
   */
  onPauseToggle() {
    //this._isManualPause = this.paused;
    this._isManualPause = !this._isManualPause;
    this.pause = !this._paused;
  }

  /**
   *
   * @param {Container} container
   * @memberof FocusPlugin
   */
  init({ iframe }) {
    this.iframe = iframe;
    this.client.on(
      'features',
      function(features) {
        if (features.disablePause) {
          this.pauseDisabled = true;
        }

        for (let i = 0, l = this._pauseButton.length; i < l; i++) {
          this._pauseButton[i].displayButton(features.data);
        }
      }.bind(this)
    );
    this.client.on('focus', this.onFocus.bind(this));
    this.client.on('keepFocus', this.onKeepFocus.bind(this));

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
    return Boolean(null !== this.iframe && this.iframe.contentWindow);
  }

  /**
   * @readonly
   * @memberof PausePlugin
   */
  get pauseButton() {
    const buttons = [];
    for (let i = 0, l = this._pauseButton.length; i < l; i++) {
      buttons.push(this._pauseButton[i].button);
    }
    return buttons;
  }
}
