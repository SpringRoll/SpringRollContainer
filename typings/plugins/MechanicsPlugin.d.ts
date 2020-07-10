import { BasePlugin } from '../base-plugins';
import { Slider } from '../ui-elements';

type MechanicsPluginOptions = {
  hitAreaScaleSliders?: string | HTMLInputElement,
  defaultHitAreaScale?: number,
  dragThresholdScaleSliders?: string | HTMLInputElement,
  defaultDragThresholdScale?: number,
  healthSliders?: string | HTMLInputElement,
  defaultHealth?: number,
  objectCountSliders?: string | HTMLInputElement,
  defaultObjectCount?: number,
  completionPercentageSliders?: string | HTMLInputElement,
  defaultCompletionPercentage?: number,
  speedScaleSliders?: string | HTMLInputElement,
  defaultSpeedScale?: number,
  timersScaleSliders?: string | HTMLInputElement,
  defaultTimersScale?: number,
  inputCountSliders?: string | HTMLInputElement,
  defaultInputCount?: number,
};

type selectorOptions = {
  hitAreaScaleSliders: string | HTMLInputElement,
  dragThresholdScaleSliders: string | HTMLInputElement,
  healthSliders: string | HTMLInputElement,
  objectCountSliders: string | HTMLInputElement,
  completionPercentageSliders: string | HTMLInputElement,
  speedScaleSliders: string | HTMLInputElement,
  timersScaleSliders: string | HTMLInputElement,
  inputCountSliders: string | HTMLInputElement,
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

type slidersLengthOptions = {
  hitAreaScaleSliders: number,
  dragThresholdScaleSliders: number,
  healthSliders: number,
  objectCountSliders: number,
  completionPercentageSliders: number,
  speedScaleSliders: number,
  timersScaleSliders: number,
  inputCountSliders: number,
}

type slidersOptions = {
  hitAreaScaleSliders: Slider[],
  dragThresholdScaleSliders: Slider[],
  healthSliders: Slider[],
  objectCountSliders: Slider[],
  completionPercentageSliders: Slider[],
  speedScaleSliders: Slider[],
  timersScaleSliders: Slider[],
  inputCountSliders: Slider[],
}

export class MechanicsPlugin extends BasePlugin {
  constructor(options: MechanicsPluginOptions)

  values: valueOptions;
  selectors: selectorOptions;
  sliders: slidersOptions;
  slidersLength: slidersLengthOptions;

  onMechanicsChange(target: Event, control: string): void;

  sendAllProperties(): void;

  static get hitAreaScaleKey(): string;

  static get dragThresholdScaleKey(): string;

  static get healthKey(): string;

  static get objectCountKey(): string;

  static get completionPercentageKey(): string;

  static get speedScaleKey(): string;

  static get timersScaleKey(): string;

  static get inputCountKey(): string;
}