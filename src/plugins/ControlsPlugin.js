import { ButtonPlugin } from './ButtonPlugin';
import { Slider } from '../classes/Slider';

const SENSITIVITY_SLIDER_MIN = 0.1;

const SENSITIVITY_SLIDER_STEP = 0.1;

/**
 * @export
 * @class ControlsPlugin
 * @extends {ButtonPlugin}
 */
export class ControlsPlugin extends ButtonPlugin {
  /**
   *Creates an instance of ControlsPlugin.
   * @param {object} params
   * @param {string | HTMLElement} [params.sensitivitySlider]
   * @memberof ControlsPlugin
   */
  constructor({ sensitivitySlider, sensitivity = 0.5 } = {}) {
    super('Control-Button-Plugin');

    this.controlSensitivity = sensitivity;

    this.sensitivitySlider = new Slider({
      slider: sensitivitySlider,
      control: ControlsPlugin.controlSensitivityKey,
      min: SENSITIVITY_SLIDER_MIN,
      step: SENSITIVITY_SLIDER_STEP,
      value: this.controlSensitivity
    });

    this.sensitivitySlider.enableSliderEvents(
      this.onControlSensitivityChange.bind(this)
    );
  }

  /**
   * @memberof ControlsPlugin
   */
  onControlSensitivityChange() {
    this.controlSensitivity = this.sensitivitySlider.sliderRange(
      Number(this.sensitivitySlider.slider.value)
    );
    this.sendProperty(
      ControlsPlugin.controlSensitivityKey,
      this.controlSensitivity
    );
  }

  /**
   * @memberof ControlsPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
        }
        this.sensitivitySlider.displaySlider(features.data);
      }.bind(this)
    );
  }

  /**
   * @memberof ControlsPlugin
   */
  start() {}

  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get controlSensitivityKey() {
    return 'controlSensitivity';
  }
}
