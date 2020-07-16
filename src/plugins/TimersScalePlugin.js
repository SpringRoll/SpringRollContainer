import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class TimersScalePlugin
 * @extends {SliderPlugin}
 */
export class TimersScalePlugin extends SliderPlugin {
  /**
   *Creates an instance of TimersScalePlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.timersScaleSliders
   * @param {number} [params.defaultTimersScale=0.5]
   * @memberof TimersScalePlugin
   */
  constructor(timersScaleSliders, { defaultTimersScale = 0.5 } = {}) {
    super(timersScaleSliders, 'Timers-Scale-Plugin', { defaultValue: defaultTimersScale, featureName: TimersScalePlugin.timersScaleKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onTimersScaleChange.bind(this));
    }
  }

  /**
   * @memberof TimersScalePlugin
   * @param {Event} target
   * @param {string} control
   */
  onTimersScaleChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(TimersScalePlugin.timersScaleKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof TimersScalePlugin
   */
  static get timersScaleKey() {
    return 'timersScale';
  }
}