import { ButtonPlugin } from './ButtonPlugin';
import { Button } from '../ui-elements/Button';

export class HelpPlugin extends ButtonPlugin {
  constructor(helpButton: string);
  _helpButtons: Button[];
  pause: boolean;
  helpButtonsLength: number;

  get helpEnabled(): boolean;
  private _helpEnabled: boolean;
  set helpEnabled(enabled: boolean);

  helpButtonClick(): void;
  onPause($event:object):void;
}