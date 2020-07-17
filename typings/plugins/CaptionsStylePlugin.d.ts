
import { ButtonPlugin } from '../base-plugins';
import { RadioGroup } from'../ui-elements';

declare const CAPTIONS_STYLES: string;
declare const DEFAULT_CAPTIONS_STYLES: object;

type CaptionStyles = {
  size: string,
  background: string,
  color: string,
  edge: string,
  font: string,
  align: string
};

type ColorStyleOptions = {
  color: string,
  background: string,
};

type CaptionsStylePluginOptions = {
  defaultFontSize?: string,
  defaultColor?: string,
  defaultAlignment?: string
}

declare const DEFAULT_COLOR_STYLE: ColorStyleOptions;
declare const INVERTED_COLOR_STYLE: ColorStyleOptions;
declare const FONT_SIZE_VALUES: string[];
declare const COLOR_VALUES: string[];
declare const ALIGN_VALUES: string[];

export class CaptionsStylePlugin extends ButtonPlugin {
  constructor(fontSizeRadios: string, colorRadios: string, alignmentRadios: string, options: CaptionsStylePluginOptions);
  captionsStyle: CaptionStyles;
  fontSizeSelectors: string[];
  colorSelectors: string[];
  alignmentSelectors: string[];
  fontSizeRadios: RadioGroup[];
  colorRadios: RadioGroup[];
  alignmentRadios: RadioGroup[];
  fontSizeRadiosLength: number;
  colorRadiosLength: number;
  alignmentRadiosLength: number;

  setUpFontSizeRadios(selectors: string[]): RadioGroup[];
  setUpColorRadios(selectors: string[]): RadioGroup[];
  setUpAlignmentRadios(selectors: string[]): RadioGroup[];

  init(): void;
  start(): void;

  sendAllProperties(): void;
  onFontSizeChange(e: Event): void;
  onColorChange(e: Event): void;
  onAlignmentChange(e: Event): void;
  clearCaptionStyles():void;
  getCaptionsStyles(prop?:string): object | string;
  setCaptionsStyles(styles: CaptionStyles | string, value: string);
}