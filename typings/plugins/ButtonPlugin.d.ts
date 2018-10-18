import { BasePlugin } from "./BasePlugin";
import {Container} from "../Container";

export class ButtonPlugin extends BasePlugin {
  constructor(name:string, required:Array<string>, optional: Array<string>);
  private _disableButton(button: HTMLButtonElement): void;
  private _setMuteProp(prop: string, button:HTMLButtonElement | NodeListOf<HTMLButtonElement>, muted:boolean);
  changeMutedState(button: HTMLButtonElement, muted?: boolean);
  reset(): void;
  setup:function;
  teardown:function;
}