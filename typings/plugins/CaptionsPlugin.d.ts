import { ButtonPlugin } from './ButtonPlugin';

type CaptionStyles = {
  size: string,
  background: string,
  color: string,
  edge: string,
  font: string,
  align: string
};

export class CaptionsPlugin extends ButtonPlugin {
  constructor(captionsButton:string);
  captionsStyle: CaptionStyles;
  captionsButton: HTMLButtonElement;
  _captionsMuted: boolean;

  get captionsMuted(): boolean;
  set captionsMuted(muted: boolean);

  captionButtonClick():void;
  clearCaptionStyles():void;
  getCaptionsStyles(prop?:string): object | string;
  setCaptionsStyles(styles: CaptionStyles | string, value: string);
}