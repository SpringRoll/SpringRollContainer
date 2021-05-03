
import { ButtonPlugin } from '../base-plugins';
import { Button } from'../ui-elements';

export class FullScreenPlugin extends ButtonPlugin {
  constructor(buttonSelector: string | string[]);
  toggleButton: HTMLButtonElement | HTMLButtonElement[];
  targetElement: HTMLElement;

  get toggleButton(): HTMLButtonElement;
  get targetElement(): HTMLButtonElement;

  init(): void;
  start(): void;

  toggleFullScreen():void;
  isFullscreen():void;
}