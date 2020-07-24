import { RadioGroupPlugin } from '../base-plugins';

export const SUPPORTED_POSITIONS: string[];

type HUDPluginOptions = {
  defaultValue?: string
};

export class HUDPlugin extends RadioGroupPlugin {
  constructor(hudSelectorRadios: string, options: HUDPluginOptions)

  sendAfterFetch: boolean;
  canEmit: boolean;
  positions: string[];

  onHUDSelect(e: Event): void;
  init(): void;
  start(): void;
  sendAllProperties(): void;

  sendAllProperties(): void;
  get hudPositionKey(): string;
}
