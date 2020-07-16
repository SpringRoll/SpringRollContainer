import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class ObjectCountPlugin
 * @extends {SliderPlugin}
 */
export class ObjectCountPlugin extends SliderPlugin {
  /**
   *Creates an instance of ObjectCountPlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.objectCountSliders
   * @param {number} [params.defaultObjectCount=0.5]
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
   */
  static get objectCountKey() {
    return 'objectCount';
  }
}