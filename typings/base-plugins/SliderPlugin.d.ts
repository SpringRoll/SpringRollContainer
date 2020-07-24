import { BasePlugin } from './BasePlugin';
import { Slider } from '../ui-elements';

type sliderPluginOptions = {
  defaultValue: string,
  minValue: string,
  maxValue: string,
  featureName: string
}

this.minValue = minValue;
this.defaultValue = defaultValue;
this.maxValue = maxValue;



export class SliderPlugin extends BasePlugin {
  constructor(cssSelector: string, name: string, options: sliderOptions);
  maxValue: string | number;
  minvalue: string | number;
  defaultValue: string | number;
  featureName: string;
  _currentValue: string | number;
  sliders: Slider[];
  slidersLength: number;

  setUpSliders(selectors: string): Slider[];
  sendAllProperties(): void;
  start(): void;

  get currentValue(): string;
  set currentValue(newValue: string): void
}