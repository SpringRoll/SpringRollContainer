import { BasePlugin } from "./BasePlugin";

export class ButtonPlugin extends BasePlugin {
  constructor(name:string, required:Array<string>, optional: Array<string>);
  private _disableButton(button: HTMLButtonElement): void;
  private _setMuteProp(prop: string, button:HTMLButtonElement | NodeListOf<HTMLButtonElement>, muted:boolean);
  removeListeners(button: HTMLButtonElement)
  reset(): void;
  setup():void;
  teardown():void;
}