import { BasePlugin } from '../plugins';
import { RadioButtonGroup } from '../ui-elements';

type HUDPluginOptions = {
  defaultValue: string
};

export class HUDPlugin extends BasePlugin {
  constructor(hudSelectorRadios: string, options: HUDPluginOptions)

  hudPositionSelectors: string[];
  hudRadios: RadioButtonGroup[];
  currentValue: string;
  defaultValue: string;
  hudRadiosLength: number;
  sendAfterFetch: boolean;
  canEmit: boolean;
  _hudButtons: Button[];
  positions: string[];

  onHUDSelect(e: Event): void;
  setUpHUDRadios(selectors: string[]);

  sendAllProperties(): void;
  get hudPositionKey(): string;
}
