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
   * @param {object} params
   * @param {string | HTMLElement} [params.buttonSliders]
   * @param {number} [params.defaultButtonSize=0.5]
   * @memberof ButtonSizePlugin
   */
  constructor(buttonSliders, { defaultButtonSize = 0.5 } = {}) {
    super(buttonSliders, 'UISize-Button-Plugin', {defaultValue: defaultButtonSize, featureName: ButtonSizePlugin.buttonSizeKey });

    if (this.sliders[0] && this.sliders[0].slider) {
      //in case there's saved data
      this.currentValue = this.sliders[0].value;
    }

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
