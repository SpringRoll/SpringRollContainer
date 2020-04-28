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
   * @param {string | HTMLElement} [params.button] string or HTML Element that represents the HTML button that toggles through the HUD positions
   * @memberof HUDPlugin
   */
  constructor({ hudSelectorButton } = {}) {
    super('HUD-Layout-Plugin');

    this.hudSelectorButton = hudSelectorButton;
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.sendAfterFetch = false;
    this.canEmit = false;
    this._hudButton;
    this.supportedPositions = ['top', 'bottom', 'left', 'right'];
    this.positions = [];
    this.currentPos = 0; //always start at beginning of array


    if (!this.hudSelectorButton) {
      console.warn(
        'SpringRollContainer: HUDPlugin was not provided a button element or selector string'
      );
      return;
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

    this.hudButton.dataset['hudPosition'] = this.positions[this.currentPos];

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
              console.warn(`${result.data[i]} is an invalid position name`);
              continue;
            }

            this.positions.push(result.data[i]);
          }

          this.canEmit = true;
          if (this.sendAfterFetch) {
            this.sendAllProperties();
          }
        });

        //create button element AFTER the fetch from the application has occured.
        this._hudButton = new Button({
          button: this.hudSelectorButton,
          onClick: this.onHUDToggle.bind(this),
          channel: 'hudPosition'
        });
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
   * @readonly
   * @memberof CaptionsPlugin
   */
  get hudButton() {
    return this._hudButton.button;
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
