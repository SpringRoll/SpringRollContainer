import { ButtonPlugin } from '../plugins';
import { Button } from '../ui-elements';

type HUDPluginOptions = {
  hudSelectorButtons: string | HTMLButtonElement
};

export class HUDPlugin extends ButtonPlugin {
  constructor(options: HUDPluginOptions)

  hudSelectorButtons: string | HTMLButtonElement;
  sendAfterFetch: boolean;
  canEmit: boolean;
  _hudButtons: Button[];
  supportedPositions: string[];
  positions: string[];
  currentPos: number;
  hudButtonsLength: number;

  onHUDToggle(): void;

  sendAllProperties(): void;
  get hudPositionKey(): string;
}
