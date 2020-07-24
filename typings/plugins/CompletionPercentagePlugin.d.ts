import { SliderPlugin } from '../base-plugins';

type CompletionPercentageOptions = {
  defaultValue?: number | string;
};

export class CompletionPercentagePlugin extends SliderPlugin {
  constructor(completionPercentageSliders?: string| HTMLElement, options: CompletionPercentageOptions)

  onCompletionPercentageChange(e: Event): void;

  get completionPercentageKey(): string;

}
