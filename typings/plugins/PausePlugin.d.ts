import { ButtonPlugin } from '..';
import { Button } from '../ui-elements';
import { PageVisibility } from '..'
export class PausePlugin extends ButtonPlugin {
  constructor(pauseButton: string);

  _appBlurred: boolean;
  _containerBlurred: boolean;
  _focusTimer: any;
  _isManualPause: boolean;
  _keepFocus: boolean;
  _paused: boolean;
  iframe: null | HTMLIFrameElement;
  pageVisibility: PageVisibility;
  pauseDisabled: boolean;
  private _pauseButton: Array<Button>;
  pauseButtons: NodeListOf<HTMLButtonElement>;

  set pause(paused: boolean);
  get pause(): boolean;
  get hasDom(): boolean;
  get pauseButton(): Array<HTMLButtonElement>;


  blurApp():void;
  focusApp():void;
  manageFocus():void;
  onContainerBlur():void;
  onContainerFocus():void;
  onFocus($event: {data:any}):void;
  onKeepFocus($event: {data:any}):void;
  onPauseToggle(): void;
}
