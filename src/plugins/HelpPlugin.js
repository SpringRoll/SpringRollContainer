import { ButtonPlugin } from './ButtonPlugin';
import { Button } from '../ui-elements/Button';

/**
 *
 *
 * @export
 * @class HelpPlugin
 * @extends {ButtonPlugin}
 */
export class HelpPlugin extends ButtonPlugin {
  /**
   *Creates an instance of HelpPlugin.
   * @param {string} helpButtons
   * @memberof HelpPlugin
   */
  constructor(helpButtons) {
    super('Help-Button-Plugin');

    this._helpButtons = [];

    if (helpButtons instanceof HTMLElement) {
      this._helpButtons[0] = new Button({
        button: helpButtons,
        onClick: this.helpButtonClick.bind(this),
        channel: 'hints' // the check to see if this feature exists is different than most so passing this ensures it'll work the same.
      });
    } else {
      document.querySelectorAll(helpButtons).forEach((button) => {
        this._helpButtons.push(
          new Button({
            button: button,
            onClick: this.helpButtonClick.bind(this),
            channel: 'hints'
          })
        );
      });
    }

    this.paused = false;
    this._helpEnabled = false;
    this.onPause = this.onPause.bind(this);
    this.helpButtonsLength = this._helpButtons.length;

    if (this.helpButtonsLength <= 0) {
      console.warn('SpringRollContainer: HelpPlugin was not provided any valid button elements');
    }
  }
  /**
   *  Called when the game is either paused or resumed
   * @param {object} $event
   * @memberof HelpPlugin
   */
  onPause($event) {
    this.paused = $event.data.paused;
    // Disable the help button when paused if it's active
    if (
      this.paused &&
      this.helpEnabled
    ) {
      for (let i = 0; i < this.helpButtonsLength; i++) {
        this._helpButtons[i].button.setAttribute('data-paused', 'true');
      }
      this.helpEnabled = false;
    } else {
      for (let i = 0; i < this.helpButtonsLength; i++) {
        if (this._helpButtons[i].button.getAttribute('data-paused')) {
          this._helpButtons[i].button.setAttribute('data-paused', '');
          this.helpEnabled = true;
        }
      }
    }
  }

  /**
   *
   *
   * @memberof HelpPlugin
   */
  helpButtonClick() {
    if (
      !this.paused &&
      this.helpEnabled
    ) {
      this.client.send('playHelp');
    }
  }

  /**
   * @memberof HelpPlugin
   */
  init() {
    // Handle pause
    this.client.on('paused', this.onPause.bind(this));

    // Handle features changed
    this.client.on(
      'features',
      function(features) {
        this.helpEnabled = features.data.hints;
        for (let i = 0; i < this.helpButtonsLength; i++) {
          this._helpButtons[i].displayButton(features.data);
        }
      }.bind(this)
    );

    // if (!(this._helpButton.button instanceof HTMLElement)) {
    //   return;
    // }
    this.client.on(
      'helpEnabled',
      function(event) {
        this._helpEnabled = !!event.data;
      }.bind(this)
    );
  }

  /**
   * @memberof HelpPlugin
   */
  get helpEnabled() {
    return this._helpEnabled;
  }

  /**
   * Fired when the enabled status of the help button changes
   * @event helpEnabled
   * @param {boolean} enabled If the help button is enabled
   * @memberof HelpPlugin
   */
  set helpEnabled(enabled) {
    this._helpEnabled = enabled;
    for (let i = 0; i < this.helpButtonsLength; i++) {
      this._helpButtons[i].button.classList.remove('disabled');
      this._helpButtons[i].button.classList.remove('enabled');
      this._helpButtons[i].button.classList.add(enabled ? 'enabled' : 'disabled');
    }

    this.client.trigger('helpEnabled');
  }

}
