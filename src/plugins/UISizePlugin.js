import { ButtonPlugin } from './ButtonPlugin';
import { SavedData } from '../SavedData';

/**
 * @export
 * @class UISizePlugin
 * @extends {ButtonPlugin}
 *
 */
export class UISizePlugin extends ButtonPlugin {
  /**
   *Creates an instance of UISizePlugin.
   * @param {object} params
   * @param {string | HTMLElement} [params.pointerSlider]
   * @param {string | HTMLElement} [params.buttonSlider]
   * @memberof UISizePlugin
   */
  constructor({ pointerSlider, buttonSlider } = {}) {
    super('UISize-Button-Plugin');

    this.pointerSize = 0.05;
    this.buttonSize = 0.5;

    this.pointerSlider = this.sliderSetup(
      pointerSlider,
      UISizePlugin.pointerSizeKey
    );

    this.buttonSlider = this.sliderSetup(
      buttonSlider,
      UISizePlugin.buttonSizeKey
    );

    this.enableSliderEvents();
  }

  /**
   * @memberof UISizePlugin
   */
  onPointerSizeChange() {
    this.pointerSize = this.sizeRange(Number(this.pointerSlider.value));
    this.sendProperty(UISizePlugin.pointerSizeKey, this.pointerSize);
  }

  /**
   * @memberof UISizePlugin
   */
  onButtonSizeChange() {
    this.buttonSize = this.sizeRange(Number(this.buttonSlider.value));
    this.sendProperty(UISizePlugin.buttonSizeKey, this.buttonSize);
  }

  /**
   * @memberof UISizePlugin
   */
  enableSliderEvents() {
    if (this.pointerSlider) {
      const onPointerSizeChange = this.onPointerSizeChange.bind(this);
      this.pointerSlider.addEventListener('change', onPointerSizeChange);
      this.pointerSlider.addEventListener('input', onPointerSizeChange);
    }

    if (this.buttonSlider) {
      const onButtonSizeChange = this.onButtonSizeChange.bind(this);
      this.buttonSlider.addEventListener('change', onButtonSizeChange);
      this.buttonSlider.addEventListener('input', onButtonSizeChange);
    }
  }

  /**
   * @memberof UISizePlugin
   */
  disableSliderEvents() {
    if (this.pointerSlider) {
      const onPointerSizeChange = this.onPointerSizeChange.bind(this);
      this.pointerSlider.removeEventListener('change', onPointerSizeChange);
      this.pointerlider.removeEventListener('input', onPointerSizeChange);
    }

    if (this.buttonSlider) {
      const onButtonSizeChange = this.onButtonSizeChange.bind(this);
      this.buttonSlider.removeEventListener('change', onButtonSizeChange);
      this.buttonSlider.removeEventListener('input', onButtonSizeChange);
    }
  }

  /**
   * @memberof UISizePlugin
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

        if (this.pointerSlider) {
          this.pointerSlider.style.display = features.data.pointerSize
            ? ''
            : 'none';
        }
        if (this.buttonSlider) {
          this.buttonSlider.style.display = features.data.buttonSize
            ? ''
            : 'none';
        }
      }.bind(this)
    );
  }

  /**
   * @memberof UISizePlugin
   */
  start() {}

  /**
   * @param {string | HTMLInputElement | HTMLElement} slider
   * @param {string} uiElement The UI element (pointer, buttons, etc) this slider will be controlling
   * @returns {Element | HTMLElement}
   * @memberof UISizePlugin
   */
  sliderSetup(slider, uiElement) {
    if ('string' === typeof slider) {
      slider = document.querySelector(slider);
    }

    if (!slider || 'range' !== slider.type) {
      return null;
    }
    const value = SavedData.read(uiElement);
    slider['value'] =
      null !== value && value.toString().trim().length > 0 ? value : 1;
    slider['min'] = '0.01';
    slider['max'] = '1';
    slider['step'] = '0.01';
    return slider;
  }

  /**
   * Controls the volume range
   * @param {number} i
   * @param {number} [min=0.01]
   * @param {number} [max=1]
   * @returns
   * @memberof UISizePlugin
   */
  sizeRange(i, min = 0.01, max = 1) {
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
   * @memberof UISizePlugin
   */
  static get pointerSizeKey() {
    return 'pointerSize';
  }

  /**
   * @readonly
   * @static
   * @memberof UISizePlugin
   */
  static get buttonSizeKey() {
    return 'buttonSize';
  }
}
