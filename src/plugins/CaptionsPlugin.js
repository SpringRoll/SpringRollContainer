import { SavedData } from '../SavedData';
import { ButtonPlugin } from './ButtonPlugin';
import { Button, RadioGroup } from '../ui-elements';

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

const DEFAULT_COLOR_STYLE = {color: 'black', background: 'white'};
const INVERTED_COLOR_STYLE = {color: 'white', background: 'black'};
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

    this.fontSizeRadios = this.setUpFontSizeRadios(this.fontSizeSelectors);
    this.colorRadios = this.setUpColorRadios(this.colorSelectors);
    this.alignmentRadios = this.setUpAlignmentRadios(this.alignmentSelectors);

    this._captionsMuted = false;

    this.captionsButtonLength = this._captionsButtons.length;
    this.alignmentRadiosLength = this.alignmentRadios.length;
    this.fontSizeRadiosLength = this.fontSizeRadios.length;
    this.colorRadiosLength = this.colorRadios.length;

    if (0 >= (this.captionsButtonLength + this.alignmentRadiosLength + this.fontSizeRadiosLength + this.colorRadiosLength)) {
      this.warn(
        'Plugin was not provided any valid button or input elements'
      );
      return;
    }

    //set up change events
    for (let i = 0; i < this.colorRadiosLength; i++) {
      this.colorRadios[i].enableRadioEvents(this.onColorChange.bind(this));
    }
    for (let i = 0; i < this.alignmentRadiosLength; i++) {
      this.alignmentRadios[i].enableRadioEvents(this.onAlignmentChange.bind(this));
    }
    for (let i = 0; i < this.fontSizeRadiosLength; i++) {
      this.fontSizeRadios[i].enableRadioEvents(this.onFontSizeChange.bind(this));
    }
  }

  /**
   * @memberof CaptionsPlugin
   * @param {string[]} selectors the separated selector strings used to target the radio button groups
   * @returns {RadioGroup[]}
   */
  setUpFontSizeRadios(selectors) {
    const radioGroups = [];

    selectors.forEach((selector) => {
      const radioGroup = new RadioGroup({
        selector: selector.trim(),
        controlName: 'Font Size',
        defaultValue: 'md',
        pluginName: 'Caption-Button-Plugin'
      });

      if (radioGroup.length !== 3) {
        this.warn(`Selector "${selector}" did not find exactly three(3) radio buttons for caption font size. Skipping selector`);
        return;
      }

      if (!radioGroup.hasOnly(FONT_SIZE_VALUES)) {
        return;
      }

      if (radioGroup.hasDuplicateValues()) {
        this.warn(`Duplicate radio button values detected (values: ${radioGroup.values} ). Skipping radio group`);
        return;
      }

      radioGroups.push(radioGroup);
    });

    return radioGroups;
  }

  /**
   * @memberof CaptionsPlugin
   * @param {string[]} selectors the separated selector strings used to target the radio button groups
   * @returns {RadioGroup[]}
   */
  setUpColorRadios(selectors) {
    const radioGroups = [];

    selectors.forEach((selector) => {
      const radioGroup = new RadioGroup({
        selector: selector.trim(),
        controlName: 'Color',
        defaultValue: 'default',
        pluginName: 'Caption-Button-Plugin'
      });

      if (radioGroup.length !== 2) {
        this.warn(`Selector "${selector}" did not find exactly two(2) radio buttons for caption colors. Skipping selector`);
        return;
      }

      if (!radioGroup.hasOnly(COLOR_VALUES)) {
        return;
      }

      if (radioGroup.hasDuplicateValues()) {
        this.warn(`Duplicate radio button values detected (values: ${radioGroup.values} ). Skipping radio group`);
        return;
      }

      radioGroups.push(radioGroup);
    });

    return radioGroups;
  }

  /**
   * @memberof CaptionsPlugin
   * @param {string[]} selectors the separated selector strings used to target the radio button groups
   * @returns {RadioGroup[]}
   */
  setUpAlignmentRadios(selectors) {
    const radioGroups = [];

    selectors.forEach((selector) => {
      const radioGroup = new RadioGroup({
        selector: selector.trim(),
        controlName: 'Alignment',
        defaultValue: 'top',
        pluginName: 'Caption-Button-Plugin'
      });
      if (radioGroup.length !== 2) {
        this.warn(`Selector "${selector}" did not find exactly two(2) radio buttons for caption alignment. Skipping selector`);
        return;
      }

      if (!radioGroup.hasOnly(ALIGN_VALUES)) {
        return;
      }

      if (radioGroup.hasDuplicateValues()) {
        this.warn(`Duplicate radio button values detected (values: ${radioGroup.values} ). Skipping radio group`);
        return;
      }

      radioGroups.push(radioGroup);
    });

    return radioGroups;
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

        for (const radio in this.radios) {
          radio.displayRadios($event.data);
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
   * @param {Event} e
   * @memberof CaptionsPlugin
   */
  onFontSizeChange(e) {
    this.setCaptionsStyles('size', e.target.value);

    this.fontSizeRadios.forEach((group) => {
      group.radioGroup[e.target.value].checked = true;
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
      group.radioGroup[e.target.value].checked = true;
    });
  }

  /**
   * Fired whenever the color radios are updated
   * @param {Event} e
   * @memberof CaptionsPlugin
   */
  onColorChange(e) {
    const styles = e.target.value === 'default' ? DEFAULT_COLOR_STYLE : INVERTED_COLOR_STYLE;

    this.setCaptionsStyles(styles);

    this.colorRadios.forEach((group) => {
      group.radioGroup[e.target.value].checked = true;
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

    for (const radio in this.radios) {
      radio.resetState();
    }
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

  /**
   * @readonly
   * @returns {number}
   * @memberof RadioGroup
   */
  get radios() {
    return this.colorRadios
      .concat(this.alignmentRadios)
      .concat(this.fontSizeRadios);
  }
}
