import { BasePlugin } from '..';
import { Slider } from '../ui-elements/Slider';

type UISizePluginOptions = {
  pointerSliders?:string,
  defaultPointerSize?: number,
  buttonSliders?:string,
  defaultButtonSize?: number,
};

export class UISizePlugin extends BasePlugin {
  constructor(options: UISizePluginOptions)

  pointerSize: number;
  buttonSize: number;

  pointerSliders: Slider[];
  buttonSliders: Slider[];
  pointerSlidersLength: number;
  buttonSlidersLength: number;

  onPointerSizeChange(e: Event): void;
  onButtonSizeChange(e: Event): void;

  get pointerSizeKey(): string;
  get buttonSizeKey(): string;

}

