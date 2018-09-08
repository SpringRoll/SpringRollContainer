import { BasePlugin } from './BasePlugin';

export class HelpPlugin extends BasePlugin {
  constructor({ helpButton, bellhop }) {
    super(50);
    this.helpButton = document.querySelector(helpButton);
    this.client = bellhop;
    this.paused = false;
    this._helpEnabled = false;

    if (!(this.helpButton instanceof HTMLElement)) {
      return;
    }
    this.helpButton.addEventListener('click', this.helpButtonClick);

    // Handle pause
    this.client.on(
      'pause',
      function(paused) {
        // Disable the help button when paused if it's active
        if (paused && !this.helpButton.classList.contains('disabled')) {
          this.helpButton.setAttribute('data-paused', true);
          this.helpEnabled = false;
        } else if (this.helpButton.getAttribute('data-paused')) {
          this.helpButton.setAttribute('data-paused', '');
          this.helpEnabled = true;
        }
      }.bind(this)
    );

    // Handle features changed
    this.client.on(
      'features',
      function(features) {
        this.helpButton.style.display = 'none';
        if (features.hints) this.helpButton.style.display = 'inline-block';
      }.bind(this)
    );
  }

  helpButtonClick() {
    if (!this.paused && !this.helpButton.classList.contains('disabled')) {
      this.client.send('playHelp');
    }
  }

  teardown() {
    this.helpButton.removeEventListener(
      'click',
      this.helpButtonClick.bind(this)
    );
  }

  close() {
    this.client.off('helpEnabled');
    this.helpEnabled = false;
  }

  open() {
    this.client.on(
      'helpEnabled',
      function(event) {
        this.helpEnabled = !!event.data;
      }.bind(this)
    );
  }

  get helpEnabled() {
    return this._helpEnabled;
  }

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
    this.client.trigger('helpEnabled', enabled);
  }
}
