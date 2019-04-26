/* eslint-disable no-unused-vars */
import { BasePlugin } from './BasePlugin';
import { Container } from '../Container';

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
   * @param {string} name
   *
   * @memberof ButtonPlugin
   */
  constructor(name) {
    super(name);
    this.sendMutes = false;
  }

  /**
   * @memberof ButtonPlugin
   * @param {Container} [container]
   */
  setup(container) {
    // eslint-disable-line no-unused-vars
    this.sendMutes = true;
  }

  /**
   *
   * Applies the disabled class to the provided element
   * @param {HTMLButtonElement | Element} button
   * @memberof ButtonPlugin
   */
  _disableButton(button) {
    if (button instanceof HTMLButtonElement) {
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
   * @param {Element} button
   * @param {Boolean} muted
   * @memberof ButtonPlugin
   */
  _setMuteProp(prop, button, muted) {
    if (Array.isArray(button)) {
      button.forEach(b => this.changeMutedState(b, muted));
    } else {
      this.changeMutedState(button, muted);
    }

    this.sendProperty(prop, muted);
  }

  /**
   *
   *
   * @param {Element} button
   * @param {Boolean} muted
   * @returns
   * @memberof ButtonPlugin
   */
  changeMutedState(button, muted = false) {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    button.classList.remove('unmuted');
    button.classList.remove('muted');
    button.classList.add(muted ? 'muted' : 'unmuted');
  }
}
