import { BasePlugin } from '../base-plugins/BasePlugin';
import { Slider } from '../ui-elements/Slider';

type ControlsPluginOptions = {
  sensitivitySliders?:string | HTMLElement,
  sensitivity?: number,
  keyContainers?: string | HTMLElement
};

export class ControlsPlugin extends BasePlugin {
  constructor(options: ControlsPluginOptions)

  controlSensitivity: number;

  sensitivitySliders: Slider[];

  keyContainer: HTMLElement[] | NodeListOf<HTMLElement>;
  keyBindings: object;
  buttons: HTMLButtonElement[];
  activekeyButton: undefined | HTMLButtonElement;

  sendAfterFetch: boolean;
  canEmit: boolean;

  sensitivitySlidersLength: number;
  keyContainersLength: number;

  onControlSensitivityChange(e: MouseEvent): void;
  onKeyButtonClick(e: MouseEvent): void;
  bindKey(key: KeyboardEvent): void;

  sendAllProperties(): void;

  static get controlSensitivityKey(): string;
  static get keyBindingKey(): string;

}