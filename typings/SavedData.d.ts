export class SavedData {
  static disableWebStorage(): void;
  static read(name: string): any
  static remove(name: string): void;
  static write(name: sttring, value: any, tempOnly: boolean): void;

  static get WEB_STORAGE_SUPPORT(): boolean;
  static get ERASE_COOKIE(): boolean;
  static set ERASE_COOKIE(flag: boolean): void;

}
