import { Slider } from '../ui-elements/Slider';
import { BasePlugin } from './BasePlugin';

/**
 * @export
 * @class LayersSliderPlugin
 */
export class LayersSliderPlugin extends BasePlugin {
  /**
   *
   * @param {Object} param
   * @param {string | HTMLInputElement} param.layerSlider the slider that represents the layers of the game
   * @param {number} [param.num=1] the number of removable layers the game has
   */
  constructor({ layerSlider, num = 1 }) {
    super('layer-slider-plugin');
    this.layerSlider = new Slider({
      slider: layerSlider,
      control: 'layer',
      min: 0,
      max: Number((0.1 * num).toFixed(1)), // sets max to the number of layers so each step is one layer removed.
      step: 0.1,
      value: 0
    });

    this.layerValue = 0;
    this.layerSlider.enableSliderEvents(this.onLayerValueChange.bind(this));
  }
  /**
   * @memberof LayersSliderPlugin
   */
  onLayerValueChange() {
    this.layerValue = this.layerSlider.sliderRange(
      Number(this.layerSlider.slider.value)
    );
    this.sendProperty(LayersSliderPlugin.layerValueKey, this.layerValue);
  }

  /**
   * @memberof LayersSliderPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
        }

        this.layerSlider.displaySlider(features.data);
      }.bind(this)
    );
  }

  /**
   * @readonly
   * @static
   * @memberof UISizePlugin
   */
  static get layerValueKey() {
    return 'layerValue';
  }
}
