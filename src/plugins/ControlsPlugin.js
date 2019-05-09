import { ButtonPlugin } from './ButtonPlugin';
import { Slider } from './Slider';

const SENSITIVITY_SLIDER_MIN = 0.1;
const SENSITIVITY_SLIDER_MAX = 1;
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
  constructor({ sensitivitySlider } = {}) {
    super('Control-Button-Plugin');

    this.controlSensitivity = 0.5;

    this.sensitivitySlider = new Slider(
      sensitivitySlider,
      ControlsPlugin.controlSensitivityKey,
      SENSITIVITY_SLIDER_MIN,
      SENSITIVITY_SLIDER_MAX,
      SENSITIVITY_SLIDER_STEP,
      this.controlSensitivity
    );

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
        if (
          !features.data ||
          'object' !== typeof features.data ||
          null === features.data
        ) {
          return;
        }

        if (this.sensitivitySlider) {
          this.sensitivitySlider.style.display = features.data
            .controlSensitivity
            ? ''
            : 'none';
        }
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
