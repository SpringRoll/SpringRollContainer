import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class ButtonSizePlugin
 * @extends {SliderPlugin}
 *
 */
export class ButtonSizePlugin extends SliderPlugin {
  /**
   *Creates an instance of ButtonSizePlugin.
   * @param {string | HTMLElement} buttonSliders selector string for the inputs
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
   * @memberof ButtonSizePlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
        }
        for (let i = 0; i < this.slidersLength; i++) {
          this.sliders[i].displaySlider(features.data);
        }
      }.bind(this)
    );
  }

  /**
   * @readonly
   * @static
   * @memberof ButtonSizePlugin
   */
  static get buttonSizeKey() {
    return 'buttonSize';
  }
}
