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
  constructor({ layersSliders } = {}) {
    super('layer-plugin');
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this.layersSliders = [];

    if (layersSliders instanceof HTMLElement) {
      this.layersSliders[0] = new Slider({
        slider: layersSliders,
        control: LayersPlugin.layerValueKey,
        defaultValue: 0
      });
    } else {
      document.querySelectorAll(layersSliders).forEach((slider) => {
        const newSlider = new Slider({
          slider: slider,
          control: LayersPlugin.layerValueKey,
          defaultValue: 0
        });
        if (newSlider.slider) {
          this.layersSliders.push(newSlider);
        }
      });
    }

    this.layersSlidersLength = this.layersSliders.length;

    if (this.layersSlidersLength <= 0) {
      console.warn('SpringRollContainer: LayersPlugin was not provided any valid input elements, or key binding containers');
      return;
    }

    if (this.layersSliders[0].slider) {
      this.layerValue = this.layersSliders[0].value;
    }

    for (let i = 0; i < this.layersSlidersLength; i++) {
      this.layersSliders[i].enableSliderEvents(this.onLayerValueChange.bind(this));
    }
  }

  /**
   * @memberof LayersPlugin
   */
  onLayerValueChange(e) {
    this.layerValue = this.layersSliders[0].sliderRange(
      Number(e.target.value)
    );

    this.sendProperty(LayersPlugin.layerValueKey, this.layerValue);

    for (let i = 0; i < this.layersSlidersLength; i++) {
      this.layersSliders[i].value = this.layerValue;
    }
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

        for (let i = 0; i < this.layersSlidersLength; i++) {
          this.layersSliders[i].displaySlider(features.data);
        }

      }.bind(this)
    );
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
   * @memberof LayersPlugin
   */
  static get layerValueKey() {
    return 'removableLayers';
  }
}
