import { SliderPlugin } from '../base-plugins';

type SpeedScaleOptions = {
  defaultValue?: number | string;
};

export class SpeedScalePlugin extends SliderPlugin {
  constructor(speedScaleSliders?: string| HTMLElement, options: SpeedScaleOptions)

  onSpeedScaleChange(e: Event): void;

  get speedScaleKey(): string;

}
