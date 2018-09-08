import { SavedData } from '../SavedData';
import { BasePlugin } from './BasePlugin';

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

export class CaptionsPlugin extends BasePlugin {
  constructor(captionButton, bellhop) {
    super(70);
    this.captionsStyles = Object.assign(
      {},
      DEFAULT_CAPTIONS_STYLES,
      SavedData.read(CAPTIONS_STYLES) || {}
    );

    if (bellhop instanceof Bellhop) {
      this.client = bellhop;

      // Handle the features request
      this.client.on('features', function(features) {
        this.captionsButton.style.display = 'none';
        if (features.captions)
        {this.captionsButton.style.display = 'inline-block';}
      });
    }

    //Set the defaults if we have none for the controls
    if (null === SavedData.read(CAPTIONS_MUTED)) {
      this.captionsMuted = true;
    }

    this.captionsButton = document.querySelector(captionButton);

    if (this.captionsButton instanceof HTMLElement) {
      this.captionsButton.addEventListener(
        'click',
        this.captionsButtonClick.bind(this)
      );
    }
  }

  captionsButtonClick() {
    this.captionsMuted = !this.captionsMuted;
  }

  clearCaptionsStyles() {
    this._captionsStyles = Object.assign({}, DEFAULT_CAPTIONS_STYLES);
    this.setCaptionsStyles();
  }

  getCaptionsStyles(prop) {
    return prop ? this._captionsStyles[prop] : this._captionsStyles;
  }

  opened() {
    if (null === this.captionsButton) {
      return;
    }

    this.captionsButton.classList.remove('disabled');
    this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
    this.setCaptionsStyles(SavedData.read(CAPTIONS_STYLES));
  }

  teardown() {
    if (null === this.captionsButton) {
      return;
    }

    this.captionsButton.removeEventListener('click', this.captionsButtonClick);
  }

  setCaptionsStyles(styles, value) {
    if (typeof styles === 'object') {
      Object.assign(this._captionsStyles, styles || {});
    } else if (typeof styles === 'string') {
      this._captionsStyles[styles] = value;
    }

    styles = this._captionsStyles;

    SavedData.write(CAPTIONS_STYLES, styles);
    if (this.client) {
      this.client.send(CAPTIONS_STYLES, styles);
    }
  }
}
