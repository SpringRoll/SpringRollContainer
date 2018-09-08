import { BasePlugin } from './BasePlugin';
import { SavedData } from '../SavedData';
/**
 * @module Container
 * @namespace springroll
 */

export class ButtonPlugin extends BasePlugin {
  constructor(bellhop) {
    super(100);
    this.sendMutes = false;
    this.client = bellhop;
  }

  setup() {
    this.sendMutes = true;
  }

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

  reset() {
    this.sendMutes = false;
  }

  _setMuteProp(prop, button, muted) {
    if (Array.isArray(button)) {
      button.forEach(b => this.removeListeners(b));
    } else {
      this.removeListeners(button);
    }

    SavedData.write(prop, muted);

    if (this.client instanceof Bellhop && this.sendMutes) {
      this.client.send(prop, muted);
    }
  }

  removeListeners(button) {
    if (button instanceof HTMLElement) {
      return;
    }

    button.classList.remove('unmuted');
    button.classList.remove('muted');
    button.classList.add(this.sendMutes ? 'muted' : 'unmuted');
  }
}
