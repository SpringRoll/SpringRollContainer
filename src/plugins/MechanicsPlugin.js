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
   * @param {string | HTMLElement} params.hitAreaScaleSliders
   * @param {number} [params.defaultHitAreaScale=0.5]
   * @param {string | HTMLElement} params.dragThresholdScaleSliders
   * @param {number} [params.defaultDragThresholdScale=0.5]
   * @param {string | HTMLElement} params.healthSliders
   * @param {number} [params.defaultHealth=0.5]
   * @param {string | HTMLElement} params.objectCountSliders
   * @param {number} [params.defaultObjectCount=0.5]
   * @param {string | HTMLElement} params.completionPercentageSliders
   * @param {number} [params.defaultCompletionPercentage=0.5]
   * @param {string | HTMLElement} params.speedScaleSliders
   * @param {number} [params.defaultSpeedScale=0.5]
   * @param {string | HTMLElement} params.timersScaleSliders
   * @param {number} [params.defaultTimersScale=0.5]
   * @param {string | HTMLElement} params.inputCountSliders
   * @param {number} [params.defaultInputCount=0.5]
   * @memberof MechanicsPlugin
   */
  constructor({
    hitAreaScaleSliders,
    defaultHitAreaScale = 0.5,
    dragThresholdScaleSliders,
    defaultDragThresholdScale = 0.5,
    healthSliders,
    defaultHealth = 0.5,
    objectCountSliders,
    defaultObjectCount = 0.5,
    completionPercentageSliders,
    defaultCompletionPercentage = 0.5,
    speedScaleSliders,
    defaultSpeedScale = 0.5,
    timersScaleSliders,
    defaultTimersScale = 0.5,
    inputCountSliders,
    defaultInputCount = 0.5,
  } = {}) {
    super('Mechanics-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
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

    this.selectors = {
      hitAreaScaleSliders: hitAreaScaleSliders,
      dragThresholdScaleSliders: dragThresholdScaleSliders,
      healthSliders: healthSliders,
      objectCountSliders: objectCountSliders,
      completionPercentageSliders: completionPercentageSliders,
      speedScaleSliders: speedScaleSliders,
      timersScaleSliders: timersScaleSliders,
      inputCountSliders: inputCountSliders,
    };

    this.sliders = {
      hitAreaScaleSliders: [],
      dragThresholdScaleSliders: [],
      healthSliders: [],
      objectCountSliders: [],
      completionPercentageSliders: [],
      speedScaleSliders: [],
      timersScaleSliders: [],
      inputCountSliders: [],
    };

    for (const key in this.values) {
      if (this.selectors[`${key}Sliders`] instanceof HTMLElement) {
        this.sliders[`${key}Sliders`][0] = new Slider({
          slider: this.selectors[`${key}Sliders`],
          control: MechanicsPlugin[`${key}Key`],
          defaultValue: this.values[key]
        });
      } else {
        document.querySelectorAll(this.selectors[`${key}Sliders`]).forEach((slider) => {
          this.sliders[`${key}Sliders`].push(new Slider({
            slider: slider,
            control: MechanicsPlugin[`${key}Key`],
            defaultValue: this.values[key]
          }));
        });
      }
    }

    this.slidersLength = {
      hitAreaScaleSliders: this.sliders.hitAreaScaleSliders.length,
      dragThresholdScaleSliders: this.sliders.dragThresholdScaleSliders.length,
      healthSliders: this.sliders.healthSliders.length,
      objectCountSliders: this.sliders.objectCountSliders.length,
      completionPercentageSliders: this.sliders.completionPercentageSliders.length,
      speedScaleSliders: this.sliders.speedScaleSliders.length,
      timersScaleSliders: this.sliders.timersScaleSliders.length,
      inputCountSliders: this.sliders.inputCountSliders.length,
    };

    if (Object.values(this.slidersLength).reduce((accumulator, currentValue) => accumulator + currentValue, 0) <= 0) {
      this.warn('Plugin was not provided any valid HTML Input Elements');
      return;
    }

    for (const key in this.sliders) {
      for (let i = 0; i < this.slidersLength[key]; i++) {
        this.sliders[key][i].enableSliderEvents((e) => {
          this.onMechanicsChange(e.target, this.sliders[key][i].control);
        });
      }

      if (this.sliders[key][0].slider) {
        this.values[this.sliders[key].control] = this.sliders[key][0].value;
      }
    }
  }

  /**
   * @memberof MechanicsPlugin
   * @param {Event} target
   * @param {string} control
   */
  onMechanicsChange(target, control) {
    this.values[control] = this.sliders[`${control}Sliders`][0].sliderRange(
      Number(target.value)
    );

    this.sendProperty(MechanicsPlugin[`${control}Key`], this.values[control]);

    for (let i = 0; i < this.slidersLength[`${control}Sliders`]; i++) {
      this.sliders[`${control}Sliders`][i].slider.value = this.values[control];
    }
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

        for (const key in this.sliders) {
          for (let i = 0; i < this.slidersLength[key]; i++) {
            this.sliders[key][i].displaySlider(features.data);
          }
        }
      }.bind(this)
    );
  }

  /**
*
* Sends initial mechanics properties to the application
* @memberof MechanicsPlugin
*/
  sendAllProperties() {
    this.sendProperty(MechanicsPlugin.hitAreaScaleKey, this.values.hitAreaScale);
    this.sendProperty(MechanicsPlugin.dragThresholdScaleKey, this.values.dragThresholdScale);
    this.sendProperty(MechanicsPlugin.healthKey, this.values.health);
    this.sendProperty(MechanicsPlugin.objectCountKey, this.values.objectCount);
    this.sendProperty(MechanicsPlugin.completionPercentageKey, this.values.completionPercentage);
    this.sendProperty(MechanicsPlugin.speedScaleKey, this.values.speedScale);
    this.sendProperty(MechanicsPlugin.timersScaleKey, this.values.timersScale);
    this.sendProperty(MechanicsPlugin.inputCountKey, this.values.inputCount);
  }

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
