import { BasePlugin } from '../base-plugins';
import { SavedData } from '../SavedData';

/**
 * @export
 * @class KeyboardMapPlugin
 * @extends {BasePlugin}
 */
export class KeyboardMapPlugin extends BasePlugin {
  /**
   *Creates an instance of KeyboardMapPlugin.
   * @param {string | HTMLElement} keyContainers //div or similar container element that will contain the remappable keys
   * @memberof KeyboardMapPlugin
   */
  constructor(keyContainers) {
    super('Keyboard-Map-Plugin');

    this.sendAllProperties = this.sendAllProperties.bind(this);
    //Allows for removing and readding event listeners
    this.bindKey = this.bindKey.bind(this);
    this.onKeyButtonClick = this.onKeyButtonClick.bind(this);

    this.keyContainers =
      keyContainers instanceof HTMLElement
        ? [keyContainers]
        : document.querySelectorAll(keyContainers);

    this.keyBindings = {};
    this.buttons = [];
    this.activekeyButton;

    this.sendAfterFetch = false;
    this.canEmit = false;

    this.keyContainersLength = this.keyContainers.length;

    if (this.keyContainersLength <= 0) {
      this.warn('plugin was not provided any valid key binding container elements');
      return;
    }
  }

  /**
   * @memberof KeyboardMapPlugin
   * @param {MouseEvent} e
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
   * @memberof KeyboardMapPlugin
   * @param {KeyboardEvent} key
   * Actually updates the key binding and sends the value. Also
   * replicates the new key across the other keycontainers
   */
  bindKey(key) {
    key.preventDefault(); //prevents space bar from retriggering a keybinding when set.

    for (const actionName in this.keyBindings) {
      if (this.keyBindings[actionName].currentKey === key.key.toLowerCase()) {
        this.warn(`${key.key} is already bound`);
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

    this.sendProperty(KeyboardMapPlugin.keyBindingKey, this.keyBindings);
  }

  /**
   * @memberof KeyboardMapPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
        }

        if (!features.data.keyBinding) {
          return;
        }

        const data = SavedData.read(KeyboardMapPlugin.keyBindingKey);

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
* @memberof KeyboardMapPlugin
*/
  sendAllProperties() {
    if (this.canEmit) {
      this.sendProperty(KeyboardMapPlugin.keyBindingKey, this.keyBindings);
    } else {
      this.sendAfterFetch = true;
    }
  }

  /**
   * @readonly
   * @static
   * @memberof KeyboardMapPlugin
   */
  static get keyBindingKey() {
    return 'keyBinding';
  }
}
