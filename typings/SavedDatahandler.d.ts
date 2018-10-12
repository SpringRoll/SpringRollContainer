export class SavedDataHandler {
  static remote(name:string, callback: function):void;
  static write(name:string, value:any, callback:function): void;
  static read(name:string, callback:function(data)):void
}