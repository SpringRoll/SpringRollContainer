import { ButtonPlugin } from '..';

type ControlsPluginOptions = {
  sensitivitySlider?:string,
};

type Slider = {
  slider: HTMLInputElement | string, control: string, min: number, max: number, step: number, value: number
}

export class ControlsPlugin extends ButtonPlugin {
  constructor(options: ControlsluginOptions)

  controlSensitivity: number;

  sensitivitySlider: Slider | null;

  onControlSensitivityChange(): void;

  static get controlSensitivityKey(): string;

}