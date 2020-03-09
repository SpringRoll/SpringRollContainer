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
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.layersSlider = new Slider({
      slider: layersSlider,
      control: 'removableLayers',
      defaultValue: 0
    });

    this.layerValue = this.layersSlider.value;
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
  * @memberof LayersPlugin
  */
  start() {

    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
*
* Sends initial layers properties to the application
* @memberof LayersPlugin
*/
  sendAllProperties() {
    this.sendProperty(LayersPlugin.layerValueKey, this.layerValue);
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
