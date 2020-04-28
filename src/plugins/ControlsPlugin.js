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
  constructor({ sensitivitySliders, defaultSensitivity = 0.5, keyContainers } = {}) {
    super('Control-Button-Plugin');

    this.controlSensitivity = defaultSensitivity;
    this.sensitivitySliders = [];
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.keyContainers =
      keyContainers instanceof HTMLElement
        ? [keyContainers]
        : document.querySelectorAll(keyContainers);

    this.keyBindings = {};
    this.buttons = [];
    this.activekeyButton;

    this.sendAfterFetch = false;
    this.canEmit = false;

    if (sensitivitySliders instanceof HTMLElement) {
      this.sensitivitySliders[0] = new Slider({
        slider: sensitivitySliders,
        control: ControlsPlugin.controlSensitivityKey,
        defaultValue: this.controlSensitivity
      });
    } else {
      document.querySelectorAll(sensitivitySliders).forEach((slider) => {
        const newSlider = new Slider({
          slider: slider,
          control: ControlsPlugin.controlSensitivityKey,
          defaultValue: this.controlSensitivity
        });
        if (newSlider.slider) {
          this.sensitivitySliders.push(newSlider);
        }
      });
    }

    this.sensitivitySlidersLength = this.sensitivitySliders.length;
    this.keyContainersLength = this.keyContainers.length;

    //Allows for removing and readding event listeners
    this.bindKey = this.bindKey.bind(this);
    this.onKeyButtonClick = this.onKeyButtonClick.bind(this);

    if (this.sensitivitySlidersLength <= 0 && this.keyContainersLength <= 0) {
      console.warn('ControlsPlugin was not provided any valid input elements, or key binding containers');
      return;
    }
    if (this.sensitivitySliders[0].slider) {
      this.controlSensitivity = this.sensitivitySliders[0].value;
      for (let i = 0; i < this.sensitivitySlidersLength; i++) {
        this.sensitivitySliders[i].enableSliderEvents(
          this.onControlSensitivityChange.bind(this)
        );
      }
    }
  }

  /**
   * @memberof ControlsPlugin
   * Sets the new controlSensitivity value, and replicates that value across the other sliders
   */
  onControlSensitivityChange(e) {
    this.controlSensitivity = this.sensitivitySliders[0].sliderRange(
      Number(e.target.value)
    );

    this.sendProperty(
      ControlsPlugin.controlSensitivityKey,
      this.controlSensitivity
    );

    for (let i = 0; i < this.sensitivitySlidersLength; i++) {
      this.sensitivitySliders[i].value = this.controlSensitivity;
    }

    console.log(this.sensitivitySliders);
    console.log(this.sensitivitySliders[0].value, this.sensitivitySliders[1].value);
  }

  /**
   * @memberof ControlsPlugin
   * Sets up a rebinding of a key once a key button is clicked.
   */
  onKeyButtonClick(e) {

    for (let i = 0, l = this.buttons.length; i < l; i++) {
      for (let j = 0; j < this.buttons[i].length; j++) {
        this.buttons[i][j].removeEventListener('click', this.onKeyButtonClick);
      }
    }
    this.activekeyButton = e.target;
    this.activekeyButton.textContent = 'Press Key to Map';
    document.addEventListener('keyup', this.bindKey);
  }

  /**
   * @memberof ControlsPlugin
   * Actually updates the key binding and sends the value. Also
   * replicates the new key across the other keycontainers
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
    for (let i = 0; i < this.buttons.length; i++) {
      for (let j = 0; j < this.buttons[i].length; j++) {
        if (this.buttons[i][j].value === this.activekeyButton.value) {
          this.buttons[i][j].textContent = this.activekeyButton.textContent;
        }
      }
    }

    this.keyBindings[this.activekeyButton.value].currentKey = key.key;

    document.removeEventListener('keyup', this.bindKey);
    for (let i = 0, l = this.buttons.length; i < l; i++) {
      for (let j = 0; j < this.buttons[i].length; j++) {
        this.buttons[i][j].addEventListener('click', this.onKeyButtonClick);
      }
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
        for (let i = 0; i < this.sensitivitySlidersLength; i++) {
          this.sensitivitySliders[i].displaySlider(features.data);
        }

        if (!features.data.keyBinding) {
          return;
        }

        const data = SavedData.read(ControlsPlugin.keyBindingKey);

        this.client.fetch('keyBindings', result => {
          for (let j = 0; j < this.keyContainersLength; j++) {
            this.buttons[j] = [];

            for (let i = 0, l = result.data.length; i < l; i++) {
              let currentKey = result.data[i].defaultKey.toLowerCase();
              if (data) {
                if (data[result.data[i].actionName]) {
                  currentKey = data[result.data[i].actionName].currentKey;
                }
              }
              //only needs to be set up once
              if (j === 0) {
                this.keyBindings[result.data[i].actionName] = {
                  defaultKey: result.data[i].defaultKey.toLowerCase(),
                  currentKey: currentKey,
                };
              }
              console.log(this.buttons, j);
              this.buttons[j][i] =  document.createElement('button');
              this.buttons[j][i].classList.add('key-binding__button');
              this.buttons[j][i].value = result.data[i].actionName;
              this.buttons[j][i].textContent = result.data[i].defaultKey;
              this.buttons[j][i].addEventListener('click', this.onKeyButtonClick);

              this.label = document.createElement('label');
              this.label.textContent = result.data[i].actionName;

              this.keyContainers[j].appendChild(this.label);
              this.keyContainers[j].appendChild(this.buttons[j][i]);
            }
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
