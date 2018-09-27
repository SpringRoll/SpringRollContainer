import { BasePlugin } from './BasePlugin';

/**
 *
 *
 * @export
 * @class ButtonPlugin
 * @extends {BasePlugin}
 */
export class ButtonPlugin extends BasePlugin {
  /**
   *Creates an instance of ButtonPlugin.
   * @param {number} priority
   * @memberof ButtonPlugin
   */
  constructor(priority = 100) {
    super(priority);
    this.sendMutes = false;
  }

  /**
   *
   *
   * @memberof ButtonPlugin
   */
  setup() {
    this.sendMutes = true;
  }

  /**
   *
   *
   * @memberof ButtonPlugin
   */
  teardown() {
    this.reset();
  }

  /**
   *
   *
   * @param {HTMLButtonElement} button
   * @memberof ButtonPlugin
   */
  _disableButton(button) {
    if (button instanceof HTMLElement) {
      button.classList.remove('enabled');
      button.classList.add('disabled');
    }
  }

  /**
   *
   *
   * @memberof ButtonPlugin
   */
  reset() {
    this.sendMutes = false;
  }

  /**
   *
   *
   * @param {string} prop
   * @param {HTMLElement} button
   * @param {Boolean} muted
   * @memberof ButtonPlugin
   */
  _setMuteProp(prop, button, muted) {
    if (Array.isArray(button)) {
      button.forEach(b => this.removeListeners(b));
    } else {
      this.removeListeners(button);
    }

    this.sendProperty(prop, muted);
  }

  /**
   *
   *
   * @param {*} button
   * @returns
   * @memberof ButtonPlugin
   */
  removeListeners(button) {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    button.classList.remove('unmuted');
    button.classList.remove('muted');
    button.classList.add(this.sendMutes ? 'muted' : 'unmuted');
  }
}
