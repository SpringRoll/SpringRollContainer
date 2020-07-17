import { SliderPlugin } from '../base-plugins';

type DragThresholdScaleOptions = {
  defaultValue?: number | string;
};

export class DragThresholdScalePlugin extends SliderPlugin {
  constructor(dragThresholdScaleSliders?: string| HTMLElement, options: DragThresholdScaleOptions)

  onDragThresholdScaleChange(e: Event): void;

  get DragThresholdScaleKey(): string;

}
