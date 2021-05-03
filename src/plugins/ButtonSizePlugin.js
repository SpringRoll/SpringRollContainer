import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class ButtonSizePlugin
 * @property {object[]} sliders An array of slider objects given to ButtonSizePlugin
 * @property {number} currentValue The current button size value
 * @extends {SliderPlugin}
 */
export class ButtonSizePlugin extends SliderPlugin {
  /**
   * Creates an instance of ButtonSizePlugin.
   * @param {string | HTMLElement} buttonSliders selector string or html element(s) for the inputs
   * @param {object} options
   * @param {number} [options.defaultButtonSize=0.5]
   * @memberof ButtonSizePlugin
   */
  constructor(buttonSliders, { defaultButtonSize = 0.5 } = {}) {
    super(buttonSliders, 'UISize-Button-Plugin', { defaultValue: defaultButtonSize, featureName: ButtonSizePlugin.buttonSizeKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onButtonSizeChange.bind(this));
    }
  }

  /**
   * @memberof ButtonSizePlugin
   * @param {Event} e
   */
  onButtonSizeChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(ButtonSizePlugin.buttonSizeKey, this.currentValue);
  }

  /**
   * Get ButtonSize Key
   * @readonly
   * @static
   * @memberof ButtonSizePlugin
   * @returns {string}
   */
  static get buttonSizeKey() {
    return 'buttonSize';
  }
}
