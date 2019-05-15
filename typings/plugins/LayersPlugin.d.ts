import { BasePlugin } from '..';

type LayersPluginOptions = {
  layersCheckBoxes?:string,
};

export class LayersPlugin extends BasePlugin {
  constructor(options: LayersPluginOptions)

  layersCheckBoxes: HTMLElement | null;

  private layersToggleState: Object;

  onLayerToggle(layer: HTMLInputElement): void;

  getLayersCheckBoxesKey(): string;

}
