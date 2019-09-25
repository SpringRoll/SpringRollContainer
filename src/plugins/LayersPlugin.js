import { Slider } from '../ui-elements/Slider';
import { BasePlugin } from './BasePlugin';

/**
 * @export
 * @class LayersPlugin
 */
export class LayersPlugin extends BasePlugin {
  /**
   *
   * @param {Object} param
   * @param {string | HTMLInputElement} param.layersSlider the slider that represents the layers of the game
   */
  constructor({ layersSlider }) {
    super('layer-plugin');
    this.layersSlider = new Slider({
      slider: layersSlider,
      control: 'removableLayers',
      min: 0,
      max: 1,
      step: 0.01, // 100 possible values, a game would be very unlikely to go over 100 layers.
      defaultValue: 0
    });

    this.layerValue = 0;
    this.layersSlider.enableSliderEvents(this.onLayerValueChange.bind(this));
  }
  /**
   * @memberof LayersPlugin
   */
  onLayerValueChange() {
    this.layerValue = this.layersSlider.sliderRange(
      Number(this.layersSlider.slider.value)
    );
    this.sendProperty(LayersPlugin.layerValueKey, this.layerValue);
  }

  /**
   * @memberof LayersPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
        }

        this.layersSlider.displaySlider(features.data);
      }.bind(this)
    );
  }

  /**
   * @readonly
   * @static
   * @memberof UISizePlugin
   */
  static get layerValueKey() {
    return 'removableLayers';
  }
}
