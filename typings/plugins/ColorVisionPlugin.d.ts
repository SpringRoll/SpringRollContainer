import { BasePlugin } from '..';

export const COLOR_BLIND_TYPES: string[];

type ColorVisionPluginOptions = {
  colorSelects?: string | HTMLElement,
};

export class ColorVisionPlugin extends BasePlugin {
  constructor(options: ColorVisionPluginOptions)

  colorDropdowns: HTMLSelectElement[] | NodeListOf<HTMLSelectElement>;
  sendAfterFetch: boolean;
  canEmit: boolean;
  colorVisionValue: string;
  colorDropdownsLength: number;

  onColorChange(e: MouseEvent): void;
  sendAllProperties(): void;

  static get ColorVisionKey(): string;

}