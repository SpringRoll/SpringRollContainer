import { BasePlugin, Container, PageVisibility } from "..";

export class FocusPlugin extends BasePlugin {
  constructor(selector: string);

  private _appBlurred: boolean;
  private _keepFocus: boolean;
  private _containerBlurred: boolean;
  private _focusTimer: any;
  private _isManualPause: boolean;

  dom: null | HTMLIFrameElement;
  manageFocus:function;
  onKeepFocus:function;
  pageVisibility: PageVisibility;
  paused: boolean;
  pauseFocus: HTMLElement;
  selelector:string;

  blur():void;
  close(): void;
  focus():void;
  manageFocus():void;
  onContainerBlur():void;
  onContainerFocus():void;
  onDocClick():void;
  onFocus($event: {data:any}):void;
  onKeepFocus($event: {data:any}):void;
  onPauseFocus():void;
  open(): void;
  opened(): void;
  setup(container: Container | {dom: HTMLIFrameElement}): void;
  teardown(): void;
}