import { ButtonPlugin } from './ButtonPlugin';
import { Button } from '../classes/Button';

export class HelpPlugin extends ButtonPlugin {
  constructor(helpButton: string);
  _helpButtons: Button[];
  pause: boolean;
  helpButtonsLength: number;

  get helpEnabled(): void;
  private _helpEnabled: false;
  set helpEnabled(enabled: boolean);

  helpButtonClick(): void;
  onPause($event:object):void;
}