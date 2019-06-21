import { BasePlugin } from '..';
import { Slider } from '../classes';

type LayersPluginOptions = {
  layersSlider?:string,
  num?: number
};

export class LayersPlugin extends BasePlugin {
  constructor(options: LayersPluginOptions)

  layersSlider: HTMLElement | null;
  layerValue: number;

  onLayerValueChange(): void;

  get getLayerValueKey(): string;

}
