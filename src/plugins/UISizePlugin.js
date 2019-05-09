import { ButtonPlugin } from './ButtonPlugin';
import { Slider } from '../classes/Slider';

const POINTER_SLIDER_MIN = 0.01;
const POINTER_SLIDER_STEP = 0.01;

const BUTTON_SLIDER_MIN = 0.1;

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
  constructor({
    pointerSlider,
    buttonSlider,
    pointerSize = 0.05,
    buttonSize = 0.5
  } = {}) {
    super('UISize-Button-Plugin');

    this.pointerSize = pointerSize;
    this.buttonSize = buttonSize;

    this.pointerSlider = new Slider({
      slider: pointerSlider,
      control: UISizePlugin.pointerSizeKey,
      min: POINTER_SLIDER_MIN,
      step: POINTER_SLIDER_STEP,
      value: this.pointerSize
    });

    this.buttonSlider = new Slider({
      slider: buttonSlider,
      control: UISizePlugin.buttonSizeKey,
      min: BUTTON_SLIDER_MIN,
      value: this.buttonSize
    });

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
        if (!features.data) {
          return;
        }

        this.pointerSlider.displaySlider(features.data);
        this.buttonSlider.displaySlider(features.data);
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
