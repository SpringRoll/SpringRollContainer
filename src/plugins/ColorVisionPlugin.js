import { BasePlugin } from './BasePlugin';
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
 * @extends {BasePlugin}
 */
export class ColorVisionPlugin extends BasePlugin {
  /**
   *Creates an instance of ColorVisionPlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.colorSelect
   * @memberof ColorVision
   */
  constructor({ colorSelect }) {
    super('Color-Filter-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.colorDropdown =
      colorSelect instanceof HTMLSelectElement
        ? colorSelect
        : document.querySelector(colorSelect);
    this.sendAfterFetch = false;
    this.canEmit = false;
    this.colorVisionValue = '';

    if (!this.colorDropdown) {
      console.error(
        'ColorVisionPlugin was not provided with a correct selector string'
      );
      return;
    }

    this.colorDropdown.innerHTML = '';
  }

  /**
   * @memberof ColorVisionPlugin
   */
  onColorChange() {
    this.colorVisionValue = this.colorDropdown.value;
    this.sendProperty(
      ColorVisionPlugin.colorVisionKey,
      this.colorVisionValue
    );
  }

  /**
   * @memberof ColorVisionPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
        }
        if (!this.colorDropdown) {
          return;
        }
        if (this.colorDropdown.tagName.toLowerCase() !== 'select') {
          this.colorDropdown.style.display = 'none';
          console.error(
            `ColorVisionPlugin was given a ${
              this.colorDropdown.tagName
            } but expects an element of type: <select>`
          );
          return;
        }
        //get the game's reported colors to build out positions array
        this.client.fetch('colorFilters', result => {
          for (let i = 0, l = result.data.length; i < l; i++) {
            if (!COLOR_BLIND_TYPES.includes(result.data[i].toLowerCase())) {
              console.warn(
                `${result.data[i]} is not a supported color blindness filter`
              );
              continue;
            }
            const option = document.createElement('option');
            option.textContent = result.data[i];
            option.value = result.data[i].toLowerCase();

            this.colorDropdown.appendChild(option);
          }
          this.colorDropdown.addEventListener(
            'change',
            this.onColorChange.bind(this)
          );

          this.colorVisionValue = this.colorDropdown.value;

          this.canEmit = true;
          if (this.sendAfterFetch) {
            this.sendAllProperties();
          }
        });
        this.colorDropdown.style.display = features.data['colorVision']
          ? ''
          : 'none';
      }.bind(this)
    );
  }

  /**
  * @memberof ColorVisionPlugin
  */
  start() {
    const data = SavedData.read(this.colorVisionKey);

    if (COLOR_BLIND_TYPES.includes(data)) {
      this.colorVisionValue = data;
      this.colorDropdown.value = this.colorVisionValue;
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
      this.sendProperty(ColorVisionPlugin.colorVisionKey, this.colorVisionValue);
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
