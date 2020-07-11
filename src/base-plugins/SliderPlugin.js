import { BasePlugin } from '.';
import { Slider } from '../ui-elements';

/**
 *
 *
 * @export
 * @class SliderPlugin
 */
export class SliderPlugin extends BasePlugin {
  /**
   *
   *Creates an instance of SliderPlugin.
   * @constructor
   * @memberof SliderPlugin
   * @param {string} cssSelector
   * @param {string} name
   * @param {object} options
   * @param {string | number} [options.defaultValue='0.5']
   * @param {string | number} [options.minValue='0']
   * @param {string | number} [options.maxValue='1']
   * @param {string} [options.featureName] Springroll Core feature name that the plugin is supporting
   */
  constructor(cssSelector, name, {defaultValue = '0.5', minValue = '0', maxValue = '1', featureName }) {
    super(name);
    this.featureName = featureName;
    this.minValue = minValue;
    this.defaultValue = defaultValue;
    this.maxValue = maxValue;
    this._currentValue = defaultValue;
    this.sliders = this.setUpSliders(cssSelector);
    this.slidersLength = this.sliders.length;
    this.sendAllProperties = this.sendAllProperties.bind(this);

    if (0 >= this.buttonSlidersLength) {
      this.warn('Plugin was not provided any valid HTML Elements');
      return;
    }
  }

  /**
   * @memberof SliderPlugin
   * @param {string[]} selectors the selector strings used to target the input elements
   * @returns {Slider[]}
   */
  setUpSliders(selectors) {
    const sliders = [];

    if (selectors instanceof HTMLElement) {
      sliders.push(new Slider({
        slider: selectors,
        control: this.featureName,
        defaultValue: this.defaultValue,
        minValue: this.minValue,
        maxValue: this.maxValue
      }));
    } else {
      document.querySelectorAll(selectors).forEach((slider) => {
        sliders.push(new Slider({
          slider: slider,
          control: this.featureName,
          defaultValue: this.defaultValue,
          minValue: this.minValue,
          maxValue: this.maxValue
        }));
      });
    }

    return sliders;
  }

  /**
   * @memberof SliderPlugin
   */
  start() {
    this._currentValue = this.sliders[0].value; //update current value to the saved data value set in Slider.
    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
  *
  * Sends initial caption properties to the application
  * @memberof SliderPlugin
  */
  sendAllProperties() {
    this.sendProperty(this.featureName, this.currentValue);
  }

  /**
   * @memberof SliderPlugin
   * @param {string} newValue
   */
  set currentValue(newValue) {

    //just use first slider to ensure the number is valid.
    this._currentValue = this.sliders[0].sliderRange(Number(newValue));

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].value = newValue;
    }
  }

  /**
   * @memberof SliderPlugin
   * @return {string}
   */
  get currentValue() {
    return this._currentValue;
  }

}
