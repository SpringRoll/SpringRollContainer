import { Bellhop } from "bellhop-iframe";
import { BasePlugin } from "../src/plugins/BasePlugin";

type OpenOptions = {singlePlay?: boolean, playOption?: object | null};
type RemoteOptions = {query?: string, singlePlay?: boolean};

export class Container {
  client: Bellhop;
  loaded: boolean;
  loading: boolean;
  dom: HTMLIFrameElement;
  main: HTMLIFrameElement;
  release?: any;

  constructor(iframeSelector: string);

  close(): void;
  destroy():void;
  destroyClient(): void;
  initClient(): void;
  onEndGame(): void;
  onLoadDone(): void;
  onLoading(): void;
  onLocalError($event: Error): void;
  openPath(path: string, options?:object, playOptions?: object): void;
  openRemote(api:string, options?: RemoteOptions, playOptions?: object | null):void;
  preload(): void;
  reset():void;
  private _internalOpen(userPath:string, options?: OpenOptions): void;
  private _onCloseFailed(): void;
  get client(): Bellhop;
  set client(bellhop: Bellhop): void;
  static clearPlugins(): void;
  static get client(): Bellhop;
  static get plugins(): Array<BasePlugin>;
  static get version(): string;
  static set client(bellhop: Bellhop): void;
  static sortPlugins(): void;
  static uses(plugin: BasePlugin);
}