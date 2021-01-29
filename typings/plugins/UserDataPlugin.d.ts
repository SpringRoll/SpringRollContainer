import { BasePlugin } from '../base-plugins';

type DataFormat = {data: { name:any, value: any, type:string }, type: string};

export class UserDataPlugin extends BasePlugin {
  constructor();
  open(): void;
  onUserDataRemove($event: DataFormat): void;
  onUserDataRead($event: DataFormat): void;
  onUserDataWrite($event: DataFormat): void;

  onIDBOpen(dbName: string, dbVersion: number | null, additions: object | null, deletions: object | null): void;
  onIDBAdd(storeName: string, value: any, key: string | number): void;
  onIDBUpdate(storeName: string, key: string | number, value: any): void;
  onIDBRemove(storeName: string, key: string | number) : void;
  onIDBRead(storeName: string, key: any): void;
  onIDBReadAll(storeName: string, count: number): void;
  onIDBGetVersion(dbName: string);
  oncloseDb(): void;
}