import { ButtonPlugin } from '..';
import { Slider } from '../classes/Slider';

type UISizePluginOptions = {
  pointerSlider?:string,
  buttonSlider?:string
};

type Slider = {
  slider: HTMLInputElement | string, control: string, min: number, max: number, step: number, value: number
}

declare const POINTER_SLIDER_MIN: number;
declare const POINTER_SLIDER_MAX: number;
declare const POINTER_SLIDER_STEP : number;

declare const BUTTON_SLIDER_MIN: number;
declare const BUTTON_SLIDER_MAX: number;
declare const BUTTON_SLIDER_STEP: number;

export class UISizePlugin extends ButtonPlugin {
  constructor(options: UISizePluginOptions)

  pointerSize: number;
  buttonSize: number;

  pointerSlider: Slider | null;
  buttonSlider: Slider | null;

  onPointerSizeChange(): void;
  onButtonSizeChange(): void;

  get pointerSizeKey(): string;
  get buttonSizeKey(): string;

}

