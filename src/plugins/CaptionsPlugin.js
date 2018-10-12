import { SavedData } from '../SavedData';
import { ButtonPlugin } from './ButtonPlugin';

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
    this.captionsButton = document.querySelector(captionsButton);

    if (!this.captionsButton) {
      console.warn(
        'SpringRollContainer: CaptionPlugin was not provided a button element'
      );
      return;
    }

    this.captionsButton.addEventListener(
      'click',
      this.captionsButtonClick.bind(this)
    );
    // Handle the features request
    this.client.on('features', function(features) {
      this.captionsButton.style.display = features.captions
        ? 'inline-block'
        : 'none';
    });

    //Set the defaults if we have none for the controls
    if (null === SavedData.read(CAPTIONS_MUTED)) {
      this.captionsMuted = true;
    }
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

  // Plugin interface functions
  /**
   * @memberof CaptionsPlugin
   */
  opened() {
    if (null === this.captionsButton) {
      return;
    }

    this.captionsButton.classList.remove('disabled');
    this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
    this.setCaptionsStyles(SavedData.read(CAPTIONS_STYLES));
  }

  /**
   * @memberof CaptionsPlugin
   */
  teardown() {
    if (null === this.captionsButton) {
      return;
    }

    this.captionsButton.removeEventListener(
      'click',
      this.captionsButtonClick.bind(this)
    );
  }

  /**
   * @memberof CaptionsPlugin
   */
  close() {
    if (null === this.captionsButton) {
      return;
    }

    super._disableButton(this.captionsButton);
  }
}
