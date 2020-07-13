import { RadioGroupPlugin } from '../base-plugins';
import { SavedData } from '../SavedData';

const SUPPORTED_POSITIONS = ['top', 'bottom', 'left', 'right'];

/**
 * @export
 * @class HUDPlugin
 * @extends {BasePlugin}
 */
export class HUDPlugin extends RadioGroupPlugin {
  /**
   * Creates an instance of HUDPlugin
   * @param {string} hudSelectorRadios css selector for the radio buttons
   * @param {object} params
   * @param {string[]} [params.defaultValue='top'] default value for the HUD position. Top will usually be the default in most cases.
   * @memberof HUDPlugin
   */
  constructor(hudSelectorRadios, { defaultValue = SUPPORTED_POSITIONS[0] } = {}) {
    super(hudSelectorRadios, 'HUD-Layout-Plugin', {supportedValues: SUPPORTED_POSITIONS, initialValue: defaultValue, controlName: 'Hud Selector', featureName: HUDPlugin.hudPositionKey, radioCount: SUPPORTED_POSITIONS.length});

    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.sendAfterFetch = false;
    this.canEmit = false;
    this.positions = [];

    if (this.radioGroupsLength <= 0) {
      this.warn('Plugin was not provided any valid HTML elements');
    }

    for (let i = 0; i < this.radioGroupsLength; i++) {
      this.radioGroups[i].enableRadioEvents(this.onHUDSelect.bind(this));
    }

  }

  /**
   * @memberof HUDPlugin
   * @param {Event} e
   */
  onHUDSelect(e) {
    //return if a radio button is programattically clicked when it is hidden
    if (!this.positions.includes(e.target.value)) {
      for (let i = 0; i < this.radioGroupsLength; i++) {
        this.radioGroups[i].radioGroup[this.currentValue].checked = true;
      }
      return;
    }

    this.currentValue = e.target.value;

    this.sendProperty(
      HUDPlugin.hudPositionKey,
      this.currentValue
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

        if (this.radioGroupsLength <= 0) {
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

            this.positions.push(result.data[i].toLowerCase());
          }

          for (let i = 0; i < this.radioGroupsLength; i++) {
            //Hide any radio buttons that aren't in the game's position list.
            for (const key in this.radioGroups[i].radioGroup) {
              this.radioGroups[i].radioGroup[key].style.display = this.positions.includes(this.radioGroups[i].radioGroup[key].value) ? '' : 'none';
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
    const data = SavedData.read(this.hudPositionKey);

    if (SUPPORTED_POSITIONS.includes(data)) {
      this.currentValue = data;
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
      this.sendProperty(HUDPlugin.hudPositionKey, this.currentValue);
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
