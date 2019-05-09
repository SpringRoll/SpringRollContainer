import { ButtonPlugin } from './ButtonPlugin';

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
    this.helpButton = document.querySelector(helpButton);
    this.paused = false;
    this._helpEnabled = false;
    this.onPause = this.onPause.bind(this);
    this.helpButton.addEventListener('click', this.helpButtonClick.bind(this));
  }
  /**
   *  Called when the game is either paused or resumed
   * @param {object} $event
   * @memberof HelpPlugin
   */
  onPause($event) {
    this.paused = $event.data.paused;
    // Disable the help button when paused if it's active
    if (this.paused && !this.helpButton.classList.contains('disabled')) {
      this.helpButton.setAttribute('data-paused', 'true');
      this.helpEnabled = false;
    } else if (this.helpButton.getAttribute('data-paused')) {
      this.helpButton.setAttribute('data-paused', '');
      this.helpEnabled = true;
    }
  }

  /**
   *
   *
   * @memberof HelpPlugin
   */
  helpButtonClick() {
    if (!this.paused && !this.helpButton.classList.contains('disabled')) {
      this.client.send('playHelp');
    }
  }

  /**
   *
   *
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
        this.helpButton.style.display = this.helpEnabled
          ? 'inline-block'
          : 'none';
      }.bind(this)
    );

    if (!(this.helpButton instanceof HTMLElement)) {
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
   *
   *
   * @memberof HelpPlugin
   */
  set helpEnabled(enabled) {
    this._helpEnabled = enabled;
    this.helpButton.classList.remove('disabled');
    this.helpButton.classList.remove('enabled');
    this.helpButton.classList.add(enabled ? 'enabled' : 'disabled');

    /**
     * Fired when the enabled status of the help button changes
     * @event helpEnabled
     * @param {boolean} enabled If the help button is enabled
     */
    this.client.trigger('helpEnabled');
  }
}
