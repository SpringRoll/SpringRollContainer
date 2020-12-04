import {
  ButtonPlugin
} from '../base-plugins/ButtonPlugin';
// import { bellhop } from 'bellhop-iframe';

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
  constructor(targetElementSelector, buttonSelector) {
    super({
      name: 'fullscreen'
    });

    if (buttonSelector instanceof HTMLElement) {
      this.toggleButton = buttonSelector;
      this.toggleButton.addEventListener('click', () => this.toggleFullScreen());
    } else {
      this.toggleButton = document.querySelectorAll(buttonSelector);
      this.toggleButton.forEach((button) => {
        button.addEventListener('click', () => this.toggleFullScreen());
      });
    }

    this.targetElement = document.querySelector(targetElementSelector);

  }

  /**
   * Toggles fullscreen on this.targetElement. Must be from a user generated event
   */
  toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.targetElement.requestFullscreen().then(() => {
        this.sendProperty('fullscreen', document.fullscreenElement != null ? 'true' : 'false');
      }).catch((err) => {
        throw err;
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
  isFullscreen() {
    return document.fullscreenElement || // basic
      document.webkitIsFullscreen || //Webkit browsers
      document.mozFullScreen || // Firefox
      document.msFullscreenElement !== undefined; // IE
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