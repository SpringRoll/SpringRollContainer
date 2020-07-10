import { ButtonPlugin } from '../base-plugins';
import { Button } from '../ui-elements';

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