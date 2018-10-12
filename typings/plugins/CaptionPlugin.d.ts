import { ButtonPlugin } from './ButtonPlugin';

type CaptionStyles = {
  size: string,
  background: string,
  color: string,
  edge: string,
  font: string,
  align: string
};

export class CaptionPlugin extends ButtonPlugin {
  constructor(captionsButton:string);
  captionsStyle: CaptionStyles;
  captionsButton: HTMLButtonElement;

  captionButtonClick():void;
  clearCaptionStyles():void;
  close():void;
  getCaptionStyles(prop?:string): object | string;
  opened():void;
  setCaptionStyles(styles: CaptionStyles | string, value: string);
  teardown():void;
}