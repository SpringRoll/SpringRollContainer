import { SliderPlugin } from '../base-plugins';

type PointerSizePluginOptions = {
  defaultPointerSize?: number,
};

export class PointerSizePlugin extends SliderPlugin {
  constructor(pointerSliders?: string | HTMLElement, options: PointerSizePluginOptions)

  onPointerSizeChange(e: Event): void;
  init(): void;

  get pointerSizeKey(): string;

}

