import { BasePlugin } from './BasePlugin';
import { Slider } from '../ui-elements/Slider';

/**
 * @export
 * @class MechanicsPlugin
 * @extends {BasePlugin}
 */
export class MechanicsPlugin extends BasePlugin {
  /**
   *Creates an instance of MechanicsPlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.hitAreaScaleSlider
   * @param {number} [params.defaultHitAreaScale=0.5]
   * @param {string | HTMLElement} params.dragThresholdScaleSlider
   * @param {number} [params.defaultDragThresholdScale=0.5]
   * @param {string | HTMLElement} params.healthSlider
   * @param {number} [params.defaultHealth=0.5]
   * @param {string | HTMLElement} params.objectCountSlider
   * @param {number} [params.defaultObjectCount=0.5]
   * @param {string | HTMLElement} params.completionPercentageSlider
   * @param {number} [params.defaultCompletionPercentage=0.5]
   * @param {string | HTMLElement} params.speedScaleSlider
   * @param {number} [params.defaultSpeedScale=0.5]
   * @param {string | HTMLElement} params.timersScaleSlider
   * @param {number} [params.defaultTimersScale=0.5]
   * @param {string | HTMLElement} params.inputCountSlider
   * @param {number} [params.defaultInputCount=0.5]
   * @memberof MechanicsPlugin
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
    super('Mechanics-Plugin');

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
        control: MechanicsPlugin.hitAreaScaleKey,
        defaultValue: this.values.hitAreaScale
      }),

      //Drag Threshold Scale
      dragThresholdScaleSlider: new Slider({
        slider: dragThresholdScaleSlider,
        control: MechanicsPlugin.dragThresholdScaleKey,
        defaultValue: this.values.dragThresholdScale
      }),

      //Health
      healthSlider: new Slider({
        slider: healthSlider,
        control: MechanicsPlugin.healthKey,
        defaultValue: this.values.health
      }),

      //Object Count
      objectCountSlider: new Slider({
        slider: objectCountSlider,
        control: MechanicsPlugin.objectCountKey,
        defaultValue: this.values.objectCount
      }),

      //Completion Percentage
      completionPercentageSlider: new Slider({
        slider: completionPercentageSlider,
        control: MechanicsPlugin.completionPercentageKey,
        defaultValue: this.values.completionPercentage
      }),

      //Speed Scale
      speedScaleSlider: new Slider({
        slider: speedScaleSlider,
        control: MechanicsPlugin.speedScaleKey,
        defaultValue: this.values.speedScale
      }),

      //Timer Scale
      timersScaleSlider: new Slider({
        slider: timersScaleSlider,
        control: MechanicsPlugin.timersScaleKey,
        defaultValue: this.values.timersScale
      }),

      //Input Count
      inputCountSlider: new Slider({
        slider: inputCountSlider,
        control: MechanicsPlugin.inputCountKey,
        defaultValue: this.values.inputCount
      }),

    };

    Object.keys(this.sliders).forEach(key => {
      this.sliders[key].enableSliderEvents(() => {
        this.onMechanicsChange(this.sliders[key].control);
      });
      this.values[this.sliders[key].control] = this.sliders[key].value;
    });
  }

  /**
   * @memberof MechanicsPlugin
   */
  onMechanicsChange(control) {
    this.values[control] = this.sliders[`${control}Slider`].sliderRange(
      Number(this.sliders[`${control}Slider`].slider.value)
    );
    this.sendProperty(MechanicsPlugin[`${control}Key`], this.values[control]);
  }


  /**
   * @memberof MechanicsPlugin
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
   * @memberof MechanicsPlugin
   */
  start() {}

  /**
   * @readonly
   * @static
   * @memberof MechanicsPlugin
   */
  static get hitAreaScaleKey() {
    return 'hitAreaScale';
  }
  /**
   * @readonly
   * @static
   * @memberof MechanicsPlugin
   */
  static get dragThresholdScaleKey() {
    return 'dragThresholdScale';
  }
  /**
   * @readonly
   * @static
   * @memberof MechanicsPlugin
   */
  static get healthKey() {
    return 'health';
  }
  /**
   * @readonly
   * @static
   * @memberof MechanicsPlugin
   */
  static get objectCountKey() {
    return 'objectCount';
  }
  /**
   * @readonly
   * @static
   * @memberof MechanicsPlugin
   */
  static get completionPercentageKey() {
    return 'completionPercentage';
  }
  /**
   * @readonly
   * @static
   * @memberof MechanicsPlugin
   */
  static get speedScaleKey() {
    return 'speedScale';
  }
  /**
   * @readonly
   * @static
   * @memberof MechanicsPlugin
   */
  static get timersScaleKey() {
    return 'timersScale';
  }
  /**
   * @readonly
   * @static
   * @memberof MechanicsPlugin
   */
  static get inputCountKey() {
    return 'inputCount';
  }
}
