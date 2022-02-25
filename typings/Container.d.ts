import { Bellhop } from "bellhop-iframe";
import { IPlugin } from './plugins';

type OpenOptions = {singlePlay?: boolean, playOption?: object | null, [key:string]: any};
interface RemoteOptions extends OpenOptions {
  query?:string;
}

export class PluginManager {
  client: Bellhop;
  plugins: Array<IPlugin>;
  setupPlugins(): void;
  uses(plugin: IPlugin): void;
  getPlugin(name:string): IPlugin | undefined;
}

type containerOptions = {
  plugins?: Array<IPlugin>,
  context?: object
};

export class Container extends PluginManager {
  client: Bellhop;
  loaded: boolean;
  loading: boolean;
  iFrame: HTMLIFrameElement;
  release?: any;
  constructor(iframeSelector: string, options: containerOptions);
  close(): void;
  destroy():void;
  initClient(): void;
  onEndGame(): void;
  onLoadDone(): void;
  onLoading(): void;
  onLocalError($event: Error): void;
  openPath(path: string, options?:OpenOptions): void;
  openRemote(api:string, options?: RemoteOptions, playOptions?: object | null): Promise<void>;
  reset():void;
  private _internalOpen(userPath:string, options?: OpenOptions): void;
  private _onCloseFailed(): void;
  static version(): string;
}