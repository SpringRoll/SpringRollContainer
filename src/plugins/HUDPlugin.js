import { BasePlugin } from './BasePlugin';

/**
 * @export
 * @class HUDPlugin
 * @extends {BasePlugin}
 */
export class HUDPlugin extends BasePlugin {
  /**
   * Creates an instance of HUDPlugin
   * @param {object} params
   * @param {Array<string | HTMLElement>} [params.controls]
   * @memberof HUDPlugin
   */
  constructor({ positions } = {}) {
    super('HUD-Layout-Plugin');

    this.positionControls = [];

    //get the html elements that represent the positions(buttons, checkboxes, etc)
    for (let i = 0, l = positions.length; i < l; i++) {
      this.positionControls.push(
        positions[i] instanceof HTMLElement
          ? positions[i]
          : document.querySelector(positions[i])
      );
    }

    for (let i = 0, l = this.positionControls.length; i < l; i++) {
      this.positionControls[i].addEventListener('click', () => {
        this.onHUDToggle(this.positionControls[i]);
      });
    }
  }

  /**
   * @memberof HUDPlugin
   * @param {HTMLElement} position
   */
  onHUDToggle(position) {
    this.sendProperty(HUDPlugin.hudPositionKey, position.id);

    if (position.type !== 'checkbox') {
      return;
    }

    for (let i = 0, l = this.positionControls.length; i < l; i++) {
      this.positionControls[i].checked = false;
    }

    position.checked = true;
  }

  /**
   * @memberof HUDPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        return features;
        //for loop to iterate through position controls and display them or not.
      }.bind(this)
    );
  }

  /**
   * @static
   * @readonly
   * @memberof HUDPlugin
   */
  static get hudPositionKey() {
    return 'hudPosition';
  }
}
