import { SliderPlugin } from '../base-plugins';

type ControlSensitivityPluginOptions = {
  defaultSensitivity?: number | string,
};

export class ControlSensitivityPlugin extends SliderPlugin {
  constructor(sensitivitySliders?:string | HTMLElement, options: ControlSensitivityPluginOptions)

  onControlSensitivityChange(e: MouseEvent): void;

  static get controlSensitivityKey(): string;
}