import { BasePlugin } from './BasePlugin';

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

    this.colorDropdown =
      colorSelect instanceof HTMLSelectElement
        ? colorSelect
        : document.querySelector(colorSelect);

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
    this.sendProperty(
      ColorVisionPlugin.colorVisionKey,
      this.colorDropdown.value
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
        //get the game's reported HUD positions to build out positions array
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
        });
        this.colorDropdown.style.display = features.data['colorVision']
          ? ''
          : 'none';
      }.bind(this)
    );
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
