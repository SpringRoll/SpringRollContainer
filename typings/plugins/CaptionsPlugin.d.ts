import { ButtonPlugin } from './ButtonPlugin';
import { Button } from'../classes/Button';

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
  _captionsButton: Button;
  _captionsMuted: boolean;

  get captionsMuted(): boolean;
  set captionsMuted(muted: boolean);
  get captionsButton(): HTMLButtonElement;

  captionButtonClick():void;
  clearCaptionStyles():void;
  getCaptionsStyles(prop?:string): object | string;
  setCaptionsStyles(styles: CaptionStyles | string, value: string);
}