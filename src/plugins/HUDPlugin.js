import { ButtonPlugin } from './ButtonPlugin';
import { Button } from '../ui-elements';
import { SavedData } from '../SavedData';

/**
 * @export
 * @class HUDPlugin
 * @extends {BasePlugin}
 */
export class HUDPlugin extends ButtonPlugin {
  /**
   * Creates an instance of HUDPlugin
   * @param {object} params
   * @param {string | HTMLElement} [params.hudSelectorButtons] string or HTML Element that represents the HTML button that toggles through the HUD positions
   * @memberof HUDPlugin
   */
  constructor({ hudSelectorButtons } = {}) {
    super('HUD-Layout-Plugin');

    this.hudSelectorButtons = hudSelectorButtons;
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.sendAfterFetch = false;
    this.canEmit = false;
    this.hudButtons = [];
    this.supportedPositions = ['top', 'bottom', 'left', 'right'];
    this.positions = [];
    this.currentPos = 0; //always start at beginning of array
    this.hudButtonsLength = 0;

    //create button elements AFTER the fetch from the application has occured.
    if (this.hudSelectorButtons instanceof HTMLElement) {
      this.hudButtons[0] = new Button({
        button: this.hudSelectorButtons,
        onClick: this.onHUDToggle.bind(this),
        channel: 'hudPosition'
      });
    } else {
      document.querySelectorAll(this.hudSelectorButtons).forEach((button) => {
        this.hudButtons.push(
          new Button({
            button: button,
            onClick: this.onHUDToggle.bind(this),
            channel: HUDPlugin.hudPositionKey
          })
        );
      });
    }

    this.hudButtonsLength = this.hudButtons.length;
    if (this.hudButtonsLength <= 0) {
      console.warn('SpringRollContainer: HUDPlugin was not provided any valid HTML elements');
    }

  }

  /**
   * @memberof HUDPlugin
   */
  onHUDToggle() {
    this.currentPos =
      this.currentPos + 1 < this.positions.length
        ? this.currentPos + 1
        : (this.currentPos = 0);

    for (let i = 0; i < this.hudButtonsLength; i++) {
      this.hudButtons[i].button.dataset['hudPosition'] = this.positions[this.currentPos];
    }

    this.sendProperty(
      HUDPlugin.hudPositionKey,
      this.positions[this.currentPos]
    );
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
        //get the game's reported HUD positions to build out positions array
        this.client.fetch('hudPositions', result => {
          for (let i = 0, l = result.data.length; i < l; i++) {
            if (
              !this.supportedPositions.includes(result.data[i].toLowerCase())
            ) {
              console.warn(`HUDPlugin: ${result.data[i]} is an invalid position name`);
              continue;
            }

            this.positions.push(result.data[i]);
          }

          this.canEmit = true;
          if (this.sendAfterFetch) {
            this.sendAllProperties();
          }
        });

        for (let i = 0; i < this.hudButtonsLength; i++) {
          this.hudButtons[i].displayButton(features.data);
        }

      }.bind(this)
    );
  }

  /**
  * @memberof HUDPlugin
  */
  start() {
    const data = this.positions.indexOf(SavedData.read(this.hudPositionKey));
    if (data >= 0) {
      this.currentPos = data;
    }
    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
*
* Sends initial HUD position properties to the application
* @memberof HUDPlugin
*/
  sendAllProperties() {
    if (this.canEmit) {
      this.sendProperty(HUDPlugin.hudPositionKey, this.positions[this.currentPos]);
    } else {
      this.sendAfterFetch = true;
    }
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
