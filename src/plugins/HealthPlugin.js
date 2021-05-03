import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class HealthPlugin
 * @extends {SliderPlugin}
 */
export class HealthPlugin extends SliderPlugin {
  /**
   * Creates an instance of HealthPlugin.
   * @param {string | HTMLElement} healthSliders
   * @param {number} [defaultHealth=0.5]
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
   * @param {Event} e
   */
  onHealthChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(HealthPlugin.healthKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof HealthPlugin
   * @returns {string}
   */
  static get healthKey() {
    return 'health';
  }
}