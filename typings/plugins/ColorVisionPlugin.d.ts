import { BasePlugin } from '..';

type ColorVisionPluginOptions = {
  colorSelect?:string,
};

export class ColorVisionPlugin extends BasePlugin {
  constructor(options: ColorVisionPluginOptions)

  colorDropdown: HTMLSelectElement | null;

  onColorChange(): void;

  static get ColorVisionKey(): string;

}