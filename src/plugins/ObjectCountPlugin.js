import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class ObjectCountPlugin
 * @property {object[]} sliders an array of all slider objects attached to ObjectCountPlugin
 * @extends {SliderPlugin}
 */
export class ObjectCountPlugin extends SliderPlugin {
  /**
   * Creates an instance of ObjectCountPlugin.
   * @param {string | HTMLElement} objectCountSliders selector string or HTML Element for the input(s)
   * @param {number} [defaultObjectCount=0.5] The default value for the slider
   * @memberof ObjectCountPlugin
   */
  constructor(objectCountSliders, { defaultObjectCount = 0.5 } = {}) {
    super(objectCountSliders, 'Object-Count-Plugin', { defaultValue: defaultObjectCount, featureName: ObjectCountPlugin.objectCountKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onObjectCountChange.bind(this));
    }
  }

  /**
   * @memberof ObjectCountPlugin
   * @param {Event} target
   * @param {string} control
   */
  onObjectCountChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(ObjectCountPlugin.objectCountKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof ObjectCountPlugin
   * @returns {string}
   */
  static get objectCountKey() {
    return 'objectCount';
  }
}