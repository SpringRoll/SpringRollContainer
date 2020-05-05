import { BasePlugin } from '..';
import { Slider } from '../ui-elements';

type LayersPluginOptions = {
  layersSliders?: string | HTMLInputElement,
};

export class LayersPlugin extends BasePlugin {
  constructor(options: LayersPluginOptions)

  layersSliders: Slider[];
  layersSlidersLength: number;

  onLayerValueChange(e: Event): void;
  sendAllProperties(): void;

  get getLayerValueKey(): string;

}
