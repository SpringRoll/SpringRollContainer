import { RadioGroupPlugin } from '../base-plugins';

export const COLOR_BLIND_TYPES: string[];

type ColorVisionPluginOptions = {
  defaultValue?: string
};

export class ColorVisionPlugin extends RadioGroupPlugin {
  constructor(colorVisionRadios?: string, options: ColorVisionPluginOptions)

  sendAfterFetch: boolean;
  canEmit: boolean;

  onColorChange(e: Event): void;
  init(): void;
  start(): void;
  sendAllProperties(): void;

  static get ColorVisionKey(): string;

}