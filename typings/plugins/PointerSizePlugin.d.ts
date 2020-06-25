import { BasePlugin } from '..';
import { Slider } from '../ui-elements/Slider';

type PointerSizePluginOptions = {
  pointerSliders?:string,
  defaultPointerSize?: number,
};

export class PointerSizePlugin extends BasePlugin {
  constructor(options: PointerSizePluginOptions)

  pointerSize: number;

  pointerSliders: Slider[];
  pointerSlidersLength: number;

  onPointerSizeChange(e: Event): void;

  get pointerSizeKey(): string;

}

