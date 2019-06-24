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
   * @param {string | HTMLElement} [params.positionsContainer] string or HTML Element that represents the container that the radio buttons should be added to
   * @memberof HUDPlugin
   */
  constructor({ positionsContainer } = {}) {
    super('HUD-Layout-Plugin');

    this.positionControls =
      positionsContainer instanceof HTMLElement
        ? positionsContainer
        : document.querySelector(positionsContainer);

    this.radioButtons = [];
    this.currentPos;
  }

  /**
   * @memberof HUDPlugin
   * @param {HTMLElement} pos the radio button that was clicked
   */
  onHUDToggle(pos) {
    this.currentPos = pos.value;
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
        if (!features.data || !features.data.hudPosition) {
          return;
        }
        //get the game's reported HUD positions and build out the radio buttons
        this.client.fetch('positions', result => {
          for (let i = 0, l = result.data.length; i < l; i++) {
            const radio = document.createElement('input');
            radio.id = `radio-${result.data[i]}`;
            radio.name = 'hud-positions';
            radio.type = 'radio';
            radio.value = result.data[i];

            const label = document.createElement('label');
            label.htmlFor = radio.id;
            label.innerHTML = result.data[i];

            this.positionControls.appendChild(label);
            this.positionControls.appendChild(radio);

            radio.addEventListener('click', () => {
              this.onHUDToggle(radio);
            });

            this.radioButtons.push(radio);
          }

          //set the currentPos to the first radio button(assume the first position is the default)
          //also set it to checked to match.
          this.radioButtons[0].checked = true;
          this.currentPos = this.radioButtons[0].value;
        });
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
