import { ButtonPlugin } from '..';
import { Button } from '../classes/Button';
export class PausePlugin extends ButtonPlugin {
  constructor(pauseButton: string, selector?: string);

  _appBlurred: boolean;
  _containerBlurred: boolean;
  _focusTimer: any;
  _isManualPause: boolean;
  _keepFocus: boolean;
  _paused: boolean;
  iframe: null | HTMLIFrameElement;
  manageFocus:function;
  onKeepFocus:function;
  pageVisibility: PageVisibility;
  paused: boolean;
  pauseDisabled: boolean;
  pauseFocus: HTMLElement;
  _pauseButton: Array<Button>;
  pauseButtons: NodeListOf<HTMLButtonElement>;

  set pause(paused: boolean): void;
  get pause(): boolean;
  get hasDom(): boolean;
  get pauseButton(): Array<HTMLButtonElement>;


  blur():void;
  focus():void;
  manageFocus():void;
  onContainerBlur():void;
  onContainerFocus():void;
  onDocClick():void;
  onFocus($event: {data:any}):void;
  onKeepFocus($event: {data:any}):void;
  onPauseFocus():void;
  onPauseToggle(): void;
}
