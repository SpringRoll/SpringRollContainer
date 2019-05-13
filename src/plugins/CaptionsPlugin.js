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
   * @param {string} captionsButton
   * @memberof CaptionsPlugin
   */
  constructor(captionsButton) {
    super('Caption-Button-Plugin');
    this.captionsStyles = Object.assign(
      {},
      DEFAULT_CAPTIONS_STYLES,
      SavedData.read(CAPTIONS_STYLES) || {}
    );
    this._captionsButton = new Button({
      button: captionsButton,
      onClick: this.captionsButtonClick.bind(this),
      channel: 'captions'
    });
    this._captionsMuted = false;

    if (!this._captionsButton) {
      console.warn(
        'SpringRollContainer: CaptionPlugin was not provided a button element'
      );
      return;
    }
  }

  /**
   * @memberof CaptionsPlugin
   */
  init() {
    // Handle the features request
    this.client.on(
      'features',
      function($event) {
        this._captionsButton.displayButton($event.data);
        if (null === SavedData.read(CAPTIONS_MUTED)) {
          return;
        }

        this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
      }.bind(this)
    );

    this.client.on('loaded', () => {});
    this.client.on('loadDone', () => {});

    this.client.on(
      'caption-set-style',
      function($event) {
        this.setCaptionsStyles($event.data || {});
      }.bind(this)
    );

    this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
    this.setCaptionsStyles(SavedData.read(CAPTIONS_STYLES));

    this._captionsButton.enableButton();
  }

  /**
   *
   *
   * @memberof CaptionsPlugin
   */
  captionsButtonClick() {
    this.captionsMuted = !this.captionsMuted;
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

  /**
   * @readonly
   * @memberof CaptionsPlugin
   */
  get captionsButton() {
    return this._captionsButton.button;
  }
}
