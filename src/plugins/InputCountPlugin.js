import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class InputCountPlugin
 * @extends {SliderPlugin}
 */
export class InputCountPlugin extends SliderPlugin {
  /**
   *Creates an instance of InputCountPlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.inputCountSliders
   * @param {number} [params.defaultInputCount=0.5]
   * @memberof InputCountPlugin
   */
  constructor(inputCountSliders, { defaultInputCount = 0.5 } = {}) {
    super(inputCountSliders, 'Input-Count-Plugin', { defaultValue: defaultInputCount, featureName: InputCountPlugin.inputCountKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onInputCountChange.bind(this));
    }
  }

  /**
   * @memberof InputCountPlugin
   * @param {Event} target
   * @param {string} control
   */
  onInputCountChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(InputCountPlugin.inputCountKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof InputCountPlugin
   */
  static get inputCountKey() {
    return 'inputCount';
  }
}