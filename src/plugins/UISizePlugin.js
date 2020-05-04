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
   * @param {string | HTMLElement} [params.pointerSliders]
   * @param {string | HTMLElement} [params.buttonSliders]
   * @param {number} [params.defaultPointerSize=0.5]
   * @param {number} [params.defaultButtonSize=0.5]
   * @memberof UISizePlugin
   */
  constructor({
    pointerSliders,
    buttonSliders,
    defaultPointerSize = 0.5,
    defaultButtonSize = 0.5
  } = {}) {
    super('UISize-Button-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.pointerSize = defaultPointerSize;
    this.buttonSize = defaultButtonSize;
    this.pointerSliders = [];
    this.buttonSliders = [];

    if (pointerSliders instanceof HTMLElement) {
      this.pointerSliders[0] = new Slider({
        slider: pointerSliders,
        control: UISizePlugin.pointerSizeKey,
        defaultValue: this.pointerSize
      });
    } else {
      document.querySelectorAll(pointerSliders).forEach((slider) => {
        this.pointerSliders.push( new Slider({
          slider: slider,
          control: UISizePlugin.pointerSizeKey,
          defaultValue: this.pointerSize
        }));
      });
    }

    if (buttonSliders instanceof HTMLElement) {
      this.buttonSliders[0] = new Slider({
        slider: buttonSliders,
        control: UISizePlugin.buttonSizeKey,
        defaultValue: this.buttonSize
      });
    } else {
      document.querySelectorAll(buttonSliders).forEach((slider) => {
        this.buttonSliders.push( new Slider({
          slider: slider,
          control: UISizePlugin.buttonSizeKey,
          defaultValue: this.buttonSize
        }));
      });
    }

    this.pointerSlidersLength = this.pointerSliders.length;
    this.buttonSlidersLength = this.buttonSliders.length;

    if (0 >= this.pointerSlidersLength + this.buttonSlidersLength) {
      console.warn('SpringrollContainer: UISizePlugin was not provided any valid HTML Elements');
      return;
    }

    if (this.pointerSliders[0].slider) {
      this.pointerSize = this.pointerSliders[0].value;
    }
    if (this.buttonSliders[0].slider) {
      this.buttonSize = this.buttonSliders[0].value;
    }

    for (let i = 0; i < this.pointerSlidersLength; i++) {
      this.pointerSliders[i].enableSliderEvents(this.onPointerSizeChange.bind(this));
    }
    for (let i = 0; i < this.buttonSlidersLength; i++) {
      this.buttonSliders[i].enableSliderEvents(this.onButtonSizeChange.bind(this));
    }
  }

  /**
   * @memberof UISizePlugin
   * @param {Event} e
   */
  onPointerSizeChange(e) {
    this.pointerSize = this.pointerSliders[0].sliderRange(
      Number(e.target.value)
    );
    this.sendProperty(UISizePlugin.pointerSizeKey, this.pointerSize);

    for (let i = 0; i < this.pointerSlidersLength; i++) {
      this.pointerSliders[i].value = this.pointerSize;
    }
  }

  /**
   * @memberof UISizePlugin
   * @param {Event} e
   */
  onButtonSizeChange(e) {
    this.buttonSize = this.buttonSliders[0].sliderRange(
      Number(e.target.value)
    );
    this.sendProperty(UISizePlugin.buttonSizeKey, this.buttonSize);

    for (let i = 0; i < this.buttonSlidersLength; i++) {
      this.buttonSliders[i].value = this.buttonSize;
    }
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

        for (let i = 0; i < this.pointerSlidersLength; i++) {
          this.pointerSliders[i].displaySlider(features.data);
        }
        for (let i = 0; i < this.buttonSlidersLength; i++) {
          this.buttonSliders[i].displaySlider(features.data);
        }
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
