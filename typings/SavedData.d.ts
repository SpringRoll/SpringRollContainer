export class SavedData {
  static disableWebStorage(): void;
  static read(name: string): any
  static remove(name: string): void;
  static write(name: string, value: any, tempOnly: boolean): void;

  IDBOpen(dbName: string, dbVersion: number | null, additions: object | null, deletions: object | null, callback: function | null): void;
  IDBAdd(storeName: string, value: any, key: string | number, callback: function | null): void;
  IDBUpdate(storeName: string, key: string | number, value: any, callback: function | null): void;
  IDBRemove(storeName: string, key: string | number, callback: function): void;
  IDBRead(storeName: string, key: any, callback: function | null): void;
  IDBReadAll(storeName: string, count: number, callback: function | null): void;
  IDBGetVersion(dbName: string, callback: function | null);
  closeDb(): void;

  static get WEB_STORAGE_SUPPORT(): boolean;
  static get ERASE_COOKIE(): boolean;
  static set ERASE_COOKIE(flag: boolean): void;

}
