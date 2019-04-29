import { ButtonPlugin } from './ButtonPlugin';

export class HelpPlugin extends ButtonPlugin {
  constructor(helpButton: string);
  helpButton: HTMLButtonElement;
  pause: boolean;

  get helpEnabled(): void;
  private _helpEnabled: false;
  set helpEnabled(enabled: boolean);

  helpButtonClick(): void;
  open(): void;
  onPause($event:object):void;
}