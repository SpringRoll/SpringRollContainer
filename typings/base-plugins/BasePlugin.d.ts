import { Bellhop } from "bellhop-iframe";
import {Container} from '../Container';

export interface IPlugin {
  name:string;
  client: Bellhop;
  async preload(container: Container):Promse<void>;
  start(container: Container):void;
  init(container: Container):void;
  sendProperty(prop: string, value:any):void;
}

export class BasePlugin implements IPlugin() {
  constructor(name:string);
  async preload(container: Container):Promse<void>;
  client: Bellhop
  init(container: Container):void;
  name: string;
  sendProperty(prop: string, value:any):void;
  start(container: Container):void;
}