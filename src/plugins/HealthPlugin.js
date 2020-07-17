import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class HealthPlugin
 * @extends {SliderPlugin}
 */
export class HealthPlugin extends SliderPlugin {
  /**
   *Creates an instance of HealthPlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.healthSliders
   * @param {number} [params.defaultHealth=0.5]
   * @memberof HealthPlugin
   */
  constructor(healthSliders, {defaultHealth = 0.5 } = {}) {
    super(healthSliders, 'Health-Scale-Plugin', { defaultValue:defaultHealth, featureName: HealthPlugin.healthKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onHealthChange.bind(this));
    }
  }

  /**
   * @memberof HealthPlugin
   * @param {Event} target
   * @param {string} control
   */
  onHealthChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(HealthPlugin.healthKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof HealthPlugin
   */
  static get healthKey() {
    return 'health';
  }
}