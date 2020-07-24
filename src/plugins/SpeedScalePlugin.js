import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class SpeedScalePlugin
 * @extends {SliderPlugin}
 */
export class SpeedScalePlugin extends SliderPlugin {
  /**
   *Creates an instance of SpeedScalePlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.speedScaleSliders
   * @param {number} [params.defaultSpeedScale=0.5]
   * @memberof SpeedScalePlugin
   */
  constructor(speedScaleSliders, { defaultSpeedScale = 0.5 } = {}) {
    super(speedScaleSliders, 'Speed-Scale-Plugin', { defaultValue: defaultSpeedScale, featureName: SpeedScalePlugin.speedScaleKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onSpeedScaleChange.bind(this));
    }
  }

  /**
   * @memberof SpeedScalePlugin
   * @param {Event} target
   * @param {string} control
   */
  onSpeedScaleChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(SpeedScalePlugin.speedScaleKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof SpeedScalePlugin
   */
  static get speedScaleKey() {
    return 'speedScale';
  }
}