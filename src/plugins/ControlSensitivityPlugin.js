import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class ControlSensitivityPlugin
 * @property {object[]} sliders an array of all slider objects attached to ControlSensitivityPlugin
 * @extends {SliderPlugin}
 */
export class ControlSensitivityPlugin extends SliderPlugin {
  /**
   * Creates an instance of ControlSensitivityPlugin.
   * @param {string | HTMLElement} sensitivitySliders
   * @param {number} [defaultSensitivity=0.5]
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
   * @returns {string}
   */
  static get controlSensitivityKey() {
    return 'controlSensitivity';
  }
}
