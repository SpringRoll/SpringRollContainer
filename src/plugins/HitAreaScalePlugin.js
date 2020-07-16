import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class HitAreaScalePlugin
 * @extends {SliderPlugin}
 */
export class HitAreaScalePlugin extends SliderPlugin {
  /**
   *Creates an instance of HitAreaScalePlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.hitAreaScaleSliders
   * @param {number} [params.defaultHitAreaScale=0.5]
   * @memberof HitAreaScalePlugin
   */
  constructor(hitAreaScaleSliders, { defaultHitAreaScale = 0.5 } = {}) {
    super(hitAreaScaleSliders, 'Hit-Area-Scale-Plugin', { defaultValue: defaultHitAreaScale, featureName: HitAreaScalePlugin.hitAreaScaleKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onHitAreaScaleChange.bind(this));
    }
  }

  /**
   * @memberof HitAreaScalePlugin
   * @param {Event} target
   * @param {string} control
   */
  onHitAreaScaleChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(HitAreaScalePlugin.hitAreaScaleKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof HitAreaScalePlugin
   */
  static get hitAreaScaleKey() {
    return 'hitAreaScale';
  }
}
