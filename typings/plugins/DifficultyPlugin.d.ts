import { ButtonPlugin } from '..';
import { SliderOptions } from '../ui-elements';

type DifficultyPluginOptions = {
  hitAreaScaleSlider: string | HTMLInputElement,
  defaultHitAreaScale?: number,
  dragThresholdScaleSlider: string | HTMLInputElement,
  defaultDragThresholdScale?: number,
  healthSlider: string | HTMLInputElement,
  defaultHealth?: number,
  objectCountSlider: string | HTMLInputElement,
  defaultObjectCount?: number,
  completionPercentageSlider: string | HTMLInputElement,
  defaultCompletionPercentage?: number,
  speedScaleSlider: string | HTMLInputElement,
  defaultSpeedScale?: number,
  timersScaleSlider: string | HTMLInputElement,
  defaultTimersScale?: number,
  inputCountSlider: string | HTMLInputElement,
  defaultInputCount?: number,
};
type Slider = {
  slider: HTMLInputElement | string, control: string, min: number, max: number, step: number, value: number
}
type valueOptions = {
  hitAreaScale: number,
  dragThresholdScale: number,
  health: number,
  objectCount: number,
  completionPercentage: number,
  speedScale: number,
  timersScale: number,
  inputCount: number,
}

type slidersOptions = {
  hitAreaScaleSlider: Slider,
  dragThresholdScaleSlider: Slider,
  healthSlider: Slider,
  objectCountSlider: Slider,
  completionPercentageSlider:Slider,
  speedScaleSlider: Slider,
  timersScaleSlider: Slider,
  inputCountSlider: Slider,
}

export class DifficultyPlugin extends ButtonPlugin {
  constructor(options: DifficultyPluginOptions)

  values: valueOptions;

  sliders: slidersOptions;

  onDifficultyChange(control: string): void;

  static get hitAreaScaleKey(): string;

  static get dragThresholdScaleKey(): string;

  static get healthKey(): string;

  static get objectCountKey(): string;

  static get completionPercentageKey(): string;

  static get speedScaleKey(): string;

  static get timersScaleKey(): string;

  static get inputCountKey(): string;
}