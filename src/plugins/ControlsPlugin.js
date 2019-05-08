import { ButtonPlugin } from './ButtonPlugin';
import { SavedData } from '../SavedData';

/**
 * @export
 * @class ControlsPlugin
 * @extends {ButtonPlugin}
 *
 */
export class ControlsPlugin extends ButtonPlugin {
  /**
   *Creates an instance of ControlsPlugin.
   * @param {object} params
   * @param {string | HTMLElement} [params.sensitivitySlider]
   * @memberof ControlsPlugin
   */
  constructor({ sensitivitySlider } = {}) {
    super('UISize-Button-Plugin');

    this.controlSensitivity = 0.5;

    this.sensitivitySlider = this.sliderSetup(
      sensitivitySlider,
      ControlsPlugin.controlSensitivityKey
    );

    this.enableSliderEvents();
  }

  /**
   * @memberof ControlsPlugin
   */
  onControlSensitivityChange() {
    this.controlSensitivity = this.sensitivityRange(
      Number(this.sensitivitySlider.value)
    );
    this.sendProperty(
      ControlsPlugin.controlSensitivityKey,
      this.controlSensitivity
    );
  }

  /**
   * @memberof ControlsPlugin
   */
  enableSliderEvents() {
    if (this.sensitivitySlider) {
      const onControlSensitivityChange = this.onControlSensitivityChange.bind(
        this
      );
      this.sensitivitySlider.addEventListener(
        'change',
        onControlSensitivityChange
      );
      this.sensitivitySlider.addEventListener(
        'input',
        onControlSensitivityChange
      );
    }
  }

  /**
   * @memberof ControlsPlugin
   */
  disableSliderEvents() {
    if (this.sensitivitySlider) {
      const onControlSensitivityChange = this.onControlSensitivityChange.bind(
        this
      );
      this.sensitivitySlider.removeEventListener(
        'change',
        onControlSensitivityChange
      );
      this.sensitivitySlider.removeEventListener(
        'input',
        onControlSensitivityChange
      );
    }
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
   * @param {string | HTMLInputElement | HTMLElement} slider
   * @param {string} control The control element (sensitivity, etc) this slider will be controlling
   * @returns {Element | HTMLElement}
   * @memberof ControlsPlugin
   */
  sliderSetup(slider, control) {
    if ('string' === typeof slider) {
      slider = document.querySelector(slider);
    }

    if (!slider || 'range' !== slider.type) {
      return null;
    }
    const value = SavedData.read(control);
    slider.value =
      null !== value && value.toString().trim().length > 0 ? value : 1;
    slider.min = '0.1';
    slider.max = '1';
    slider.step = '0.1';
    return slider;
  }

  /**
   * Controls the volume range
   * @param {number} i
   * @param {number} [min=0.1]
   * @param {number} [max=1]
   * @returns
   * @memberof ControlsPlugin
   */
  sensitivityRange(i, min = 0.1, max = 1) {
    if (i < min) {
      return min;
    } else if (i > max) {
      return max;
    } else {
      return i;
    }
  }

  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get controlSensitivityKey() {
    return 'controlSensitivity';
  }
}
