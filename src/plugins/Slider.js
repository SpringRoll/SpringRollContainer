import { SavedData } from '../SavedData';

/**
 * @export
 * @class Slider
 */
export class Slider {
  /**
   *Creates an instance of Slider
   * @param {HTMLInputElement | string} slider
   *
   * @memberof SliderPlugin
   */
  constructor(slider, control, min, max, step, value) {
    this.min = min;
    this.max = max;
    this.step = step;
    this.value = value;
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
    slider.value =
      null !== value && value.toString().trim().length > 0 ? value : 1;
    slider.min = this.min;
    slider.max = this.max;
    slider.step = this.step;
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
    if (this.slider) {
      const event = callBack;
      this.slider.addEventListener('change', event);
      this.slider.addEventListener('input', event);
    }
  }

  /**
   * removes the event listeners from the give slider.
   * @memberof Slider
   * @param {Function} callBack event to fire on change or input
   */
  disableSliderEvents(callBack) {
    if (this.slider) {
      const event = callBack;
      this.slider.removeEventListener('change', event);
      this.slider.removeEventListener('input', event);
    }
  }
}
