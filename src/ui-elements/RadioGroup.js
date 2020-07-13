import { BasePlugin } from '../base-plugins/BasePlugin';

/**
 * @export
 * @class RadioGroup
 */
export class RadioGroup extends BasePlugin {
  /**
   * creates an instance of RadioGroup
   * @constructor
   * @param {string} selector selector string for the radio group
   * @param {string} controlName the name of the control (used for warning logging only)
   * @param {string} [featureName='captionStyles'] the feature name used by Springroll. Defaults to captionStyles
   * @param {string} defaultValue the value attribute of the radio button that should be selected by default
   * @param {string} pluginName name of the plugin that instantiated the RadioGroup. Used for logging warnings
   * @memberof RadioGroupPlugin
   */
  constructor({selector, controlName, featureName = 'captionStyles', defaultValue, pluginName}) {
    super(pluginName);
    this.controlName = controlName;
    this.featureName = featureName;
    this.radioElements = document.querySelectorAll(selector);
    this.defaultValue = defaultValue;

    this.radioGroup = {};

    if (this.radioElements.length <= 0) {
      this.warn(`${this.controlName} RadioGroup found no HTMLElements with selector: ${selector}`);
      return;
    }

    this.radioElements.forEach(radio => {
      if (radio.type !== 'radio') {
        this.warn(`${this.controlName} was provided a non Radio Button element with selector: ${selector}`);
        return;
      }
      radio.value = radio.value.toLowerCase();

      this.radioGroup[radio.value] = radio;
    });

    if (!this.radioGroup[this.defaultValue]) {
      this.warn(`${this.controlName} RadioGroup for selector: ${selector} does not have a radio button with value ${this.defaultValue} to use as default value. Using first element as default`);
      this.defaultValue = this.radioElements[0].value.toLowerCase();
    }

    this.radioGroup[this.defaultValue].checked = true;
  }

  /**
   * @param {string[]} valuesArray Array of acceptable values to check against the radio group.
   * @return {boolean}
   * @memberof RadioGroup
   */
  hasOnly(valuesArray) {

    for (const key in this.radioGroup) {
      if (!valuesArray.includes(this.radioGroup[key].value)) {
        this.warn(`${this.controlName} radio button value: ${this.radioGroup[key].value} is not an accepted value. Skipping radio group`);
        return false;
      }
    }

    return true;
  }

  /**
   * @return {boolean}
   * @memberof RadioGroup
   */
  hasDuplicateValues() {
    return this.values.length !== [...new Set(this.values)].length;
  }

  /**
   * Adds change listeners to the radio buttons using the given callback function
   * @memberof RadioGroup
   * @param {Function} callBack event to fire on change
   */
  enableRadioEvents(callBack) {
    if (!this.radioGroup.length <= 0) {
      return;
    }

    const event = callBack;
    for (const radio in this.radioGroup) {
      this.radioGroup[radio].addEventListener('change', event);
    }
  }

  /**
   * removes the event listeners from the RadioGroup
   * @memberof RadioGroup
   * @param {Function} callBack event to fire on change
   */
  disableRadioEvents(callBack) {
    if (!this.radioGroup.length <= 0) {
      return;
    }
    for (const radio in this.radioGroup) {
      this.radioGroup[radio].removeEventListener('change', callBack);
    }
  }

  /**
   * enables display of the Radio buttons if the correct feature is present in the features list
   * @memberof RadioGroup
   * @param {object} data Object containing which features are enabled
   */
  displayRadios(data) {
    if (this.radioGroup.length <= 0 && data[this.featureName]) {
      this.warn(`${this.controlName} was not provided a valid input element or selector but '${this.featureName}' was included as a game feature`);
      return;
    }

    if (this.radioGroup.length <= 0) {
      return;
    }

    if (data[this.featureName]) {
      return;
    }

    for (const radio in this.radioGroup) {
      this.radioGroup[radio].style.display = 'none';
    }
  }

  /**
   * Reset the radio button states
   * @memberof RadioGroup
   */
  resetState() {
    this.radioGroup[this.defaultValue].checked = true;
  }

  /**
   * @readonly
   * @returns {number}
   * @memberof RadioGroup
   */
  get length() {
    return Object.keys(this.radioGroup).length;
  }

  /**
   * @readonly
   * @returns {number}
   * @memberof RadioGroup
   */
  get values() {
    return Object.values(this.radioGroup).map(radio => radio.value);
  }
}
