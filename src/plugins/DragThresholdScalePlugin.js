import { SliderPlugin } from '../base-plugins';

/**
 * @export
 * @class DragThresholdScalePlugin
 * @extends {SliderPlugin}
 */
export class DragThresholdScalePlugin extends SliderPlugin {
  /**
   *Creates an instance of DragThresholdScalePlugin.
   * @param {object} params
   * @param {string | HTMLElement} params.dragThresholdScaleSliders
   * @param {number} [params.defaultDragThresholdScale=0.5]
   * @memberof DragThresholdScalePlugin
   */
  constructor(dragThresholdScaleSliders, { defaultDragThresholdScale = 0.5 } = {}) {
    super(dragThresholdScaleSliders, 'Drag-Threshold-Scale-Plugin', { defaultValue: defaultDragThresholdScale, featureName: DragThresholdScalePlugin.dragThresholdScaleKey });

    for (let i = 0; i < this.slidersLength; i++) {
      this.sliders[i].enableSliderEvents(this.onDragThresholdScaleChange.bind(this));
    }
  }

  /**
   * @memberof DragThresholdScalePlugin
   * @param {Event} target
   * @param {string} control
   */
  onDragThresholdScaleChange(e) {
    this.currentValue = e.target.value;
    this.sendProperty(DragThresholdScalePlugin.dragThresholdScaleKey, this.currentValue);
  }

  /**
   * @readonly
   * @static
   * @memberof DragThresholdScalePlugin
   */
  static get dragThresholdScaleKey() {
    return 'dragThresholdScale';
  }
}