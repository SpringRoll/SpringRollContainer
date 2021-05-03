import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class PointerSizePlugin
 * @extends {SliderPlugin}
 * @property {object[]} sliders an array of all slider objects attached to PointerSizePlugin
 * @extends SliderPlugin
 */
export class PointerSizePlugin extends SliderPlugin {
  /**
   * Creates an instance of PointerSizePlugin.
   * @param {string | HTMLElement} [pointerSliders] selector string or HTML Element for the input(s)
   * @param {number} [defaultPointerSize=0.5] The default value for the pointer size slider
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
   * @readonly
   * @static
   * @memberof PointerSizePlugin
   * @return {string}
   */
  static get pointerSizeKey() {
    return 'pointerSize';
  }
}
