type SliderOptions = {
  slider: HTMLInputElement | string,
  control: string,
  min?: number,
  max?: number,
  step?: number,
  defaultValue?: number
};

export class Slider {
  constructor(
    SliderOptions: SliderOptions
  )

    min: number;
    max: number;
    step: number;
    value: number;
    slider: HTMLInputElement | string;

  setupSlider(slider: HTMLInputElement | string, control: string): HTMLInputElement | null;

  sliderRange(i: number): number;
  enableSliderEvents(callBack: Function): void;
  disableSliderEvents(callBack: Function): void;
  displaySlider(data: object): void;

  dispatchEvent(event: Event): void;

  get value(): string;
  set value(value: number): void;
}