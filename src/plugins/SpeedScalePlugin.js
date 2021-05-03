import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class SpeedScalePlugin
 * @extends {SliderPlugin}
 */
export class SpeedScalePlugin extends SliderPlugin {
  /**
   *Creates an instance of SpeedScalePlugin.
   * @param {string | HTMLElement} speedScaleSliders selector string or HTML Element for the input(s)
   * @param {number} [defaultSpeedScale=0.5] The default value for the speed scale slider
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
   * @param {Event} e
   */
  onSpeedScaleChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(SpeedScalePlugin.speedScaleKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof SpeedScalePlugin
   * @return {string}
   */
  static get speedScaleKey() {
    return 'speedScale';
  }
}