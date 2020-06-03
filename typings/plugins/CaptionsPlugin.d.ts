
import { ButtonPlugin } from './ButtonPlugin';
import { Button, RadioGroup } from'../ui-elements';

declare const CAPTIONS_STYLES: string;
declare const CAPTIONS_MUTED: string;
declare const DEFAULT_CAPTIONS_STYLES: object;

type CaptionStyles = {
  size: string,
  background: string,
  color: string,
  edge: string,
  font: string,
  align: string
};

export class CaptionsPlugin extends ButtonPlugin {
  constructor(captionsButtons: string | HTMLElement);
  captionsStyle: CaptionStyles;
  _captionsButtons: Button[];
  fontSizeSelectors: string[];
  colorSelectors: string[];
  alignmentSelectors: string[];
  fontSizeRadios: RadioGroup[];
  colorRadios: RadioGroup[];
  alignmentRadios: RadioGroup[];
  _captionsMuted: boolean;
  captionsButtonsLength: number;
  fontSizeRadiosLength: number;
  colorRadiosLength: number;
  alignmentRadiosLength: number;

  get captionsMuted(): boolean;
  set captionsMuted(muted: boolean);
  get captionsButton(): HTMLButtonElement;

  setUpFontSizeRadios(selectors: string[]): RadioGroup[];
  setUpColorRadios(selectors: string[]): RadioGroup[];
  setUpAlignmentRadios(selectors: string[]): RadioGroup[];

  sendAllProperties(): void;
  captionButtonClick():void;
  onFontSizeChange(e: Event): void;
  onColorChange(e: Event): void;
  onAlignmentChange(e: Event): void;
  clearCaptionStyles():void;
  getCaptionsStyles(prop?:string): object | string;
  setCaptionsStyles(styles: CaptionStyles | string, value: string);
}