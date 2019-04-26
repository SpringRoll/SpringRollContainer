import { Bellhop } from "bellhop-iframe";
import {Container} from '../Container';

export interface IBasePlugin {
  name:string;
  client: Bellhop;
  async preload(container: Container):Promse<void>;
  start(container: Container):void;
  init(container: Container):void;
  sendProperty(prop: string, value:any):void;
}

export class BasePlugin implements IBasePlugin() {
  constructor(name:string);
  async preload(container: Container):Promse<void>;
  start(container: Container):void;
  init(container: Container):void;
  sendProperty(prop: string, value:any):void;
}