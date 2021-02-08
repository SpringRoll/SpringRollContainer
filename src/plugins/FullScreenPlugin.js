import { ButtonPlugin } from '../base-plugins/ButtonPlugin';
import { Button } from '../ui-elements';

/**
 * A Springroll plugin to easily set up togglable fullscreen
 */
export class FullScreenPlugin extends ButtonPlugin {
  
  /**
   *  Creates an instance of FullscreenPlugin
   * 
   * @param {string | string[]} buttonSelector The selector for the element to be made fullscreen
   */
  constructor(buttonSelector) {
    super({
      name: FullScreenPlugin.fullscreenKey
    }); 

    this._toggleButtons = [];
    this.iFrame = null;

    this.sendAllProperties = this.sendAllProperties.bind(this);

    if (Array.isArray(buttonSelector)) {
      // If input is an array, join the selectors into one string
      buttonSelector = buttonSelector.join(', ');
    }

    console.log(buttonSelector);
    
    this.toggleButton = document.querySelectorAll(buttonSelector);


    this.toggleButton.forEach((button) => {
      this._toggleButtons.push(new Button({
        button: button,
        onClick: this.toggleFullScreen.bind(this),
        channel: FullScreenPlugin.fullscreenKey
      }));
    });
    

    document.addEventListener('fullscreenchange',  () => {
      this.sendAllProperties();
      
      this._toggleButtons.forEach((button) => {
        button.button.classList.toggle('--fullScreen');
      });

    });
  }

  /**
   * @memberof FullScreenPlugin
   */
  init({ iframe }) {
    this.iFrame = iframe;
    // Handle the features request
    this.client.on(
      'features',
      function($event) {
        for (let i = 0; i < this.fullscreenElement; i ++) {
          this._toggleButtons[i].displayButton($event.data);
        }

      }.bind(this)
    );
  }
  /**
  * @memberof FullScreenPlugin
  */
  start() {
    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
  *
  * Sends initial fullScreen properties to the application
  * @memberof FullScreenTogglePlugin
  */
  sendAllProperties() {
    this.sendProperty(FullScreenPlugin.fullscreenKey, document.fullscreenElement != null ? 'true' : 'false');
  }

  /**
   * Toggles fullscreen on this.iFrame. Must be from a user generated event
   */
  toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.iFrame.requestFullscreen().then(() => {
        this.sendAllProperties();
      }).catch((err) => {
        console.log(err);
      });
    } else {
      document.exitFullscreen();
      this.sendAllProperties();
    }
  }

  /**
   * Returns true if there is a fullscreen element and false if not
   * @returns { boolean } 
   */
  get isFullScreen() {
    return (document.fullscreenElement || // basic
      document.webkitIsFullscreen || //Webkit browsers
      document.mozFullScreen ) // Firefox
      != true; // Ensure boolean output
  }

  /** 
   * @readonly
   * @static
   * @memberof FullscreenPlugin
   */
  static get fullscreenKey() {
    return 'fullScreen';
  }
}