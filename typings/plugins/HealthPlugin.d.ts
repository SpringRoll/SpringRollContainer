import { SliderPlugin } from '../base-plugins';

type HealthOptions = {
  defaultValue?: number | string;
};

export class Health extends SliderPlugin {
  constructor(healthSliders?: string| HTMLElement, options: HealthOptions)

  onHealthChange(e: Event): void;

  get healthKey(): string;

}
