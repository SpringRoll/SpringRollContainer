import { ButtonPlugin } from '..';

type HUDPluginOptions = {
  hudSelectorButton: string | HTMLButtonElement
};

export class HUDPlugin extends ButtonPlugin {
  constructor(options: HUDPluginOptions)

  _hudButton: HTMLButtonElement | null;

  currentPos: number | null;
  supportPositions: Array<string>;
  positions: Array<string>;
  onHUDToggle(): void;

  get hudButton(): HTMLButtonElement;
  get hudPositionKey(): string;
}
