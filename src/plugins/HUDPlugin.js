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
   * @param {string} [params.positions] string that represents the name of the radio button group
   * @memberof HUDPlugin
   */
  constructor({ positions } = {}) {
    super('HUD-Layout-Plugin');
    this.radioGroupName = positions;

    this.positionControls =
      positions instanceof HTMLElement
        ? positions
        : document.querySelectorAll(`input[name="${this.radioGroupName}"]`);

    for (let i = 0, l = this.positionControls.length; i < l; i++) {
      this.positionControls[i].addEventListener('click', () => {
        this.onHUDToggle(this.positionControls[i]);
      });
    }
  }

  /**
   * @memberof HUDPlugin
   * @param {HTMLElement} pos the radio button that was clicked
   */
  onHUDToggle(pos) {
    pos.checked = true; //to ensure the radio button reflects its selected state to the user.
    this.sendProperty(HUDPlugin.hudPositionKey, pos.value);
  }

  /**
   * @memberof HUDPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
        }
        for (let i = 0, l = this.positionControls.length; i < l; i++) {
          this.positionControls[i].style.display = features.data.hudPosition
            ? ''
            : 'none';
        }
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
