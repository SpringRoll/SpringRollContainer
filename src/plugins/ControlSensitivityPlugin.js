import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class ControlSensitivityPlugin
 * @extends {SliderPlugin}
 */
export class ControlSensitivityPlugin extends SliderPlugin {
  /**
   *Creates an instance of ControlSensitivityPlugin.
   * @param {string | HTMLElement} sensitivitySliders
   * @param {object} options
   * @param {number} [options.defaultSensitivity=0.5]
   * @memberof ControlSensitivityPlugin
   */
  constructor(sensitivitySliders, { defaultSensitivity = 0.5 } = {}) {
    super(sensitivitySliders, 'Control-Sensitivity-Plugin', {defaultValue: defaultSensitivity, featureName: ControlSensitivityPlugin.controlSensitivityKey});

    this.sendAllProperties = this.sendAllProperties.bind(this);

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onControlSensitivityChange.bind(this));
    }
  }

  /**
   * @memberof ControlSensitivityPlugin
   * @param {Event} e
   */
  onControlSensitivityChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(ControlSensitivityPlugin.controlSensitivityKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof ControlSensitivityPlugin
   */
  static get controlSensitivityKey() {
    return 'controlSensitivity';
  }
}
