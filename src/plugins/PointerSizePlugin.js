import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class PointerSizePlugin
 * @extends {SliderPlugin}
 *
 */
export class PointerSizePlugin extends SliderPlugin {
  /**
   *Creates an instance of PointerSizePlugin.
   * @param {object} options
   * @param {string | HTMLElement} [pointerSliders]
   * @param {number} [options.defaultPointerSize=0.5]
   * @memberof PointerSizePlugin
   */
  constructor(pointerSliders, { defaultPointerSize = 0.5 } = {}) {
    super(pointerSliders, 'UISize-Pointer-Plugin', { defaultValue: defaultPointerSize, featureName: PointerSizePlugin.pointerSizeKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onPointerSizeChange.bind(this));
    }

  }

  /**
   * @memberof PointerSizePlugin
   * @param {Event} e
   */
  onPointerSizeChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(PointerSizePlugin.pointerSizeKey, this.currentValue);
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

        for (let i = 0; i < this.slidersLength; i++) {
          this.sliders[i].displaySlider(features.data);
        }
      }.bind(this)
    );
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
