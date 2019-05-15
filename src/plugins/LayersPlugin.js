import { BasePlugin } from './BasePlugin';

/**
 * @export
 * @class LayersPlugin
 * @extends {BasePlugin}
 *
 */
export class LayersPlugin extends BasePlugin {
  /**
   *Creates an instance of LayersPlugin.
   * @param {object} params
   * @param {string | HTMLElement} [params.layersCheckBoxes] selector string or the html form that contains the checkboxes
   * @memberof LayersPlugin
   */
  constructor({ layersCheckBoxes } = {}) {
    super('Layers-Button-Plugin');
    this.layersCheckBoxes =
      layersCheckBoxes instanceof HTMLElement
        ? layersCheckBoxes
        : document.querySelector(layersCheckBoxes);

    this.layersToggleState = {}; //object that tracks all layers and their values

    const boxes = Object.values(this.layersCheckBoxes.elements); // used in the for loop
    for (let i = 0, l = boxes.length; i < l; i++) {
      this.layersToggleState[boxes[i].value] = true; //sets the layer display value to true
      this.layersCheckBoxes.elements[boxes[i].id].checked = true; //makes sure the checkboxes are all checked to reflect the layer toggle state
      boxes[i].addEventListener('click', () => {
        this.onLayerToggle(boxes[i]);
      });
    }
  }

  /**
   * @memberof LayersPlugin
   * @param {HTMLElement} layer the checkbox that was clicked
   */
  onLayerToggle(layer) {
    //invert the boolean value
    this.layersToggleState[layer.value] = !this.layersToggleState[layer.value];
    //also update the actual checked status to reflect the user's choice.
    this.layersCheckBoxes.elements[layer.id].checked = this.layersToggleState[
      layer.value
    ];
    this.sendProperty(
      LayersPlugin.layersToggleStateKey,
      this.layersToggleState
    );
  }

  /**
   * @memberof LayersPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (!features.data || !(this.layersCheckBoxes instanceof HTMLElement)) {
          return;
        }
        this.layersCheckBoxes.style.display = features.data.removableLayers
          ? ''
          : 'none';
      }.bind(this)
    );
  }

  /**
   * @memberof LayersPlugin
   */
  start() {
    if (this.layersCheckBoxes !== null) {
      this.layersCheckBoxes.classList.remove('disabled');
    }
  }

  /**
   * @readonly
   * @static
   * @memberof LayersPlugin
   */
  static get layersToggleStateKey() {
    return 'layersToggleState';
  }
}
