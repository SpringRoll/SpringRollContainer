import { BasePlugin } from './BasePlugin';

/**
 * @class Container
 */

export class PausePlugin extends BasePlugin {
  constructor({ pauseButton, bellhop }) {
    super(80);
    /**
     * Reference to the pause application button
     * @property {HTMLElement} pauseButton
     */
    this.pauseButton = document.querySelectorAll(pauseButton);

    if (!(this.pauseButton instanceof HTMLElement)) {
      return;
    }

    const onPauseToggle = this.onPauseToggle.bind(this);
    this.pauseButton.forEach(e => e.addEventListener('click', onPauseToggle));

    this._isManualPause = false;
    this._disablePause = false;
    this._paused = false;
    this.client = bellhop;

    /**
     * If the current application is paused
     * @property {Boolean} paused
     * @default false
     */

    this.client.on(
      'features',
      function(features) {
        if (features.disablePause) this._disablePause = true;
      }.bind(this)
    );
  }

  onPauseToggle() {
    this.paused = !this.paused;
    this._isManualPause = this.paused;
  }
  opened() {
    this.pauseButton.forEach(element => element.classList.remove('disabled'));
    this.pause = this._paused;
  }

  close() {
    this.pauseButton.forEach(element => this._disableButton.bind(element));
    this.paused = false;
  }

  teardown() {
    const onPauseToggle = this.onPauseToggle.bind(this);
    this.pauseButton.forEach(element =>
      element.removeEventListener('click', onPauseToggle)
    );
  }

  set pause(paused) {
    if (!this._disablePause) {
      this._paused = paused;
      this.client.send('pause', paused);
      this.client.trigger(paused ? 'paused' : 'resumed');
      this.client.trigger('pause', paused);

      // Set the pause button state
      this.pauseButton.forEach(element => {
        element.classList.remove('unpaused');
        element.classList.remove('paused');
        element.classList.add(paused ? 'paused' : 'unpaused');
      });
    }
  }
  get pause() {
    return this._paused;
  }
}
