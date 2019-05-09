import { ButtonPlugin } from '..';
import { Slider } from '../../src/plugins/Slider';

type UISizePluginOptions = {
  pointerSlider?:string,
  buttonSlider?:string
};

type Slider = {
  slider: HTMLInputElement | string, control: string, min: number, max: number, step: number, value: number
}

const POINTER_SLIDER_MIN: number;
const POINTER_SLIDER_MAX: number;
const POINTER_SLIDER_STEP : number;

const BUTTON_SLIDER_MIN: number;
const BUTTON_SLIDER_MAX: number;
const BUTTON_SLIDER_STEP: number;

export class UISizePlugin extends ButtonPlugin {
  constructor(options: UISizePluginOptions)

  pointerSize: number;
  buttonSize: number;

  pointerSlider: Slider | null;
  buttonSlider: Slider | null;

  onPointerSizeChange(): void;
  onButtonSizeChange(): void;

  static get pointerSizeKey(): string;
  static get buttonSizeKey(): string;

}

