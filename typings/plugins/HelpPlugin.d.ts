import { ButtonPlugin } from './ButtonPlugin';

export class HelpPlugin extends ButtonPlugin {
  constructor(helpButton: string);
  helpButton: HTMLButtonElement;
  pause: boolean;

  get helpEnabled(): void;
  private _helpEnabled: false;
  set helpEnabled(enabled: boolean);

  close(): void;
  helpButtonClick(): void;
  open(): void;
  teardown(): void;
  onPause($event:object):void;
}