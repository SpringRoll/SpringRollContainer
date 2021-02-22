import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class CompletionPercentagePlugin
 * @property {object[]} sliders an array of all slider objects attached to CompletePercentagePlugin
 * @extends {SliderPlugin}
 */
export class CompletionPercentagePlugin extends SliderPlugin {
  /**
   * Creates an instance of CompletionPercentagePlugin.
   * @param {string | HTMLElement} completionPercentageSliders The selector or HTMLSliderElement of the slider
   * @param {number} [defaultCompletionPercentage=0.5] Default selected completion percentage
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
   * @param {Event} e
   */
  onCompletionPercentageChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(CompletionPercentagePlugin.completionPercentageKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof CompletionPercentagePlugin
   * @returns {string}
   */
  static get completionPercentageKey() {
    return 'completionPercentage';
  }
}