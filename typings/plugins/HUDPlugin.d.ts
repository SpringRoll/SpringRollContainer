import { BasePlugin } from '..';

type HUDPluginOptions = {
  positions?: string
};

export class HUDPlugin extends BasePlugin {
  constructor(options: HUDPluginOptions)

  radioGroupName: string;
  positionControls: NodeList;

  onHUDToggle(): void;

  get hudPositionKey(): string;
}
