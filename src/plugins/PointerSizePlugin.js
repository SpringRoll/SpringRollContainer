import { BasePlugin } from '../base-plugins';
import { Slider } from '../ui-elements';

/**
 * @export
 * @class PointerSizePlugin
 * @extends {BasePlugin}
 *
 */
export class PointerSizePlugin extends BasePlugin {
  /**
   *Creates an instance of PointerSizePlugin.
   * @param {object} params
   * @param {string | HTMLElement} [params.pointerSliders]
   * @param {number} [params.defaultPointerSize=0.5]
   * @memberof PointerSizePlugin
   */
  constructor(pointerSliders, { defaultPointerSize = 0.5 } = {}) {
    super('UISize-Button-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.pointerSize = defaultPointerSize;
    this.pointerSliders = [];

    if (pointerSliders instanceof HTMLElement) {
      this.pointerSliders[0] = new Slider({
        slider: pointerSliders,
        control: PointerSizePlugin.pointerSizeKey,
        defaultValue: this.pointerSize
      });
    } else {
      document.querySelectorAll(pointerSliders).forEach((slider) => {
        this.pointerSliders.push( new Slider({
          slider: slider,
          control: PointerSizePlugin.pointerSizeKey,
          defaultValue: this.pointerSize
        }));
      });
    }

    this.pointerSlidersLength = this.pointerSliders.length;

    if (0 >= this.pointerSlidersLength) {
      this.warn('Plugin was not provided any valid HTML Elements');
      return;
    }

    if (this.pointerSliders[0].slider) {
      this.pointerSize = this.pointerSliders[0].value;
    }

    for (let i = 0; i < this.pointerSlidersLength; i++) {
      this.pointerSliders[i].enableSliderEvents(this.onPointerSizeChange.bind(this));
    }
  }

  /**
   * @memberof PointerSizePlugin
   * @param {Event} e
   */
  onPointerSizeChange(e) {
    this.pointerSize = this.pointerSliders[0].sliderRange(
      Number(e.target.value)
    );
    this.sendProperty(PointerSizePlugin.pointerSizeKey, this.pointerSize);

    for (let i = 0; i < this.pointerSlidersLength; i++) {
      this.pointerSliders[i].value = this.pointerSize;
    }
  }

  /**
   * @memberof PointerSizePlugin
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
      }.bind(this)
    );
  }

  /**
   *
   * Saves the current state of all volume properties, and then sends them to the game
   * @memberof PointerSizePlugin
   */
  sendAllProperties() {
    this.sendProperty(PointerSizePlugin.pointerSizeKey, this.pointerSize);
  }

  /**
   * @readonly
   * @static
   * @memberof PointerSizePlugin
   */
  static get pointerSizeKey() {
    return 'pointerSize';
  }
}
