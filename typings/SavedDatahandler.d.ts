export class SavedDataHandler {
  static remote(name:string, callback: function):void;
  static write(name:string, value:any, callback:function): void;
  static read(name:string, callback:function(data)):void

  IDBOpen(dbName: string, dbVersion: number | null, additions: object | null, deletions: object | null, callback: function | null): void;
  IDBAdd(storeName: string, value: any, key: string | number, callback: function | null): void;
  IDBUpdate(storeName: string, key: string | number, value: any, callback: function | null): void;
  IDBRemove(storeName: string, key: string | number, callback: function): void;
  IDBRead(storeName: string, key: any, callback: function | null): void;
  IDBReadAll(storeName: string, count: number, callback: function | null): void;
  IDBGetVersion(dbName: string, callback: function | null);
  closeDb(): void;
}