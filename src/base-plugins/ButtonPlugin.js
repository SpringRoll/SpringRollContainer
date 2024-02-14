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
  init(container) {
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
   * @param {Boolean} disableSend
   * @memberof ButtonPlugin
   */
  _setMuteProp(prop, button, muted, disableSend = false) {
    if (Array.isArray(button)) {
      button.forEach(b => this.changeMutedState(b, muted));
    } else {
      this.changeMutedState(button, muted);
    }

    this.sendProperty(prop, muted, disableSend);
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
    //most times button will be a Button class rather than an HTMLElement
    //But just in case the Button ui-element is not being used
    const htmlButton = button.button ? button.button : button;

    if (!(htmlButton instanceof HTMLElement)) {
      return;
    }

    htmlButton.classList.remove('unmuted');
    htmlButton.classList.remove('muted');
    htmlButton.classList.add(muted ? 'muted' : 'unmuted');
  }
}
