import { SavedData } from '../SavedData';
import { ButtonPlugin } from './ButtonPlugin';
import { Button } from '../ui-elements';

// Private Variables
const CAPTIONS_STYLES = 'captionsStyles';
const CAPTIONS_MUTED = 'captionsMuted';
const DEFAULT_CAPTIONS_STYLES = {
  size: 'md',
  background: 'black',
  color: 'white',
  edge: 'none',
  font: 'arial',
  align: 'top'
};
const FONT_SIZE_VALUES = ['sm', 'md', 'lg'];
const COLOR_VALUES = ['default', 'inverted'];
const ALIGN_VALUES = ['top', 'bottom'];

/**
 * @export
 * @class CaptionsPlugin
 * @property {object} captionsStyles The collection of captions styles
 * @property {string[]} fontSizeSelectors selector strings for the radio button groups
 * @property {string[]} colorSelectors selector strings for the radio button groups
 * @property {string[]} alignmentSelectors selector strings for the radio button groups
 * @property {Button[]} _captionsButtons array of caption mute buttons
 * @property {Object[]} fontSizeRadios array that contains each radio group
 * @property {Object[]} colorRadios array that contains each radio group
 * @property {Object[]} alignmentRadios array that contains each radio group
 * @property {number} captionsButtonsLength
 * @property {number} fontSizeRadiosLength
 * @property {number} colorRadiosLength
 * @property {number} alignmentRadiosLength
 * @extends {ButtonPlugin}
 */
