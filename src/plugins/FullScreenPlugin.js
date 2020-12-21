import { ButtonPlugin } from '../base-plugins/ButtonPlugin';
import { Button } from '../ui-elements';

const FULL_SCREEN = 'fullScreen';

/**
 * A Springroll plugin to easily set up togglable fullscreen
 */
export class FullScreenPlugin extends ButtonPlugin {
  
  /**
   *  Creates an instance of FullscreenPlugin
   * 
   * @param {string} targetElementSelector -The selector for the element to be made fullscreen
   * @param {string || HTMLElement } buttonSelector -The selector for the button or the HTMLElement Button to be used to toggle fullscreen on the targetElement
   */
  constructor(buttonSelector) {
    super({
      name: 'fullscreen'
    }); 

    this._toggleButtons = [];
    this.iFrame = null;

    if (buttonSelector instanceof HTMLElement) {
      this.toggleButton = buttonSelector;
      this.toggleButton.addEventListener('click', () => this.toggleFullScreen());
    } else {
      this.toggleButton = document.querySelectorAll(buttonSelector);
      this.toggleButton.forEach((button) => {
        // button.addEventListener('click', () => this.toggleFullScreen());
        this._toggleButtons.push(new Button({
          button: button,
          onClick: this.toggleFullScreen.bind(this),
          channel: 'fullScreen'
        }));
      });
    }

    document.onfullscreenchange =  () => {
      this.sendProperty('fullScreen', this.isFullScreen());
      
      this._toggleButtons.forEach((button) => {
        if (this.isFullScreen() ) {
          button.button.className = button.button.className ? button.button.className + ' --fullScreen' : ' --fullScreen';
        } else {
          button.button.className = button.button.className.replace(' --fullScreen', '');
        }
      });

    };
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
    this.sendProperty(FULL_SCREEN, this.isFullscreen());
  }

  /**
   * Toggles fullscreen on this.iFrame. Must be from a user generated event
   */
  toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.iFrame.requestFullscreen().then(() => {
        this.sendProperty('fullscreen', document.fullscreenElement != null ? 'true' : 'false');
      }).catch((err) => {
        console.log(err);
      });
    } else {
      document.exitFullscreen();
      this.sendProperty('fullscreen', !document.fullscreenElement ? 'true' : 'false');
    }
  }

  /**
   * Returns true if there is a fullscreen element and false if not
   * @returns { boolean } 
   */
  isFullScreen() {
    return (document.fullscreenElement || // basic
      document.webkitIsFullscreen || //Webkit browsers
      document.mozFullScreen || // Firefox
      document.msFullscreenElement !== undefined) && true; // IE
  }

  /** 
   * @readonly
   * @static
   * @memberof FullscreenPlugin
   */
  static get fullscreenKey() {
    return 'fullscreen';
  }
}