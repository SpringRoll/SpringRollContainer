export class SavedData {
  static disableWebStorage(): void;
  static read(name: string): any
  static remove(name: string): void;
  static write(name: sttring, value: any, tempOnly: boolean): void;

  static onOpenDb(dbName: string, dbVersion: INT | null, additions: JSON): void;
  static onIDBAdd(storeName: string, record: any): void;
  static onIDBDelete(storeName: string, key: any): void;
  static onIDBRead(storeName: string, key: any): void;
  static closeDb(): void;

  static get WEB_STORAGE_SUPPORT(): boolean;
  static get ERASE_COOKIE(): boolean;
  static set ERASE_COOKIE(flag: boolean): void;

}
