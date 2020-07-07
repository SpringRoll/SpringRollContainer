import { SliderPlugin } from '../base-plugins';

type ButtonSizePluginOptions = {
  defaultButtonSize?: number,
};

export class ButtonSizePlugin extends SliderPlugin {
  constructor(buttonsSliders: string | HTMLElement, options: ButtonSizePluginOptions)

  onButtonSizeChange(e: Event): void;
  init(): void

  get buttonSizeKey(): string;
}

