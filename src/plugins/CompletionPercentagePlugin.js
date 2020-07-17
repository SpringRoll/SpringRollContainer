import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class CompletionPercentagePlugin
 * @extends {SliderPlugin}
 */
export class CompletionPercentagePlugin extends SliderPlugin {
  /**
   *Creates an instance of CompletionPercentagePlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.completionPercentageSliders
   * @param {number} [params.defaultCompletionPercentage=0.5]
   * @memberof CompletionPercentagePlugin
   */
  constructor(completionPercentageSliders, { defaultCompletionPercentage = 0.5 } = {}) {
    super(completionPercentageSliders, 'Completion-Percentage-Plugin', { defaultValue: defaultCompletionPercentage, featureName: CompletionPercentagePlugin.completionPercentageKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onCompletionPercentageChange.bind(this));
    }
  }

  /**
   * @memberof CompletionPercentagePlugin
   * @param {Event} target
   * @param {string} control
   */
  onCompletionPercentageChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(CompletionPercentagePlugin.completionPercentageKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof CompletionPercentagePlugin
   */
  static get completionPercentageKey() {
    return 'completionPercentage';
  }
}