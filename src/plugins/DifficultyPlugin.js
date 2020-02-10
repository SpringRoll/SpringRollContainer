import { BasePlugin } from './BasePlugin';
import { Slider } from '../ui-elements/Slider';

/**
 * @export
 * @class ControlsPlugin
 * @extends {BasePlugin}
 */
export class DifficultyPlugin extends BasePlugin {
  /**
   *Creates an instance of ControlsPlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.difficultySlider
   * @param {number} [params.defaultDifficulty=0.5]
   * @memberof DifficultyPlugin
   */
  constructor({ difficultySlider, defaultDifficulty = 0.5 }) {
    super('Difficulty-Plugin');

    this.difficulty = defaultDifficulty;

    this.difficultySlider = new Slider({
      slider: difficultySlider,
      control: DifficultyPlugin.difficultyKey,
      defaultValue: this.difficulty
    });

    this.difficultySlider.enableSliderEvents(
      this.onDifficultyChange.bind(this)
    );
  }

  /**
   * @memberof ControlsPlugin
   */
  onDifficultyChange() {
    this.difficulty = this.difficultySlider.sliderRange(
      Number(this.difficultySlider.slider.value)
    );
    this.sendProperty(DifficultyPlugin.difficultyKey, this.difficulty);
  }

  /**
   * @memberof ControlsPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
        }
        this.difficultySlider.displaySlider(features.data);
      }.bind(this)
    );
  }

  /**
   * @memberof ControlsPlugin
   */
  start() {}

  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get difficultyKey() {
    return 'difficulty';
  }
}
