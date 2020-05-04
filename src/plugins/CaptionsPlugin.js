import { SavedData } from '../SavedData';
import { ButtonPlugin } from './ButtonPlugin';
import { Button } from '../ui-elements';

// Private Variables
const CAPTIONS_STYLES = 'captionsStyles';
const CAPTIONS_MUTED = 'captionsMuted';
const DEFAULT_CAPTIONS_STYLES = {
  size: 'md',
  background: 'black-semi',
  color: 'white',
  edge: 'none',
  font: 'arial',
  align: 'top'
};

/**
 * @export
 * @class CaptionsPlugin
 * @property {object} captionsStyles The collection of captions styles
 * @extends {ButtonPlugin}
 */
export class CaptionsPlugin extends ButtonPlugin {
  /**
   *Creates an instance of CaptionsPlugin.
   * @param {string | HTMLElement} captionsButtons selector string for one or more captions mute buttons
   * @memberof CaptionsPlugin
   */
  constructor(captionsButtons) {
    super('Caption-Button-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.captionsStyles = Object.assign(
      {},
      DEFAULT_CAPTIONS_STYLES,
      SavedData.read(CAPTIONS_STYLES) || {}
    );

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

    if (this._captionsButtons.length <= 0) {
      console.warn(
        'SpringRollContainer: CaptionPlugin was not provided any valid button elements'
      );
      return;
    }

    this.captionsButtonLength = this._captionsButtons.length;
  }

  /**
   * @memberof CaptionsPlugin
   */
  init() {
    // Handle the features request
    this.client.on(
      'features',
      function($event) {
        for (let i = 0; i < this.captionsButtonLength; i ++) {
          this._captionsButtons[i].displayButton($event.data);
        }
        //this._captionsButtons.forEach.displayButton($event.data);
        if (null === SavedData.read(CAPTIONS_MUTED)) {
          return;
        }

        this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
      }.bind(this)
    );

    this.client.on(
      'caption-set-style',
      function($event) {
        this.setCaptionsStyles($event.data || {});
      }.bind(this)
    );

    for (let i = 0; i < this.captionsButtonLength; i ++) {
      this._captionsButtons[i].enableButton();
    }
    // this._captionsButton.enableButton();
  }
  /**
  * @memberof CaptionsPlugin
  */
  start() {
    this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
    this.setCaptionsStyles(SavedData.read(CAPTIONS_STYLES));

    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
  *
  * Sends initial caption properties to the application
  * @memberof CaptionsPlugin
  */
  sendAllProperties() {
    this.sendProperty(CAPTIONS_MUTED, this.captionsMuted);
    this.sendProperty(CAPTIONS_STYLES, this.captionsStyles);
  }

  /**
   *
   *
   * @memberof CaptionsPlugin
   */
  captionsButtonClick() {
    this.captionsMuted = !this.captionsMuted;

    for (let i = 0; i < this.captionsButtonLength; i ++) {
      this._captionsButtons[i].button.dataset['captionsMuted'] = this.captionsMuted;
    }
  }

  /**
   * Reset the captions styles
   * @memberof CaptionsPlugin
   */
  clearCaptionsStyles() {
    this.captionsStyles = Object.assign({}, DEFAULT_CAPTIONS_STYLES);
    this.setCaptionsStyles();
  }

  /**
   * Get the captions styles
   * @param {string} [prop] The optional property, values are "size", "edge", "font", "background", "color"
   * @return {object | string} The collection of styles, see setCaptionsStyles for more info.
   * @memberof CaptionsPlugin
   */
  getCaptionsStyles(prop) {
    return prop ? this.captionsStyles[prop] : this.captionsStyles;
  }

  /**
   * Set the captions styles
   *
   * @param {object} [styles] The style options or the name of the
   * property (e.g., "color", "edge", "font", "background", "size")
   * @param {string} [styles.color='white'] The text color, the default is white
   * @param {string} [styles.edge='none'] The edge style, default is none
   * @param {string} [styles.font='arial'] The font style, default is arial
   * @param {string} [styles.background='black-semi'] The background style, black semi-transparent
   * @param {string} [styles.size='md'] The font style default is medium
   * @param {string} [styles.align='top'] The align style default is top of the window
   * @param {string} [value=''] If setting styles parameter as a string, this is the value of the property.
   * @memberof CaptionsPlugin
   */
  setCaptionsStyles(styles = DEFAULT_CAPTIONS_STYLES, value = '') {
    if (typeof styles === 'object') {
      Object.assign(this.captionsStyles, styles);
    } else if (typeof styles === 'string') {
      this.captionsStyles[styles] = value;
    }

    SavedData.write(CAPTIONS_STYLES, this.captionsStyles);
    if (this.client) {
      this.client.send(CAPTIONS_STYLES, this.captionsStyles);
    }
  }

  /**
   * @readonly
   * @memberof CaptionsPlugin
   */
  get captionsMuted() {
    return this._captionsMuted;
  }

  /**
   * @param {boolean} muted
   * @memberof CaptionsPlugin
   */
  set captionsMuted(muted) {
    this._captionsMuted = muted;
    this._setMuteProp(
      'captionsMuted',
      this.captionsButton,
      this._captionsMuted
    );
  }
}
