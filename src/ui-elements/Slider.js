import { SavedData } from '../SavedData';

/**
 * @export
 * @class Slider
 */
export class Slider {
  /**
   *Creates an instance of Slider
   * @param {object} params
   * @param {string | HTMLInputElement} params.slider the slider element or a selector string
   * @param {string} params.control the feature that this slider controols
   * @param {number} [min=0] slider min value
   * @param {number} [max=1] slider max value
   * @param {number} [step=0.1] slider step value
   * @param {number} [defaultValue=1] slider starting value
   * @memberof SliderPlugin
   */
  constructor({
    slider,
    control,
    min = 0,
    max = 1,
    step = 0.1,
    defaultValue = 1
  }) {
    this.min = min;
    this.max = max;
    this.step = step;
    this.sliderValue = defaultValue;
    this.control = control;
    this.slider = this.setUpSlider(slider, control);
  }

  /**
   * @param {string | HTMLInputElement | HTMLElement} slider
   * @param {string} control The control element (sensitivity, difficulty, pointer size, etc) this slider will be controlling
   * @returns {Element | HTMLElement}
   * @memberof Slider
   */
  setUpSlider(slider, control) {
    if ('string' === typeof slider) {
      slider = document.querySelector(slider);
    }

    if (!slider || 'range' !== slider.type) {
      return null;
    }
    const value = SavedData.read(control);

    slider.min = this.min;
    slider.max = this.max;
    slider.step = this.step;
    slider.value =
      value && value.toString().trim().length > 0 ? value : this.sliderValue;
    return slider;
  }

  /**
   * Controls the range of the slider
   * @param {number} i
   * @returns
   * @memberof Slider
   */
  sliderRange(i) {
    if (i < this.min) {
      return this.min;
    } else if (i > this.max) {
      return this.max;
    } else {
      return i;
    }
  }

  /**
   * Adds change and input listeners to the slider using the given callback function
   * @memberof Slider
   * @param {Function} callBack event to fire on change or input
   */
  enableSliderEvents(callBack) {
    if (!this.slider) {
      return;
    }

    const event = callBack;
    this.slider.addEventListener('change', event);
    this.slider.addEventListener('input', event);
  }

  /**
   * removes the event listeners from the give slider.
   * @memberof Slider
   * @param {Function} callBack event to fire on change or input
   */
  disableSliderEvents(callBack) {
    if (!this.slider) {
      return;
    }
    const event = callBack;
    this.slider.removeEventListener('change', event);
    this.slider.removeEventListener('input', event);
  }
  /**
   * enables display of the Slider if it is present in the features list
   * @memberof Slider
   * @param {object} data Object containing which features are enabled
   */
  displaySlider(data) {
    if (!this.slider) {
      return;
    }
    this.slider.style.display = data[this.control] ? '' : 'none';
  }

  /**
   * @param {Event} event the event to be fired on the slider
   * @memberof Slider
   */
  dispatchEvent(event) {
    this.slider.dispatchEvent(event);
  }

  /**
   * @readonly
   * @returns {string}
   * @memberof Slider
   */
  get value() {
    return this.slider.value;
  }

  /**
   * @memberof Slider
   */
  set value(value) {
    this.slider.value = value;
  }
}
