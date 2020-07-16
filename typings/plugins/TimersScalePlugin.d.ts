import { SliderPlugin } from '../base-plugins';

type TimersScaleOptions = {
  defaultValue?: number | string;
};

export class TimersScalePlugin extends SliderPlugin {
  constructor(timersScaleSliders?: string| HTMLElement, options: TimersScaleOptions)

  onTimersScaleChange(e: Event): void;

  get timersScaleKey(): string;

}
