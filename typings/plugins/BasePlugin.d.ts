import { Bellhop } from "bellhop-iframe";

export interface IBasePlugin {
  name:string;
  required:Array<string>;
  optional:Array<string>;
  preload:function;
  setup:function;
  open:function;
  opened:function;
  close:function;
  closed:function;
  teardown: function;
  sendProperty:function;
  client(): Bellhop;
}

export class BasePlugin implements IBasePlugin() {
  constructor(name:string, required?:Array<string>, optional?: Array<string>);
  name:string;
  required:Array<string>;
  optional:Array<string>;
  preload:function;
  setup:function;
  open:function;
  opened:function;
  close:function;
  closed:function;
  teardown: function;
  sendProperty:function;
  get client(): Bellhop;
}