import { ButtonPlugin } from '..';

type ControlsPluginOptions = {
  sensitivitySlider?:string | HTMLElement,
  sensitivity?: number,
  keyContainer?: string | HTMLElement
};

type Slider = {
  slider: HTMLInputElement | string, control: string, min: number, max: number, step: number, value: number
}

export class ControlsPlugin extends ButtonPlugin {
  constructor(options: ControlsluginOptions)

  controlSensitivity: number;

  sensitivitySlider: Slider | null;

  keyContainer: string | HTMLInputElement;
  keyBindings: object;
  buttons: Array<HTMLButtonElement>;
  activekeyButton: undefined | HTMLButtonElement;

  onKeyButtonClick(): void;
  bindKey(): void;

  onControlSensitivityChange(): void;

  static get controlSensitivityKey(): string;
  static get keyBindingKey(): string;

}