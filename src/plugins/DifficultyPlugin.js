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
  constructor({
    hitAreaScaleSlider,
    defaultHitAreaScale = 0.5,
    dragThresholdScaleSlider,
    defaultDragThresholdScale = 0.5,
    healthSlider,
    defaultHealth = 0.5,
    objectCountSlider,
    defaultObjectCount = 0.5,
    completionPercentageSlider,
    defaultCompletionPercentage = 0.5,
    speedScaleSlider,
    defaultSpeedScale = 0.5,
    timersScaleSlider,
    defaultTimersScale = 0.5,
    inputCountSlider,
    defaultInputCount = 0.5,
  } = {}) {
    super('Difficulty-Plugin');

    this.values = {
      hitAreaScale: defaultHitAreaScale,
      dragThresholdScale: defaultDragThresholdScale,
      health: defaultHealth,
      objectCount: defaultObjectCount,
      completionPercentage: defaultCompletionPercentage,
      speedScale: defaultSpeedScale,
      timersScale: defaultTimersScale,
      inputCount: defaultInputCount,
    };

    this.sliders = {
      //Hit Area Scale
      hitAreaScaleSlider: new Slider({
        slider: hitAreaScaleSlider,
        control: DifficultyPlugin.hitAreaScaleKey,
        defaultValue: this.values.hitAreaScale
      }),

      //Drag Threshold Scale
      dragThresholdScaleSlider: new Slider({
        slider: dragThresholdScaleSlider,
        control: DifficultyPlugin.dragThresholdScaleKey,
        defaultValue: this.values.dragThresholdScale
      }),

      //Health
      healthSlider: new Slider({
        slider: healthSlider,
        control: DifficultyPlugin.healthKey,
        defaultValue: this.values.health
      }),

      //Object Count
      objectCountSlider: new Slider({
        slider: objectCountSlider,
        control: DifficultyPlugin.objectCountKey,
        defaultValue: this.values.objectCount
      }),

      //Completion Percentage
      completionPercentageSlider: new Slider({
        slider: completionPercentageSlider,
        control: DifficultyPlugin.completionPercentageKey,
        defaultValue: this.values.completionPercentage
      }),

      //Speed Scale
      speedScaleSlider: new Slider({
        slider: speedScaleSlider,
        control: DifficultyPlugin.speedScaleKey,
        defaultValue: this.values.speedScale
      }),

      //Timer Scale
      timersScaleSlider: new Slider({
        slider: timersScaleSlider,
        control: DifficultyPlugin.timersScaleKey,
        defaultValue: this.values.timersScale
      }),

      //Input Count
      inputCountSlider: new Slider({
        slider: inputCountSlider,
        control: DifficultyPlugin.inputCountKey,
        defaultValue: this.values.inputCount
      }),

    };

    Object.keys(this.sliders).forEach(key => {
      this.sliders[key].enableSliderEvents(() => {
        this.onDifficultyChange(this.sliders[key].control);
      });
      this.values[this.sliders[key].control] = this.sliders[key].value;
    });
  }

  /**
   * @memberof ControlsPlugin
   */
  onDifficultyChange(control) {
    this.values[control] = this.sliders[`${control}Slider`].sliderRange(
      Number(this.sliders[`${control}Slider`].slider.value)
    );
    this.sendProperty(DifficultyPlugin[`${control}Key`], this.values[control]);
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

        Object.keys(this.sliders).forEach(key => {
          this.sliders[key].displaySlider(features.data);
        });
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
  static get hitAreaScaleKey() {
    return 'hitAreaScale';
  }
  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get dragThresholdScaleKey() {
    return 'dragThresholdScale';
  }
  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get healthKey() {
    return 'health';
  }
  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get objectCountKey() {
    return 'objectCount';
  }
  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get completionPercentageKey() {
    return 'completionPercentage';
  }
  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get speedScaleKey() {
    return 'speedScale';
  }
  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get timersScaleKey() {
    return 'timersScale';
  }
  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get inputCountKey() {
    return 'inputCount';
  }
}
