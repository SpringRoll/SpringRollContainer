import { BasePlugin } from './BasePlugin';
import { Slider } from '../ui-elements/Slider';

const DIFFICULTY_SLIDER_MIN = 0.1;
const DIFFICULTY_SLIDER_MAX = 1;
const DIFFICULTY_SLIDER_STEP = 0.1;

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
      min: DIFFICULTY_SLIDER_MIN,
      max: DIFFICULTY_SLIDER_MAX,
      step: DIFFICULTY_SLIDER_STEP,
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