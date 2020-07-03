import { BasePlugin } from '../base-plugins/BasePlugin';
import { Slider } from '../ui-elements/Slider';

type ButtonSizePluginOptions = {
  buttonSliders?:string,
  defaultButtonSize?: number,
};

export class ButtonSizePlugin extends BasePlugin {
  constructor(options: ButtonSizePluginOptions)

  buttonSize: number;

  buttonSliders: Slider[];
  buttonSlidersLength: number;

  onButtonSizeChange(e: Event): void;

  get buttonSizeKey(): string;

}

