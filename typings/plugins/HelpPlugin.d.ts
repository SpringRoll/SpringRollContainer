import { ButtonPlugin } from './ButtonPlugin';
import { Button } from '../classes/Button';

export class HelpPlugin extends ButtonPlugin {
  constructor(helpButton: string);
  _helpButton: Button;
  pause: boolean;

  get helpEnabled(): void;
  private _helpEnabled: false;
  set helpEnabled(enabled: boolean);
  get helpButton(): HTMLButtonElement;

  helpButtonClick(): void;
  open(): void;
  onPause($event:object):void;
}