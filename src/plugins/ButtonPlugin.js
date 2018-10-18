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
   * @param {string} name
   * @param {Array<String>} [required] The list of required plugins (by name) that this plugin depends on
   * @param {Array<String>} [optional] The list of optional plugins (by name) that this plugin depends on
   *
   * @memberof ButtonPlugin
   */
  constructor(name, required = [], optional = []) {
    super(name, required, optional);
    this.sendMutes = false;
  }
  /* eslint-disable */
  /**
   * @memberof ButtonPlugin
   * @param {SpringRollContainer.Container} [container]   */

  setup(container) {
    this.sendMutes = true;
  }

  /**
   * @memberof ButtonPlugin
   * @param {SpringRollContainer.Container} [container]
   */
  teardown(container) {
    this.reset();
  }

  /* eslint-enable */

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
