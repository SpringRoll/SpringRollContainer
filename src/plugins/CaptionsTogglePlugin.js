import { SavedData } from '../SavedData';
import { ButtonPlugin } from '../base-plugins';
import { Button } from '../ui-elements';

/**
 * @export
 * @class CaptionsTogglePlugin
 * @property {Button[]} _captionsButtons An array of caption mute buttons
 * @property {boolean} _captionsMuted True if captions are muted
 * @property {number} captionsButtonLength The length of the captionsButtons array
 * @extends {ButtonPlugin}
 */
export class CaptionsTogglePlugin extends ButtonPlugin {
  /**
   *Creates an instance of CaptionsTogglePlugin.
   * @param {string | HTMLElement} captionsButtons selector string for one or more captions mute buttons
   * @memberof CaptionsTogglePlugin
   */
  constructor(captionsButtons) {
    super('Caption-Button-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);

    this._captionsButtons = [];

    if ( captionsButtons instanceof HTMLElement ) {
      this._captionsButtons[0] = new Button({
        button: captionsButtons,
        onClick: this.captionsButtonClick.bind(this),
        channel: 'captions'
      });
    } else {
      document.querySelectorAll(captionsButtons).forEach((button) => {
        this._captionsButtons.push(new Button({
          button: button,
          onClick: this.captionsButtonClick.bind(this),
          channel: 'captions'
        }));
      });
    }

    this._captionsMuted = false;
    this.captionsButtonLength = this._captionsButtons.length;

    if (0 >= this.captionsButtonLength) {
      this.warn(
        'Plugin was not provided any valid button or input elements'
      );
      return;
    }
  }

  /**
   * @memberof CaptionsTogglePlugin
   */
  init() {
    // Handle the features request
    this.client.on(
      'features',
      function($event) {
        for (let i = 0; i < this.captionsButtonLength; i ++) {
          this._captionsButtons[i].displayButton($event.data);
        }

        if (null === SavedData.read(CaptionsTogglePlugin.captionsToggleKey)) {
          return;
        }

        const captionsMuted = !!SavedData.read(CaptionsTogglePlugin.captionsToggleKey);

        this._setMuteProp('captionsMuted', this._captionsButtons, captionsMuted, true);

      }.bind(this)
    );
  }
  /**
  * @memberof CaptionsTogglePlugin
  */
  start() {
    for (let i = 0; i < this.captionsButtonsLength; i++) {
      this.captionsButtons[i].enableButton();
    }
    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
  *
  * Sends initial caption properties to the application
  * @memberof CaptionsTogglePlugin
  */
  sendAllProperties() {
    this.sendProperty(CaptionsTogglePlugin.captionsToggleKey, this.captionsMuted);
  }

  /**
   * @memberof CaptionsTogglePlugin
   */
  captionsButtonClick() {
    this.captionsMuted = !this.captionsMuted;
  }

  /**
   * @readonly
   * @memberof CaptionsTogglePlugin
   */
  get captionsMuted() {
    return this._captionsMuted;
  }

  /**
   * @param {boolean} muted
   * @memberof CaptionsTogglePlugin
   */
  set captionsMuted(muted) {
    this._captionsMuted = muted;
    this._setMuteProp(
      'captionsMuted',
      this._captionsButtons,
      this._captionsMuted
    );
  }

  /**
   * Get CaptionToggle Key
   * @readonly
   * @static
   * @memberof captionsToggleKey
   * @returns {string}
   */
  static get captionsToggleKey() {
    return 'captionsMuted';
  }
}
