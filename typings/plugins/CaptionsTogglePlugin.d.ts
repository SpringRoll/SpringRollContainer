
import { ButtonPlugin } from '../base-plugins';
import { Button } from'../ui-elements';

declare const CAPTIONS_MUTED: string;

export class CaptionsTogglePlugin extends ButtonPlugin {
  constructor(captionsButtons: string | HTMLElement);
  _captionsButtons: Button[];
  _captionsMuted: boolean;
  captionsButtonsLength: number;

  get captionsMuted(): boolean;
  set captionsMuted(muted: boolean);
  get captionsButton(): HTMLButtonElement;

  init(): void;
  start(): void;

  sendAllProperties(): void;
  captionButtonClick():void;
}