import { SliderPlugin } from '../base-plugins';

type HitAreaScaleOptions = {
  defaultValue?: number | string;
};

export class HitAreaScalePlugin extends SliderPlugin {
  constructor(hitAreaScaleSliders?: string| HTMLElement, options: HitAreaScaleOptions)

  onHitAreaScaleChange(e: Event): void;

  get hitAreaScaleKey(): string;

}
