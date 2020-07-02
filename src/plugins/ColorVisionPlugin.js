import { RadioGroupPlugin } from '../base-plugins/RadioGroupPlugin';
import { SavedData } from '../SavedData';

const COLOR_BLIND_TYPES = [
  'none',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia'
];

/**
 * @export
 * @class ColorVisionPlugin
 * @extends {RadioGroupPlugin}
 */
export class ColorVisionPlugin extends RadioGroupPlugin {
  /**
   *Creates an instance of ColorVisionPlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.colorSelects
   * @memberof ColorVision
   */
  constructor(colorVisionRadios, { defaultValue = COLOR_BLIND_TYPES[0] } = {}) {
    super(colorVisionRadios, 'Color-Filter-Plugin', {supportedValues: COLOR_BLIND_TYPES, initialValue: defaultValue, controlName: 'Color Vision Selector', featureName: ColorVisionPlugin.colorVisionKey, radioCount: COLOR_BLIND_TYPES.length});

    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.sendAfterFetch = false;
    this.canEmit = false;
    this.colors = [];

    this.colorRadiosLength = this.colorDropdowns.length;

    if (this.colorRadiosLength <= 0) {
      this.warn('Plugin was not provided any valid HTML elements');
      return;
    }

    for (let i = 0; i < this.colorRadiosLength; i++) {
      this.radioGroups[i].enableRadioEvents(this.onColorChange.bind(this));
    }
  }

  /**
   * @memberof ColorVisionPlugin
   * @param {Event} e
   */
  onColorChange(e) {
    //return if a radio button is programmatically clicked when it is hidden from the user
    if (this.positions.indexOf(e.target.value) === -1) {
      for (let i = 0; i < this.colorRadiosLength; i++) {
        this.radioGroups[i].radioGroup[this.currentValue].checked = true;
      }
      return;
    }
    this.currentValue = e.target.value;

    this.sendProperty(
      ColorVisionPlugin.colorVisionKey,
      this.currentValue
    );
  }

  /**
   * @memberof ColorVisionPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data || !features.data.colorVision) {
          return;
        }
        if (this.colorDropdownsLength <= 0) {
          return;
        }

        //get the game's reported colors to build out accepted filters array
        this.client.fetch('colorFilters', result => {
          for (let i = 0, l = result.data.length; i < l; i++) {
            if (
              !COLOR_BLIND_TYPES.includes(result.data[i].toLowerCase())
            ) {
              this.warn(`${result.data[i]} is an invalid color vision name`);
              continue;
            }
            this.colors.push(result.data[i]);
          }

          for (let i = 0; i < this.colorRadiosLength; i++) {
            //Hide any radio buttons that aren't in the game's filter list.
            for (const key in this.radioGroups[i].radioGroup) {
              this.radioGroups[i].radioGroup[key].style.display = this.colors.indexOf(this.radioGroups[i].radioGroup[key].value) !== -1 ? '' : 'none';
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
  * @memberof ColorVisionPlugin
  */
  start() {
    const data = SavedData.read(this.colorVisionKey);

    if (COLOR_BLIND_TYPES.includes(data)) {
      this.currentValue = data;
    }

    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
*
* Sends initial caption properties to the application
* @memberof ColorVisionPlugin
*/
  sendAllProperties() {
    if (this.canEmit) {
      this.sendProperty(ColorVisionPlugin.colorVisionKey, this.currentValue);
    } else {
      this.sendAfterFetch = true;
    }
  }

  /**
   * @readonly
   * @static
   * @memberof ColorVisionPlugin
   */
  static get colorVisionKey() {
    return 'colorVision';
  }

}
