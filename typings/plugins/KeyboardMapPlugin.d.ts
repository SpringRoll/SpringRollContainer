import { BasePlugin } from '../base-plugins';

export class KeyboardMapPlugin extends BasePlugin {
  constructor(keyContainers?: string | HTMLElement)

  keyContainer: HTMLElement[] | NodeListOf<HTMLElement>;
  keyBindings: object;
  buttons: HTMLButtonElement[];
  activekeyButton: undefined | HTMLButtonElement;

  sendAfterFetch: boolean;
  canEmit: boolean;

  keyContainersLength: number;

  onKeyButtonClick(e: MouseEvent): void;
  bindKey(key: KeyboardEvent): void;

  sendAllProperties(): void;

  static get keyBindingKey(): string;

}