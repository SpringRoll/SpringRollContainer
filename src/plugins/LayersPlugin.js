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

    this.layersCheckBoxes.elements.forEach(box => {
      this.layersToggleState[box.value] = false;
      box.addEventListener('click', () => {
        this.onLayerToggle(box);
      });
    });
  }

  /**
   * @memberof LayersPlugin
   */
  onLayerToggle(layer) {
    //invert the boolean value
    this.layersToggleState[layer.value] = !this.layersToggleState[layer.value];
    //also update the actual checked status to reflect the user's choice.
    this.layersCheckBoxes.elements[
      layer.value
    ].checked = this.layersToggleState[layer.value];
    this.sendProperty(layer.value, this.layersToggleState[layer.value]);
  }

  /**
   * @memberof LayersPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (
          !features.data ||
          'object' !== typeof features.data ||
          null === features.data
        ) {
          return;
        }
        if (this.layersCheckBoxes instanceof HTMLElement) {
          this.layersCheckBoxes.style.display = features.data.layersCheckBoxes
            ? ''
            : 'none';
        }
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
