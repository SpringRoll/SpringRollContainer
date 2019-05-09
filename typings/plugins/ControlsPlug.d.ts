import { ButtonPlugin } from '..';

type ControlsPluginOptions = {
  sensitivitySlider?:string,
};

type Slider = {
  slider: HTMLInputElement | string, control: string, min: number, max: number, step: number, value: number
}

const SENSITIVITY_SLIDER_MIN: number;
const SENSITIVITY_SLIDER_MAX: number;
const SENSITIVITY_SLIDER_STEP: number;

export class ControlsPlugin extends ButtonPlugin {
  constructor(options: ControlsluginOptions)

  controlSensitivity: number;

  sensitivitySlider: Slider | null;

  onControlSensitivityChange(): void;

  static get controlSensitivityKey(): string;

}