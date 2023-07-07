import { SavedData } from '../SavedData';
import { ButtonPlugin } from '../base-plugins';
import { RadioGroup } from '../ui-elements';

const DEFAULT_CAPTIONS_STYLES = {
  size: 'medium',
  background: 'black',
  color: 'white',
  edge: 'none',
  font: 'arial',
  align: 'top'
};

const DEFAULT_COLOR_STYLE = {color: 'white', background: 'black'};
const INVERTED_COLOR_STYLE = {color: 'black', background: 'white'};
const FONT_SIZE_VALUES = ['small', 'medium', 'large'];
const COLOR_VALUES = ['default', 'inverted'];
const ALIGN_VALUES = ['top', 'bottom'];

/**
 * @export
 * @class CaptionsStylePlugin
 * @property {object} captionsStyles The collection of captions styles
 * @property {string[]} fontSizeSelectors selector strings for the radio button groups
 * @property {string[]} colorSelectors selector strings for the radio button groups
 * @property {string[]} alignmentSelectors selector strings for the radio button groups
 * @property {Object[]} fontSizeRadios array that contains each radio group
 * @property {Object[]} colorRadios array that contains each radio group
 * @property {Object[]} alignmentRadios array that contains each radio group
 * @property {number} fontSizeRadiosLength Length of the fontSizeRadios array
 * @property {number} colorRadiosLength Length of the colorRadios array
 * @property {number} alignmentRadiosLength Length of the alignmentRadios array
 * @extends {ButtonPlugin}
 */
