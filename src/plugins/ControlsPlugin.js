import { BasePlugin } from './BasePlugin';
import { Slider } from '../ui-elements/Slider';
import { SavedData } from '../SavedData';

/**
 * @export
 * @class ControlsPlugin
 * @extends {BasePlugin}
 */
export class ControlsPlugin extends BasePlugin {
  /**
   *Creates an instance of ControlsPlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.sensitivitySlider
   * @param {number} [params.defaultSensitivity=0.5]
   * @memberof ControlsPlugin
   */
  constructor({ sensitivitySlider, defaultSensitivity = 0.5, keyContainer } = {}) {
    super('Control-Button-Plugin');

    this.controlSensitivity = defaultSensitivity;
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.keyContainer =
      keyContainer instanceof HTMLElement
        ? keyContainer
        : document.querySelector(keyContainer);
    this.keyBindings = {};
    this.buttons = [];
    this.activekeyButton;
    this.sendAfterFetch = false;
    this.canEmit = false;

    this.sensitivitySlider = new Slider({
      slider: sensitivitySlider,
      control: ControlsPlugin.controlSensitivityKey,
      defaultValue: this.controlSensitivity
    });

    this.sensitivitySlider.enableSliderEvents(
      this.onControlSensitivityChange.bind(this)
    );

    this.controlSensitivity = this.sensitivitySlider.value;

    //Allows for removing and readding event listeners
    this.bindKey = this.bindKey.bind(this);
    this.onKeyButtonClick = this.onKeyButtonClick.bind(this);
  }

  /**
   * @memberof ControlsPlugin
   */
  onControlSensitivityChange() {
    this.controlSensitivity = this.sensitivitySlider.sliderRange(
      Number(this.sensitivitySlider.slider.value)
    );
    this.sendProperty(
      ControlsPlugin.controlSensitivityKey,
      this.controlSensitivity
    );
  }

  /**
   * @memberof ControlsPlugin
   */
  onKeyButtonClick(e) {
    for (let i = 0, l = this.buttons.length; i < l; i++) {
      this.buttons[i].removeEventListener('click', this.onKeyButtonClick);
    }
    this.activekeyButton = e.target;
    this.activekeyButton.textContent = 'Press Key to Map';
    document.addEventListener('keyup', this.bindKey);
  }

  /**
   * @memberof ControlsPlugin
   */
  bindKey(key) {
    key.preventDefault(); //prevents space bar from retriggering a keybinding when set.

    for (const actionName in this.keyBindings) {
      if (this.keyBindings[actionName].currentKey === key.key.toLowerCase()) {
        console.warn(`${key.key} is already bound`);
        return;
      }
    }

    this.activekeyButton.textContent = key.key === ' ' ? 'space' : key.key;
    //this.activekeyButton.value = key.key === ' ' ? 'space' : key.key;
    this.keyBindings[this.activekeyButton.value].currentKey = key.key;

    document.removeEventListener('keyup', this.bindKey);
    for (let i = 0, l = this.buttons.length; i < l; i++) {
      this.buttons[i].addEventListener('click', this.onKeyButtonClick);
    }

    this.sendProperty(ControlsPlugin.keyBindingKey, this.keyBindings);
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
        this.sensitivitySlider.displaySlider(features.data);

        if (!features.data.keyBinding) {
          return;
        }

        const data = SavedData.read(ControlsPlugin.keyBindingKey);

        this.client.fetch('keyBindings', result => {
          for (let i = 0, l = result.data.length; i < l; i++) {
            let currentKey = result.data[i].defaultKey.toLowerCase();
            if (data) {
              if (data[result.data[i].actionName]) {
                currentKey = data[result.data[i].actionName].currentKey;
              }
            }
            console.log(currentKey);
            this.keyBindings[result.data[i].actionName] = {
              defaultKey: result.data[i].defaultKey.toLowerCase(),
              currentKey: currentKey,
            };
            this.buttons[i] = document.createElement('button');
            this.buttons[i].classList.add('key-binding__button');
            this.buttons[i].value = result.data[i].actionName;
            this.buttons[i].textContent = result.data[i].defaultKey;
            this.buttons[i].addEventListener('click', this.onKeyButtonClick);

            this.label = document.createElement('label');
            this.label.textContent = result.data[i].actionName;

            this.keyContainer.appendChild(this.label);
            this.keyContainer.appendChild(this.buttons[i]);
          }

          this.canEmit = true;
          if (this.sendAfterFetch) {
            this.sendAllProperties();
          }
        });
      }.bind(this)
    );
  }

  /**
*
* Sends initial caption properties to the application
* @memberof ControlsPlugin
*/
  sendAllProperties() {
    if (this.canEmit) {
      this.sendProperty(ControlsPlugin.controlSensitivityKey, this.controlSensitivity);
      this.sendProperty(ControlsPlugin.keyBindingKey, this.keyBindings);
    } else {
      this.sendAfterFetch = true;
    }
  }

  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get controlSensitivityKey() {
    return 'controlSensitivity';
  }

  /**
   * @readonly
   * @static
   * @memberof ControlsPlugin
   */
  static get keyBindingKey() {
    return 'keyBinding';
  }
}
