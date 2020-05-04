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
   * @param {string | HTMLElement} params.colorSelects
   * @memberof ColorVision
   */
  constructor({ colorSelects } = {}) {
    super('Color-Filter-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.colorDropdowns =
      colorSelects instanceof HTMLSelectElement
        ? [colorSelects]
        : document.querySelectorAll(colorSelects);

    this.sendAfterFetch = false;
    this.canEmit = false;
    this.colorVisionValue = '';

    this.colorDropdownsLength = this.colorDropdowns.length;

    if (this.colorDropdowns.length <= 0) {
      console.warn(
        'SpringRollContainer: ColorVisionPlugin was not provided any valid select elements'
      );
      return;
    }

    for (let i = 0; i < this.colorDropdownsLength; i++) {
      this.colorDropdowns[i].innerHTML = '';
    }
  }

  /**
   * @memberof ColorVisionPlugin
   * @param {MouseEvent} e
   */
  onColorChange(e) {
    this.colorVisionValue = e.target.value;

    for (let i = 0; i < this.colorDropdownsLength; i ++) {
      this.colorDropdowns[i].value = this.colorVisionValue;
    }

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
        if (this.colorDropdownsLength <= 0) {
          return;
        }
        for (let i = 0; i < this.colorDropdownsLength; i++) {
          if (this.colorDropdowns[i].tagName.toLowerCase() !== 'select') {
            this.colorDropdowns[i].style.display = 'none';
            console.error(
              `ColorVisionPlugin was given a ${
                this.colorDropdown.tagName
              } but expects an element of type: <select>`
            );
            return;
          }
        }

        //get the game's reported colors to build out positions array
        this.client.fetch('colorFilters', result => {
          for (let i = 0; i < this.colorDropdownsLength; i++) {
            for (let j = 0, l = result.data.length; j < l; j++) {
              if (!COLOR_BLIND_TYPES.includes(result.data[j].toLowerCase())) {
                console.warn(
                  `${result.data[j]} is not a supported color blindness filter. Skipping`
                );
                continue;
              }
              const option = document.createElement('option');
              option.textContent = result.data[j];
              option.value = result.data[j].toLowerCase();

              this.colorDropdowns[i].appendChild(option);
            }

            this.colorDropdowns[i].addEventListener(
              'change',
              this.onColorChange.bind(this)
            );

            this.colorDropdowns[i].style.display = features.data['colorVision']
              ? ''
              : 'none';
          }
          //use the first select to set the default value since they should all be the same
          this.colorVisionValue = this.colorDropdowns[0].value;

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
      this.colorVisionValue = data;

      for (let i = 0; i < this.colorDropdownsLength; i++) {
        this.colorDropdowns[i].value = this.colorVisionValue;
      }
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
