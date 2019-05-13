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
   * @param {string} helpButton
   * @memberof HelpPlugin
   */
  constructor(helpButton) {
    super('Help-Button-Plugin');

    this._helpButton = new Button({
      button: helpButton,
      onClick: this.helpButtonClick.bind(this),
      channel: 'hints' // the check to see if this feature exists is different than most so passing this ensures it'll work the same.
    });
    this.paused = false;
    this._helpEnabled = false;
    this.onPause = this.onPause.bind(this);
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
      !this._helpButton.button.classList.contains('disabled')
    ) {
      this._helpButton.button.setAttribute('data-paused', 'true');
      this.helpEnabled = false;
    } else if (this._helpButton.button.getAttribute('data-paused')) {
      this._helpButton.button.setAttribute('data-paused', '');
      this.helpEnabled = true;
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
      !this._helpButton.button.classList.contains('disabled')
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
        this._helpButton.displayButton(features.data);
      }.bind(this)
    );

    if (!(this._helpButton.button instanceof HTMLElement)) {
      return;
    }
    this.client.on(
      'helpEnabled',
      function(event) {
        this._helpEnabled = !!event.data;
      }.bind(this)
    );
  }

  /**
   *
   *
   * @memberof HelpPlugin
   */
  get helpEnabled() {
    return this._helpEnabled;
  }

  /**
   * @memberof HelpPlugin
   */
  set helpEnabled(enabled) {
    this._helpEnabled = enabled;
    this._helpButton.button.classList.remove('disabled');
    this._helpButton.button.classList.remove('enabled');
    this._helpButton.button.classList.add(enabled ? 'enabled' : 'disabled');

    /**
     * Fired when the enabled status of the help button changes
     * @event helpEnabled
     * @param {boolean} enabled If the help button is enabled
     */
    this.client.trigger('helpEnabled');
  }

  /**
   * @readonly
   * @memberof HelpPlugin
   */
  get helpButton() {
    return this._helpButton.button;
  }
}
