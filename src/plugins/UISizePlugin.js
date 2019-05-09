import { ButtonPlugin } from './ButtonPlugin';
import { Slider } from './Slider';

const POINTER_SLIDER_MIN = 0.01;
const POINTER_SLIDER_MAX = 1;
const POINTER_SLIDER_STEP = 0.01;

const BUTTON_SLIDER_MIN = 0.01;
const BUTTON_SLIDER_MAX = 1;
const BUTTON_SLIDER_STEP = 0.01;
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

    this.pointerSlider = new Slider(
      pointerSlider,
      UISizePlugin.pointerSizeKey,
      POINTER_SLIDER_MIN,
      POINTER_SLIDER_MAX,
      POINTER_SLIDER_STEP,
      this.pointerSize
    );

    this.buttonSlider = new Slider(
      buttonSlider,
      UISizePlugin.buttonSizeKey,
      BUTTON_SLIDER_MIN,
      BUTTON_SLIDER_MAX,
      BUTTON_SLIDER_STEP,
      this.buttonSize
    );

    this.pointerSlider.enableSliderEvents(this.onPointerSizeChange.bind(this));
    this.buttonSlider.enableSliderEvents(this.onButtonSizeChange.bind(this));
  }

  /**
   * @memberof UISizePlugin
   */
  onPointerSizeChange() {
    this.pointerSize = this.pointerSlider.sliderRange(
      Number(this.pointerSlider.slider.value)
    );
    this.sendProperty(UISizePlugin.pointerSizeKey, this.pointerSize);
  }

  /**
   * @memberof UISizePlugin
   */
  onButtonSizeChange() {
    this.buttonSize = this.buttonSlider.sliderRange(
      Number(this.buttonSlider.slider.value)
    );
    this.sendProperty(UISizePlugin.buttonSizeKey, this.buttonSize);
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
