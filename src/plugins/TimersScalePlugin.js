import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class TimersScalePlugin
 * @property {number} currentValue
 * @extends {SliderPlugin}
 */
export class TimersScalePlugin extends SliderPlugin {
  /**
   * Creates an instance of TimersScalePlugin.
   * @param {string | HTMLElement} timersScaleSliders selector string or HTML Element for the input(s)
   * @param {number} [defaultTimersScale=0.5] Default Value for the timer scale slider
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
   * @param {Event} e
   */
  onTimersScaleChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(TimersScalePlugin.timersScaleKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof TimersScalePlugin
   * @return {string}
   */
  static get timersScaleKey() {
    return 'timersScale';
  }
}