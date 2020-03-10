import { BasePlugin } from './BasePlugin';
import { Slider } from '../ui-elements/Slider';

/**
 * @export
 * @class UISizePlugin
 * @extends {BasePlugin}
 *
 */
export class UISizePlugin extends BasePlugin {
  /**
   *Creates an instance of UISizePlugin.
   * @param {object} params
   * @param {string | HTMLElement} [params.pointerSlider]
   * @param {string | HTMLElement} [params.buttonSlider]
   * @param {number} [params.defaultPointerSize=0.5]
   * @param {number} [params.defaultButtonSize=0.5]
   * @memberof UISizePlugin
   */
  constructor({
    pointerSlider,
    buttonSlider,
    defaultPointerSize = 0.5,
    defaultButtonSize = 0.5
  } = {}) {
    super('UISize-Button-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.pointerSize = defaultPointerSize;
    this.buttonSize = defaultButtonSize;

    this.pointerSlider = new Slider({
      slider: pointerSlider,
      control: UISizePlugin.pointerSizeKey,
      defaultValue: this.pointerSize
    });

    this.buttonSlider = new Slider({
      slider: buttonSlider,
      control: UISizePlugin.buttonSizeKey,
      defaultValue: this.buttonSize
    });

    this.pointerSlider.enableSliderEvents(this.onPointerSizeChange.bind(this));
    this.buttonSlider.enableSliderEvents(this.onButtonSizeChange.bind(this));

    this.pointerSize = this.pointerSlider.value;
    this.buttonSize = this.buttonSlider.value;
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
   *
   * Saves the current state of all volume properties, and then sends them to the game
   * @memberof UISizePlugin
   */
  sendAllProperties() {
    this.sendProperty(UISizePlugin.pointerSizeKey, this.pointerSize);
    this.sendProperty(UISizePlugin.buttonSizeKey, this.buttonSize);
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