export class CaptionsPlugin extends ButtonPlugin {
  /**
   *Creates an instance of CaptionsPlugin.
   * @param {string | HTMLElement} captionsButtons selector string for one or more captions mute buttons
   * @param {string } fontSizeRadios selector string for one or more radio groups for caption font size
   * @param {string } colorRadios selector string for one or more radio groups for caption font/background colors
   * @param {string } alignmentRadios selector string for one or more radio groups for caption position
   * @memberof CaptionsPlugin
   */
  constructor({ captionsButtons, fontSizeRadios, colorRadios, alignmentRadios } = {}) {
    super('Caption-Button-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.captionsStyles = Object.assign(
      {},
      DEFAULT_CAPTIONS_STYLES,
      SavedData.read(CAPTIONS_STYLES) || {}
    );

    //split the selector strings into individual selectors.
    //Helps keep the input style consistent across plugins.
    this.fontSizeSelectors = fontSizeRadios ? fontSizeRadios.split(',') : [];
    this.colorSelectors = colorRadios ? colorRadios.split(',') : [];
    this.alignmentSelectors = alignmentRadios ? alignmentRadios.split(',') : [];

    this._captionsButtons = [];
    this.fontSizeRadios = [];
    this.colorRadios = [];
    this.alignmentRadios = [];

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

    this.fontSizeSelectors.forEach((selector) => {
      const radios = document.querySelectorAll(selector);
      if (radios.length !== 3) {
        console.warn(`SpringrollContainer: CaptionsPlugin did not find exactly 3 radio buttons for font size with Selector "${selector}". Skipping selector`);
        return;
      }

      //convert values to lowercase for easier checking later on
      radios[0].value = radios[0].value.toLowerCase();
      radios[1].value = radios[1].value.toLowerCase();
      radios[2].value = radios[2].value.toLowerCase();

      if (FONT_SIZE_VALUES.indexOf(radios[0].value) === -1) {
        console.warn(`CaptionsPlugin: Font Size radio button value: ${radios[0].value} is not an accepted value. Skipping radio group`);
        return;
      }
      if (FONT_SIZE_VALUES.indexOf(radios[1].value) === -1) {
        console.warn(`CaptionsPlugin: Font Size radio button value: ${radios[1].value} is not an accepted value. Skipping radio group`);
        return;
      }
      if (FONT_SIZE_VALUES.indexOf(radios[2].value) === -1) {
        console.warn(`CaptionsPlugin: Font Size radio button value: ${radios[2].value} is not an accepted value. Skipping radio group`);
        return;
      }

      const group = {};

      group[radios[0].value] = radios[0];
      group[radios[1].value] = radios[1];
      group[radios[2].value] = radios[2];

      if (!group.sm || !group.md || !group.lg) {
        console.warn(`CaptionsPlugin: Duplicate radio button values detected (values: ${radios[0].value}, ${radios[1].value}, ${radios[2].value}). Skipping radio group`);
        return;
      }

      this.fontSizeRadios.push(group);

      this.fontSizeRadios[this.fontSizeRadios.length - 1][this.captionsStyles.size].checked = true;
    });

    this.colorSelectors.forEach((selector) => {
      const radios = document.querySelectorAll(selector);
      if (radios.length !== 2) {
        console.warn(`SpringrollContainer: CaptionsPlugin did not find exactly 2 radio buttons for font color with Selector "${selector}". Skipping selector`);
        return;
      }

      //convert values to lowercase for easier checking later on
      radios[0].value = radios[0].value.toLowerCase();
      radios[1].value = radios[1].value.toLowerCase();

      if (COLOR_VALUES.indexOf(radios[0].value) === -1) {
        console.warn(`CaptionsPlugin: Caption color radio button value: ${radios[0].value} is not an accepted value. Skipping radio group`);
        return;
      }
      if (COLOR_VALUES.indexOf(radios[1].value) === -1) {
        console.warn(`CaptionsPlugin: Caption color radio button value: ${radios[1].value} is not an accepted value. Skipping radio group`);
        return;
      }

      if (radios[0].value === radios[1].value) {
        console.warn(`CaptionsPlugin: Duplicate radio values detected (value: ${radios[0]}). Skipping radio group`);
      }

      const group = {};
      group[radios[0].value] = radios[0];
      group[radios[1].value] = radios[1];



      this.colorRadios.push(group);

      if (this.getCaptionsStyles('background') === 'black') {
        this.colorRadios[this.colorRadios.length - 1].default.checked = true;
      } else {
        this.colorRadios[this.colorRadios.length - 1].inverted.checked = true;
      }

    });

    this.alignmentSelectors.forEach((selector) => {
      const radios = document.querySelectorAll(selector);
      if (radios.length !== 2) {
        console.warn(`CaptionsPlugin did not find exactly 2 radio buttons for caption alignment with Selector "${selector}". Skipping selector`);
        return;
      }

      //convert values to lowercase for easier checking later on
      radios[0].value = radios[0].value.toLowerCase();
      radios[1].value = radios[1].value.toLowerCase();

      if (ALIGN_VALUES.indexOf(radios[0].value) === -1) {
        console.warn(`CaptionsPlugin: Caption alignment radio button value: ${radios[0].value} is not an accepted value. Skipping radio group`);
        return;
      }
      if (ALIGN_VALUES.indexOf(radios[1].value) === -1) {
        console.warn(`CaptionsPlugin: Caption alignment radio button value: ${radios[1].value} is not an accepted value. Skipping radio group`);
        return;
      }

      if (radios[0].value === radios[1].value) {
        console.warn(`CaptionsPlugin: Duplicate radio values detected (value: ${radios[0]}). Skipping radio group`);
      }

      const group = {};
      group[radios[0].value] = radios[0];
      group[radios[1].value] = radios[1];



      this.alignmentRadios.push(group);

      this.alignmentRadios[this.alignmentRadios.length - 1][this.captionsStyles.align].checked = true;
    });

    this._captionsMuted = false;

    this.captionsButtonLength = this._captionsButtons.length;
    this.alignmentRadiosLength = this.alignmentRadios.length;
    this.fontSizeRadiosLength = this.fontSizeRadios.length;
    this.colorRadiosLength = this.colorRadios.length;

    if (0 >= (this.captionsButtonLength + this.alignmentRadiosLength + this.fontSizeRadiosLength + this.colorRadiosLength)) {
      console.warn(
        'SpringRollContainer: CaptionPlugin was not provided any valid button or input elements'
      );
      return;
    }

    //set up change events
    for (let i = 0; i < this.colorRadiosLength; i++) {
      this.colorRadios[i].default.addEventListener('change', this.onColorChange.bind(this));
      this.colorRadios[i].inverted.addEventListener('change', this.onColorChange.bind(this));
    }
    for (let i = 0; i < this.alignmentRadiosLength; i++) {
      this.alignmentRadios[i].top.addEventListener('change', this.onAlignmentChange.bind(this));
      this.alignmentRadios[i].bottom.addEventListener('change', this.onAlignmentChange.bind(this));
    }
    for (let i = 0; i < this.fontSizeRadiosLength; i++) {
      this.fontSizeRadios[i].sm.addEventListener('change', this.onFontSizeChange.bind(this));
      this.fontSizeRadios[i].md.addEventListener('change', this.onFontSizeChange.bind(this));
      this.fontSizeRadios[i].lg.addEventListener('change', this.onFontSizeChange.bind(this));
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
        for (let i = 0; i < this.captionsButtonLength; i ++) {
          this._captionsButtons[i].displayButton($event.data);
        }
        if (!$event.data.captions) {
          for (let i = 0; i < this.colorRadiosLength; i++) {
            this.colorRadios[i].default.style.display = 'none';
            this.colorRadios[i].inverted.style.display = 'none';
          }
          for (let i = 0; i < this.alignmentRadiosLength; i++) {
            this.alignmentRadios[i].top.style.display = 'none';
            this.alignmentRadios[i].bottom.style.display = 'none';
          }
          for (let i = 0; i < this.fontSizeRadiosLength; i++) {
            this.fontSizeRadios[i].sm.style.display = 'none';
            this.fontSizeRadios[i].md.style.display = 'none';
            this.fontSizeRadios[i].lg.style.display = 'none';
          }
        }
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
   * @memberof CaptionsPlugin
   */
  captionsButtonClick() {
    this.captionsMuted = !this.captionsMuted;

    for (let i = 0; i < this.captionsButtonLength; i ++) {
      this._captionsButtons[i].button.classList.add(this.captionsMuted ? 'muted' : 'unmuted');
    }
  }

  /**
   * Fired whenever the font size radios are updated
   * @memberof CaptionsPlugin
   */
  onFontSizeChange(e) {
    this.setCaptionsStyles('size', e.target.value);

    this.fontSizeRadios.forEach((group) => {
      group[e.target.value].checked = true;
    });
  }

  /**
   * Fired whenever the alignment radios are updated
   * @param {Event} e
   * @memberof CaptionsPlugin
   */
  onAlignmentChange(e) {
    this.setCaptionsStyles('align', e.target.value);

    this.alignmentRadios.forEach((group) => {
      group[e.target.value].checked = true;
    });
  }

  /**
   * Fired whenever the color radios are updated
   * @param {Event} e
   * @memberof CaptionsPlugin
   */
  onColorChange(e) {
    const styles = e.target.value === 'default' ? {color: 'white', background: 'black'} : {color: 'black', background: 'white'};

    this.setCaptionsStyles(styles);

    this.colorRadios.forEach((group) => {
      group[e.target.value].checked = true;
    });
  }

  /**
   * Reset the captions styles
   * @param {Event} e
   * @memberof CaptionsPlugin
   */
  clearCaptionsStyles() {
    this.captionsStyles = Object.assign({}, DEFAULT_CAPTIONS_STYLES);
    this.setCaptionsStyles();
    this.colorRadios.forEach((group) => {
      group.default.checked = true;
    });
    this.alignmentRadios.forEach((group) => {
      group.top.checked = true;
    });
    this.fontSizeRadios.forEach((group) => {
      group.md.checked = true;
    });
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
   * @param {string} [styles.background='black'] The background style, black
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
