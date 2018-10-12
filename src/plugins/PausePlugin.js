import { ButtonPlugin } from './ButtonPlugin';

/**
 * @class Container
 */
export class PausePlugin extends ButtonPlugin {
  /**
   *Creates an instance of PausePlugin.
   * @param {string} pauseButton
   * @memberof PausePlugin
   */
  constructor(pauseButton) {
    super('Pause-Button-plugin');
    /**
     * Reference to the pause application button
     * @property {HTMLElement} pauseButton
     */
    this.pauseButton = document.querySelectorAll(pauseButton);

    if (1 > this.pauseButton.length) {
      return;
    }

    const onPauseToggle = this.onPauseToggle.bind(this);
    this.pauseButton.forEach(e => e.addEventListener('click', onPauseToggle));

    this._isManualPause = false;
    this._disablePause = false;
    this._paused = false;

    /**
     * If the current application is paused
     * @property {Boolean} paused
     * @default false
     */

    this.client.on(
      'features',
      function(features) {
        if (features.disablePause) {
          this._disablePause = true;
        }
      }.bind(this)
    );
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
   *
   *
   * @memberof PausePlugin
   */
  opened() {
    this.pauseButton.forEach(element => element.classList.remove('disabled'));
    this.pause = this._paused;
  }

  /**
   *
   *
   * @memberof PausePlugin
   */
  close() {
    this.pauseButton.forEach(element => this._disableButton.bind(element));
    this.paused = false;
  }

  /**
   *
   *
   * @memberof PausePlugin
   */
  teardown() {
    const onPauseToggle = this.onPauseToggle.bind(this);
    this.pauseButton.forEach(element =>
      element.removeEventListener('click', onPauseToggle)
    );
  }

  /**
   *
   *
   * @memberof PausePlugin
   */
  set pause(paused) {
    paused = !!paused;
    if (!this._disablePause) {
      this._paused = paused;
      this.client.send('pause', paused);
      this.client.trigger(paused ? 'paused' : 'resumed');

      // Set the pause button state
      this.pauseButton.forEach(element => {
        element.classList.remove('unpaused');
        element.classList.remove('paused');
        element.classList.add(paused ? 'paused' : 'unpaused');
      });
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
}
