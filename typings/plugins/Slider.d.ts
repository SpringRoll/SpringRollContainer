
import { SavedData } from '../SavedData';


export class Slider {
  constructor(
    slider: HTMLInputElement | string, control: string, min: number, max: number, step: number, value: number
  )

    min: number;
    max: number;
    step: number;
    value: number;
    slider: HTMLInputElement | string;

  setupSlider(slider: HTMLInputElement | string, control: string): HTMLInputElement | null;

  sliderRange(i: number, min?: number, max?: number): number;
  enableSliderEvents(callBack: Function): void;
  disableSliderEvents(callBack: Function): void;

}