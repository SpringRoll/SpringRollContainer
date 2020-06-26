import { BasePlugin } from './BasePlugin';
import { RadioGroup } from '../ui-elements';
import { SavedData } from '../SavedData';

const SUPPORTED_POSITIONS = ['top', 'bottom', 'left', 'right'];

/**
 * @export
 * @class HUDPlugin
 * @extends {BasePlugin}
 */
export class HUDPlugin extends BasePlugin {
  /**
   * Creates an instance of HUDPlugin
   * @param {object} params
   * @param {string | HTMLElement} [params.hudSelectorRadios] string that represents the HTML Radio Buttons that select the HUD Position
   * @memberof HUDPlugin
   */
  constructor(hudSelectorRadios, { defaultValue = 'top' } = {}) {
    super('HUD-Layout-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);

    this.hudPositionSelectors = hudSelectorRadios ? hudSelectorRadios.split(',') : [];

    this.sendAfterFetch = false;
    this.canEmit = false;
    this.hudRadios = [];

    this.positions = [];
    this.currentValue = defaultValue;
    this.defaultValue = defaultValue;

    this.hudRadios = this.setUpHUDRadios(this.hudPositionSelectors);

    this.hudRadiosLength = this.hudRadios.length;
    if (this.hudRadiosLength <= 0) {
      this.warn('Plugin was not provided any valid HTML elements');
    }

    for (let i = 0; i < this.hudRadiosLength; i++) {
      this.hudRadios[i].enableRadioEvents(this.onHUDSelect.bind(this));
    }

  }

  /**
   * @memberof HUDPlugin
   * @param {string[]} selectors the separated selector strings used to target the radio button groups
   * @returns {RadioGroup[]}
   */
  setUpHUDRadios(selectors) {
    const radioGroups = [];

    selectors.forEach((selector) => {
      const radioGroup = new RadioGroup({
        selector: selector.trim(),
        controlName: 'Hud Selector',
        defaultValue: 'top',
        pluginName: 'HUD-Layout-Plugin'
      });

      if (!radioGroup.hasOnly(SUPPORTED_POSITIONS)) {
        return;
      }

      if (radioGroup.hasDuplicateValues()) {
        this.warn(`Duplicate radio button values detected (values: ${radioGroup.values} ). Skipping radio group`);
        return;
      }

      radioGroups.push(radioGroup);
    });

    return radioGroups;
  }

  /**
   * @memberof HUDPlugin
   */
  onHUDSelect(e) {
    //retrun if a radio button is programattically clicked when it is hidden
    if (this.positions.indexOf(e.target.value) === -1) {
      for (let i = 0; i < this.hudRadiosLength; i++) {
        this.hudRadios[i].radioGroup[this.currentValue].checked = true;
      }
      return;
    }

    this.currentValue = e.target.value;

    for (let i = 0; i < this.hudRadiosLength; i++) {
      this.hudRadios[i].radioGroup[e.target.value].checked = true;
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
              !SUPPORTED_POSITIONS.includes(result.data[i].toLowerCase())
            ) {
              this.warn(`${result.data[i]} is an invalid position name`);
              continue;
            }

            this.positions.push(result.data[i]);
          }

          for (let i = 0; i < this.hudRadiosLength; i++) {

            for (const key in this.hudRadios[i].radioGroup) {
              this.hudRadios[i].radioGroup[key].style.display = this.positions.indexOf(this.hudRadios[i].radioGroup[key].value) !== -1 ? '' : 'none';
            }
          }

          this.canEmit = true;
          if (this.sendAfterFetch) {
            this.sendAllProperties();
          }
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
   * @static
   * @readonly
   * @memberof HUDPlugin
   */
  static get hudPositionKey() {
    return 'hudPosition';
  }
}
