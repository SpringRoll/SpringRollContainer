import { ButtonPlugin } from '..';

type UISizePluginOptions = {
  pointerSlider?:string,
  buttonSlider?:string
};

export class UISizePlugin extends ButtonPlugin {
  constructor(options: UISizePluginOptions)


  pointerSize: number;
  buttonSize: number;

  pointerSlider: HTMLInputElement | null;
  buttonSlider: HTMLInputElement | null;

  onPinterSizeChange(): void;
  onButtonSizeChange(): void;

  sliderSetup(slider: HTMLInputElement | string, uiElement: string): HTMLInputElement | null;

  sizeRange(i: number, min?: number, max?: number): number;
  enableSliderEvents():void;
  disableSliderEvents():void;

  static get pointerSizeKey(): string;
  static get buttonSizeKey(): string;

}

