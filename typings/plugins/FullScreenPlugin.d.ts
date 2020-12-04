
import { ButtonPlugin } from '../base-plugins';
import { Button } from'../ui-elements';

export class CaptionsTogglePlugin extends ButtonPlugin {
  constructor(targetElementSelector: string, buttonSelector: string | HTMLElement);
  toggleButton: ButHTMLButtonElementton;
  targetElement: HTMLElement;

  get toggleButton(): HTMLButtonElement;
  get targetElement(): HTMLButtonElement;

  init(): void;
  start(): void;

  toggleFullScreen():void;
  isFullscreen():void;
}