import { BasePlugin } from '..';
import { Slider } from '../classes';

type LayersSliderPluginOptions = {
  layerSlider?:string,
  num?: number
};

export class LayersSliderPlugin extends BasePlugin {
  constructor(options: LayersSliderPluginOptions)

  layersSlider: HTMLElement | null;
  layerValue: number;

  onLayerValueChange(): void;

  get getLayerValueKey(): string;

}
