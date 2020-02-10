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

    this.hitAreaScale = defaultHitAreaScale;
    this.dragThresholdScale = defaultDragThresholdScale;
    this.health = defaultHealth;
    this.objectCount = defaultObjectCount;
    this.completionPercentage = defaultCompletionPercentage;
    this.speedScale = defaultSpeedScale;
    this.timersScale = defaultTimersScale;
    this.inputCount = defaultInputCount;

    //Hit Area Scale
    this.hitAreaScaleSlider = new Slider({
      slider: hitAreaScaleSlider,
      control: DifficultyPlugin.hitAreaKey,
      defaultValue: this.hitAreaScale
    });

    this.hitAreaScaleSlider.enableSliderEvents(
      this.onHitAreaScaleChange.bind(this)
    );

    //Drag Threshold Scale
    this.dragThresholdScaleSlider = new Slider({
      slider: dragThresholdScaleSlider,
      control: DifficultyPlugin.dragThresholdScaleKey,
      defaultValue: this.dragThresholdScale
    });

    this.dragThresholdScaleSlider.enableSliderEvents(
      this.onDragThresholdScaleChange.bind(this)
    );

    //Health
    this.healthSlider = new Slider({
      slider: healthSlider,
      control: DifficultyPlugin.healthKey,
      defaultValue: this.health
    });

    this.healthSlider.enableSliderEvents(
      this.onHealthChange.bind(this)
    );

    //Object Count
    this.objectCountSlider = new Slider({
      slider: objectCountSlider,
      control: DifficultyPlugin.objectCountKey,
      defaultValue: this.objectCount
    });

    this.objectCountSlider.enableSliderEvents(
      this.onObjectCountChange.bind(this)
    );

    //Completion Percentage
    this.completionPercentageSlider = new Slider({
      slider: completionPercentageSlider,
      control: DifficultyPlugin.completionPercentageKey,
      defaultValue: this.completionPercentage
    });

    this.completionPercentageSlider.enableSliderEvents(
      this.onCompletionPercentageChange.bind(this)
    );

    //Speed Scale
    this.speedScaleSlider = new Slider({
      slider: speedScaleSlider,
      control: DifficultyPlugin.speedScaleKey,
      defaultValue: this.speedScale
    });

    this.speedScaleSlider.enableSliderEvents(
      this.onSpeedScaleChange.bind(this)
    );

    //Timer Scale
    this.timersScaleSlider = new Slider({
      slider: timersScaleSlider,
      control: DifficultyPlugin.timersScaleKey,
      defaultValue: this.timersScale
    });

    this.timersScaleSlider.enableSliderEvents(
      this.onTimersScaleChange.bind(this)
    );

    //Input Count
    this.inputCountSlider = new Slider({
      slider: inputCountSlider,
      control: DifficultyPlugin.inputCountKey,
      defaultValue: this.inputCount
    });

    this.inputCountSlider.enableSliderEvents(
      this.onInputCountChange.bind(this)
    );

  }

  /**
   * @memberof ControlsPlugin
   */
  onHitAreaScaleChange() {
    this.hitAreaScale = this.hitAreaScaleSlider.sliderRange(
      Number(this.hitAreaScaleSlider.slider.value)
    );
    this.sendProperty(DifficultyPlugin.hitAreaScaleKey, this.hitAreaScale);
  }
  /**
   * @memberof ControlsPlugin
   */
  onDragThresholdScaleChange() {
    this.dragThresholdScale = this.dragThresholdScaleSlider.sliderRange(
      Number(this.dragThresholdScaleSlider.slider.value)
    );
    this.sendProperty(DifficultyPlugin.dragThresholdScaleKey, this.dragThresholdScale);
  }
  /**
   * @memberof ControlsPlugin
   */
  onHealthChange() {
    this.health = this.healthSlider.sliderRange(
      Number(this.healthSlider.slider.value)
    );
    this.sendProperty(DifficultyPlugin.healthKey, this.health);
  }
  /**
   * @memberof ControlsPlugin
   */
  onObjectCountChange() {
    this.objectCount = this.objectCountSlider.sliderRange(
      Number(this.objectCountSlider.slider.value)
    );
    this.sendProperty(DifficultyPlugin.objectCountKey, this.objectCount);
  }
  /**
   * @memberof ControlsPlugin
   */
  onCompletionPercentageChange() {
    this.completionPercentage = this.completionPercentageSlider.sliderRange(
      Number(this.completionPercentageSlider.slider.value)
    );
    this.sendProperty(DifficultyPlugin.completionPercentageKey, this.completionPercentage);
  }
  /**
   * @memberof ControlsPlugin
   */
  onSpeedScaleChange() {
    this.speedScale = this.speedScaleSlider.sliderRange(
      Number(this.speedScaleSlider.slider.value)
    );
    this.sendProperty(DifficultyPlugin.speedScaleKey, this.speedScale);
  }
  /**
   * @memberof ControlsPlugin
   */
  onTimersScaleChange() {
    this.timersScale = this.timersScaleSlider.sliderRange(
      Number(this.timersScaleSlider.slider.value)
    );
    this.sendProperty(DifficultyPlugin.timersScaleKey, this.timersScale);
  }
  /**
   * @memberof ControlsPlugin
   */
  onInputCountChange() {
    this.inputCount = this.inputCountSlider.sliderRange(
      Number(this.inputCountSlider.slider.value)
    );
    this.sendProperty(DifficultyPlugin.inputCountKey, this.inputCount);
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
