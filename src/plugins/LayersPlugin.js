import { ButtonPlugin } from './ButtonPlugin';

/**
 * @export
 * @class LayersPlugin
 * @extends {ButtonPlugin}
 *
 */
export class LayersPlugin extends ButtonPlugin {
  /**
   *Creates an instance of LayersPlugin.
   * @param {object} params
   * @param {string | HTMLElement} [params.layersCheckBoxes] // Form
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
      this.layersToggleState[boxes[i].value] = true;
      this.layersCheckBoxes.elements[boxes[i].id].checked = true;
      boxes[i].addEventListener('click', () => {
        this.onLayerToggle(boxes[i]);
      });
    }
  }

  /**
   * @memberof LayersPlugin
   */
  onLayerToggle(layer) {
    //invert the boolean value
    this.layersToggleState[layer.value] = !this.layersToggleState[layer.value];
    //also update the actual checked status to reflect the user's choice.
    this.layersCheckBoxes.elements[layer.id].checked = this.layersToggleState[
      layer.value
    ];
    this.sendProperty(layer.value, this.layersToggleState[layer.value]);
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
        this.layersCheckBoxes.style.display = features.data.layersCheckBoxes
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
  static get layersCheckBoxesKey() {
    return 'layersCheckBoxes';
  }
}
