import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class LayersPlugin
 * @property {object[]} sliders an array of all slider objects attached to LayersPlugin
 * @extends {SliderPlugin}
 */
export class LayersPlugin extends SliderPlugin {
  /**
   * Creates an instance of KeyboardMapPlugin.
   * @param {string | HTMLInputElement} layersSliders selector string or HTML Element for the input(s)
   * @param {number} [defaultValue=0] The default value for the slider
   */
  constructor(layersSliders, { defaultValue = 0 } = {}) {
    super(layersSliders, 'Layer-Plugin', { defaultValue: defaultValue, featureName: LayersPlugin.layersSliderKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onLayerValueChange.bind(this));
    }
  }

  /**
   * @memberof LayersPlugin
   * @param {Event} e
   */
  onLayerValueChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(LayersPlugin.layersSliderKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof LayersPlugin
   * @returns {string}
   */
  static get layersSliderKey() {
    return 'removableLayers';
  }
}
