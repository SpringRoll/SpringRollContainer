export class PageVisibility {
  constructor(onFocus: function, onBlur: function);

  destroy(): void;
  get enabled(): boolean;
  onToggle($event: Event): void;
  private _enabled:boolean;
  private _onBlur($event?:Event);
  private _onFocus($event?:Event);
  set enabled(enable: boolean): void;
}