import { BasePlugin } from '../base-plugins/BasePlugin';
import { Slider } from '../ui-elements/Slider';

/**
 * @export
 * @class ButtonSizePlugin
 * @extends {BasePlugin}
 *
 */
export class ButtonSizePlugin extends BasePlugin {
  /**
   *Creates an instance of ButtonSizePlugin.
   * @param {object} params
   * @param {string | HTMLElement} [params.buttonSliders]
   * @param {number} [params.defaultButtonSize=0.5]
   * @memberof ButtonSizePlugin
   */
  constructor(buttonSliders, { defaultButtonSize = 0.5 } = {}) {
    super('UISize-Button-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.buttonSize = defaultButtonSize;
    this.buttonSliders = [];

    if (buttonSliders instanceof HTMLElement) {
      this.buttonSliders[0] = new Slider({
        slider: buttonSliders,
        control: ButtonSizePlugin.buttonSizeKey,
        defaultValue: this.buttonSize
      });
    } else {
      document.querySelectorAll(buttonSliders).forEach((slider) => {
        this.buttonSliders.push( new Slider({
          slider: slider,
          control: ButtonSizePlugin.buttonSizeKey,
          defaultValue: this.buttonSize
        }));
      });
    }

    this.buttonSlidersLength = this.buttonSliders.length;

    if (0 >= this.buttonSlidersLength) {
      this.warn('Plugin was not provided any valid HTML Elements');
      return;
    }

    if (this.buttonSliders[0].slider) {
      this.buttonSize = this.buttonSliders[0].value;
    }

    for (let i = 0; i < this.buttonSlidersLength; i++) {
      this.buttonSliders[i].enableSliderEvents(this.onButtonSizeChange.bind(this));
    }
  }

  /**
   * @memberof ButtonSizePlugin
   * @param {Event} e
   */
  onButtonSizeChange(e) {
    this.buttonSize = this.buttonSliders[0].sliderRange(
      Number(e.target.value)
    );
    this.sendProperty(ButtonSizePlugin.buttonSizeKey, this.buttonSize);

    for (let i = 0; i < this.buttonSlidersLength; i++) {
      this.buttonSliders[i].value = this.buttonSize;
    }
  }

  /**
   * @memberof ButtonSizePlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
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
   * @memberof ButtonSizePlugin
   */
  sendAllProperties() {
    this.sendProperty(ButtonSizePlugin.buttonSizeKey, this.buttonSize);
  }

  /**
   * @readonly
   * @static
   * @memberof ButtonSizePlugin
   */
  static get buttonSizeKey() {
    return 'buttonSize';
  }
}
