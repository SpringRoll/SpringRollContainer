import { BasePlugin } from '..';

type HUDPluginOptions = {
  positions?: string
};

export class HUDPlugin extends BasePlugin {
  constructor(options: HUDPluginOptions)

  positionControls: HTMLElement;
  radioButtons: Array<HTMLElements>;
  currentPos: string | null;

  onHUDToggle(): void;

  get hudPositionKey(): string;
}
