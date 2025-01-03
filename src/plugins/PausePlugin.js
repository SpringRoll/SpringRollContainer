import { ButtonPlugin } from '../base-plugins';
import { PageVisibility } from '../PageVisibility';
import { Button } from '../ui-elements';
/**
 * @class Container
 * @property {object[]} sliders an array of all slider objects attached to PausePlugin
 * @extends ButtonPlugin
 */
export class PausePlugin extends ButtonPlugin {
  /**
   * Creates an instance of PausePlugin.
   * @param {string | HTMLElement} pauseButton selector string or HTML Element for the input(s)
   * @param {boolean} manageOwnVisibility whether the plugin should manage container's visibility or some other source will handle it
   * @memberof PausePlugin
   */
  constructor(pauseButton, manageOwnVisibility = true) {
    super('Pause-Button-plugin');
    this._manageOwnVisibility = manageOwnVisibility;
    this._appBlurred = false;
    this._containerBlurred = false;
    this._focusTimer = null;
    this._isManualPause = false;
    this._keepFocus = false;
    this._paused = false;
    this.iframe = null;
    this.focusApp = this.focusApp.bind(this);
    this.manageFocus = this.manageFocus.bind(this);
    this.onKeepFocus = this.onKeepFocus.bind(this);
    this.onFocus = this.onFocus.bind(this);
    const onPauseToggle = this.onPauseToggle.bind(this);

    this.pauseDisabled = false;
    this._pauseButton = [];

    this.pageVisibility = new PageVisibility(
      this.onContainerFocus.bind(this),
      this.onContainerBlur.bind(this)
    );

    this.pageVisibility.enabled = this.manageOwnVisibility;

    if (pauseButton instanceof HTMLElement) {
      this._pauseButton[0] = new Button({
        button: pauseButton,
        onClick: onPauseToggle,
        channel: PausePlugin.pauseKey
      });
    } else {
      document.querySelectorAll(pauseButton).forEach((button) => {
        this._pauseButton.push(new Button({
          button: button,
          onClick: onPauseToggle,
          channel: PausePlugin.pauseKey
        }));
      });
    }
  }

  /**
   * updates _paused and also sends the pause event to the application
   * @memberof PausePlugin
   * @param {Boolean} paused
   */
  set pause(paused) {
    paused = !!paused;

    if (this.pauseDisabled) {
      return;
    }
    this._paused = paused;

    this.client.send(PausePlugin.pauseKey, paused);
    this.client.trigger(paused ? 'paused' : 'resumed', { paused });

    for (let i = 0, l = this._pauseButton.length; i < l; i++) {
      this._pauseButton[i].button.classList.remove('unpaused');
      this._pauseButton[i].button.classList.remove('paused');
      this._pauseButton[i].button.classList.add(paused ? 'paused' : 'unpaused');
    }
  }

  /**
   * @memberof PausePlugin
   * @returns {Boolean}
   */
  get pause() {
    return this._paused;
  }

  /**
   * updates _manageOwnVisibility and also re-enables pageVisibility
   * @memberof PausePlugin
   * @param {Boolean} manageOwnVisibility
   */
  set manageOwnVisibility(manageOwnVisibility) {
    this._manageOwnVisibility = manageOwnVisibility;

    this.pageVisibility.enabled = this._manageOwnVisibility;
  }

  /**
 * @memberof PausePlugin
 * @returns {Boolean}
 */
  get manageOwnVisibility() {
    return this._manageOwnVisibility;
  }

  /**
   * forces focus onto the iframe application window
   * @memberof PausePlugin
   */
  focusApp() {
    if (!this.hasDom) {
      // We don't have a dom with a content window, fail quietly
      return;
    }

    this.iframe.contentWindow.focus();
  }

  /**
   * blurs the application iframe window
   * @memberof PausePlugin
   */
  blurApp() {
    if (!this.hasDom) {
      return;
    }
    this.iframe.contentWindow.blur();
  }

  /**
   * Determines what pause state should be sent, if any, on focus or blur events.
   * @method manageFocus
   * @memberof PausePlugin
   */
  manageFocus() {
    if (!this.manageOwnVisibility) {
      return;
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
      function () {
        this._focusTimer = null;

        if (this._appBlurred && this._containerBlurred) {
          this.pause = true;
        }

        // Focus on the content window when blurring the app
        // but selecting the container
        if (this._keepFocus && !this._containerBlurred && this._appBlurred) {
          this.focusApp();
        }
      }.bind(this),
      100
    );
  }

  /**
   * Handle the keep focus event for the window
   * @method onKeepFocus
   * @memberof PausePlugin
   * @private
   */
  onKeepFocus($event) {
    this._keepFocus = !!$event.data;
    this.manageFocus();
  }

  /**
   * Handle focus events sent from iFrame children
   * @method onFocus
   * @memberof PausePlugin
   * @private
   */
  onFocus($event) {
    this._appBlurred = !$event.data;
    this.manageFocus();
  }

  /**
   * Handle focus events sent from container's window
   * @method onContainerFocus
   * @memberof PausePlugin
   * @private
   */
  onContainerFocus() {
    this._containerBlurred = false;
    this.manageFocus();
  }

  /**
   * Handle blur events sent from container's window
   * @method onContainerBlur
   * @memberof PausePlugin
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
   * @memberof PausePlugin
   */
  onPauseToggle() {
    this._isManualPause = !this._isManualPause;
    this.pause = !this.pause;
  }

  /**
   * @param {Container} container
   * @memberof PausePlugin
   */
  init({ iframe }) {
    this.iframe = iframe;

    this.client.on(
      'features',
      function (features) {
        if (features.disablePause) {
          this.pauseDisabled = true;
        }

        for (let i = 0, l = this._pauseButton.length; i < l; i++) {
          this._pauseButton[i].displayButton(features.data);
        }
      }.bind(this)
    );
    this.client.on('focus', this.onFocus);
    this.client.on('keepFocus', this.onKeepFocus);

    this.pause = this._paused;
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
   * @returns {HTMLButtonElement[]}
   */
  get pauseButton() {
    const buttons = [];
    for (let i = 0, l = this._pauseButton.length; i < l; i++) {
      buttons.push(this._pauseButton[i].button);
    }
    return buttons;
  }

  /**
   * @readonly
   * @static
   * @memberof PausePlugin
   * @returns {string}
   */
  static get pauseKey() {
    return 'pause';
  }
}
