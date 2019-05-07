import { ButtonPlugin } from '..';

type ControlsPluginOptions = {
  pointerSlider?:string,
  buttonSlider?:string
};

export class ControlsPlugin extends ButtonPlugin {
  constructor(options: ControlsluginOptions)


  controlSensitivity: number;

  sensitivitySlider: HTMLInputElement | null;

  onControlSensitivityChange(): void;

  sliderSetup(slider: HTMLInputElement | string, uiElement: string): HTMLInputElement | null;

  sensitivityRange(i: number, min?: number, max?: number): number;
  enableSliderEvents():void;
  disableSliderEvents():void;

  static get controlSensitivityKey(): string;

}