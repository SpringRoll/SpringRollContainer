import { SliderPlugin } from '../base-plugins';

type InputCountOptions = {
  defaultValue?: number | string;
};

export class InputCountPlugin extends SliderPlugin {
  constructor(inputCountSliders?: string| HTMLElement, options: InputCountOptions)

  onInputCountChange(e: Event): void;

  get inputCountKey(): string;

}
