import { BasePlugin } from '../base-plugins';

type DataFormat = {data: { name:any, value: any, type:string }, type: string};

export class UserDataPlugin extends BasePlugin {
  constructor();
  open(): void;
  onUserDataRemove($event: DataFormat): void;
  onUserDataRead($event: DataFormat): void;
  onUserDataWrite($event: DataFormat): void;
}