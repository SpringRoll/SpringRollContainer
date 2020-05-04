import { ButtonPlugin } from './ButtonPlugin';
import { Button } from'../classes/Button';

const CAPTIONS_STYLES: string;
const CAPTIONS_MUTED: string;
const DEFAULT_CAPTIONS_STYLES: object;

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
  _captionsMuted: boolean;
  captionsButtonsLength: number;

  get captionsMuted(): boolean;
  set captionsMuted(muted: boolean);
  get captionsButton(): HTMLButtonElement;

  sendAllProperties(): void;
  captionButtonClick():void;
  clearCaptionStyles():void;
  getCaptionsStyles(prop?:string): object | string;
  setCaptionsStyles(styles: CaptionStyles | string, value: string);
}