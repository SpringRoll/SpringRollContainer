import { BasePlugin } from './BasePlugin';
import { RadioGroup } from '../ui-elements/RadioGroup';

/**
 *
 *
 * @export
 * @class RadioGroupPlugin
 */
export class RadioGroupPlugin extends BasePlugin {
  /**
   *
   *Creates an instance of RadioGroupPlugin.
   * @constructor
   * @memberof RadioGroupPlugin
   * @param {string} name
   */
  constructor(cssSelector, name, {supportedValues, initialValue, controlName, featureName, radioCount}) {
    super(name);
    this.selectors = cssSelector ? cssSelector.split(',') : [];
    this.supportedValues = supportedValues;
    this.initialValue = initialValue;
    this.controlName = controlName;
    this.featureName = featureName;
    this.radioCount = radioCount;
    this.sendAllProperties = this.sendAllProperties.bind(this);

    this._currentValue = initialValue ? initialValue : this.supportedValues[0];

    this.radioGroups = this.setUpRadios(this.selectors);

    this.radioGroupsLength = this.radioGroups.length;
  }

  /**
   * @memberof RadioGroupPlugin
   * @param {string[]} selectors the separated selector strings used to target the radio button groups
   * @returns {RadioGroup[]}
   */
  setUpRadios(selectors) {
    const radioGroups = [];

    selectors.forEach((selector) => {
      const radioGroup = new RadioGroup({
        selector: selector.trim(),
        controlName: this.controlName,
        defaultValue: this.initialValue,
        pluginName: this.name,
        featureName: this.featureName
      });

      if (radioGroup.length !== this.radioCount) {
        this.warn(`Selector "${selector}" did not find exactly ${this.radioCount} radio buttons for ${this.controlName}. Skipping selector`);
        return;
      }

      if (!radioGroup.hasOnly(this.supportedValues)) {
        return;
      }

      if (radioGroup.hasDuplicateValues()) {
        this.warn(`Duplicate radio button values detected (values: ${radioGroup.values} ). Skipping radio group`);
        return;
      }

      radioGroups.push(radioGroup);
    });

    return radioGroups;
  }

  /**
   * @memberof RadioGroupPlugin
   */
  start() {
    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
  *
  * Sends initial caption properties to the application
  * @memberof RadioGroupPlugin
  */
  sendAllProperties() {
    this.sendProperty(this.featureName, this.property);
  }

  /**
   * @memberof RadioGroupPlugin
   * @param {string} newValue
   */
  set currentValue(newValue) {
    if (!this.supportedValues.includes(newValue)) {
      return;
    }

    this._currentValue = newValue;

    for (let i = 0, l = this.radioGroups.length; i < l; i++) {
      this.radioGroups[i].radioGroup[newValue].checked = true;
    }
  }

  /**
   * @memberof RadioGroupPlugin
   * @return {string}
   */
  get currentValue() {
    return this._currentValue;
  }

}