export class CaptionsStylePlugin extends ButtonPlugin {
  /**
   * Creates an instance of CaptionsStylePlugin.
   * @param {string} fontSizeRadios selector string for one or more radio groups for caption font size
   * @param {string} colorRadios selector string for one or more radio groups for caption font/background colors
   * @param {string} alignmentRadios selector string for one or more radio groups for caption position
   * @param {string} [defaultFontSize='medium'] Default selected font size
   * @param {string} [defaultColor='default'] Default selected color
   * @param {string} [defaultAlignment='top'] Default selected alignment
   * @memberof CaptionsStylePlugin
   */
  constructor(fontSizeRadios, colorRadios, alignmentRadios,
    { defaultFontSize = 'medium', defaultColor = 'default', defaultAlignment = 'top' } = {}
  ) {
    super('Caption-Button-Plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.captionsStyles = Object.assign(
      {},
      DEFAULT_CAPTIONS_STYLES,
      SavedData.read(CaptionsStylePlugin.captionStyleKey) || {}
    );

    //split the selector strings into individual selectors.
    //Helps keep the input style consistent across plugins.
    this.fontSizeSelectors = fontSizeRadios ? fontSizeRadios.split(',') : [];
    this.colorSelectors = colorRadios ? colorRadios.split(',') : [];
    this.alignmentSelectors = alignmentRadios ? alignmentRadios.split(',') : [];

    this.defaultFontSize = FONT_SIZE_VALUES.includes(defaultFontSize) ? defaultFontSize : FONT_SIZE_VALUES[0];
    this.defaultColor = COLOR_VALUES.includes(defaultColor) ? defaultColor : COLOR_VALUES[0];
    this.defaultAlignment = ALIGN_VALUES.includes(defaultAlignment) ? defaultAlignment : ALIGN_VALUES[0];

    this.fontSizeRadios = [];
    this.colorRadios = [];
    this.alignmentRadios = [];

    this.fontSizeRadios = this.setUpFontSizeRadios(this.fontSizeSelectors);
    this.colorRadios = this.setUpColorRadios(this.colorSelectors);
    this.alignmentRadios = this.setUpAlignmentRadios(this.alignmentSelectors);

    this._captionsMuted = false;

    this.alignmentRadiosLength = this.alignmentRadios.length;
    this.fontSizeRadiosLength = this.fontSizeRadios.length;
    this.colorRadiosLength = this.colorRadios.length;

    if (0 >= (this.alignmentRadiosLength + this.fontSizeRadiosLength + this.colorRadiosLength)) {
      this.warn(
        'Plugin was not provided any input elements'
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
   * @memberof CaptionsStylePlugin
   * @param {string[]} selectors the separated selector strings used to target the radio button groups
   * @returns {RadioGroup[]}
   */
  setUpFontSizeRadios(selectors) {
    const radioGroups = [];

    selectors.forEach((selector) => {
      const radioGroup = new RadioGroup({
        selector: selector.trim(),
        controlName: 'Font Size',
        defaultValue: this.defaultFontSize,
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
   * @memberof CaptionsStylePlugin
   * @param {string[]} selectors the separated selector strings used to target the radio button groups
   * @returns {RadioGroup[]}
   */
  setUpColorRadios(selectors) {
    const radioGroups = [];

    selectors.forEach((selector) => {
      const radioGroup = new RadioGroup({
        selector: selector.trim(),
        controlName: 'Color',
        defaultValue: this.defaultColor,
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
   * @memberof CaptionsStylePlugin
   * @param {string[]} selectors the separated selector strings used to target the radio button groups
   * @returns {RadioGroup[]}
   */
  setUpAlignmentRadios(selectors) {
    const radioGroups = [];

    selectors.forEach((selector) => {
      const radioGroup = new RadioGroup({
        selector: selector.trim(),
        controlName: 'Alignment',
        defaultValue: this.defaultAlignment,
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
   * @memberof CaptionsStylePlugin
   */
  init() {
    // Handle the features request
    this.client.on(
      'features',
      function($event) {

        for (const radio of this.radios) {
          radio.displayRadios($event.data);
        }

      }.bind(this)
    );

    this.client.on(
      'caption-set-style',
      function($event) {
        this.setCaptionsStyles($event.data || {});
      }.bind(this)
    );
  }
  /**
  * @memberof CaptionsStylePlugin
  */
  start() {
    this.setCaptionsStyles(SavedData.read(CaptionsStylePlugin.captionStyleKey));

    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
  *
  * Sends initial caption properties to the application
  * @memberof CaptionsStylePlugin
  */
  sendAllProperties() {
    this.sendProperty(CaptionsStylePlugin.captionStyleKey, this.captionsStyles);
  }
  /**
   * Fired whenever the font size radios are updated
   * @param {Event} e
   * @memberof CaptionsStylePlugin
   */
  onFontSizeChange(e) {
    this.setCaptionsStyles('size', e.target.value);
  }

  /**
   * Fired whenever the alignment radios are updated
   * @param {Event} e
   * @memberof CaptionsStylePlugin
   */
  onAlignmentChange(e) {
    this.setCaptionsStyles('align', e.target.value);
  }

  /**
   * Fired whenever the color radios are updated
   * @param {Event} e
   * @memberof CaptionsStylePlugin
   */
  onColorChange(e) {
    const styles = e.target.value === 'default' ? DEFAULT_COLOR_STYLE : INVERTED_COLOR_STYLE;

    this.setCaptionsStyles(styles);
  }

  /**
   * Reset the captions styles
   * @param {Event} e
   * @memberof CaptionsStylePlugin
   */
  clearCaptionsStyles() {
    this.captionsStyles = Object.assign({}, DEFAULT_CAPTIONS_STYLES);
    this.setCaptionsStyles();

    for (const radio of this.radios) {
      radio.resetState();
    }
  }

  /**
   * Get the captions styles
   * @param {string} [prop] The optional property, values are "size", "edge", "font", "background", "color"
   * @return {object | string} The collection of styles, see setCaptionsStyles for more info.
   * @memberof CaptionsStylePlugin
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
   * @memberof CaptionsStylePlugin
   */
  setCaptionsStyles(styles = DEFAULT_CAPTIONS_STYLES, value = '') {
    if (typeof styles === 'object') {
      Object.assign(this.captionsStyles, styles);
    } else if (typeof styles === 'string') {
      this.captionsStyles[styles] = value;
    }

    // update radios to match
    this.colorRadios.forEach((group) => {
      const style = this.captionsStyles.color === 'white' ? 'default' : 'inverted'
      group.radioGroup[style].checked = true;
    });
    this.alignmentRadios.forEach((group) => {
      group.radioGroup[this.captionsStyles.align].checked = true;
    });
    this.fontSizeRadios.forEach((group) => {
      group.radioGroup[this.captionsStyles.size].checked = true;
    });

    SavedData.write(CaptionsStylePlugin.captionStyleKey, this.captionsStyles);
    if (this.client) {
      this.client.send(CaptionsStylePlugin.captionStyleKey, this.captionsStyles);
    }
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
  /**
   * Get captionStyle Key
   * @readonly
   * @static
   * @memberof CaptionStyleKey
   * @returns {string}
   */
  static get captionStyleKey() {
    return 'captionsStyles';
  }

}
