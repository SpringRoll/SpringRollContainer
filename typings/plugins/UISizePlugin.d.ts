import { ButtonPlugin } from '..';
import { Slider } from '../classes/Slider';

type UISizePluginOptions = {
  pointerSlider?:string,
  defaultPointerSize?: number,
  buttonSlider?:string,
  defaultButtonSize?: number,
};

type Slider = {
  slider: HTMLInputElement | string, control: string, min: number, max: number, step: number, value: number
}

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

