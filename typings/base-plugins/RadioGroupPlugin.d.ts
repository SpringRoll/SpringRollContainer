import { BasePlugin } from './BasePlugin';
import { RadioGroup } from '../ui-elements';

type radioGroupPluginOptions = {
  supportedValues: string[],
  initialValue: string,
  controlName: string,
  featureName: string,
  radioCount: number
}

export class RadioGroupPlugin extends BasePlugin {
  constructor(cssSelector: string, name: string, options: radioGroupOptions);
  selectors: string[];
  supportedValues: string[];
  initialValue: string;
  controlName: string;
  featureName: string;
  radioCount: number;
  _currentValue: string;
  radioGroups: RadioGroup[];
  radioGroupsLength: number;

  setUpRadios(selectors: string): RadioGroup[];
  sendAllProperties(): void;
  start(): void;

  get currentValue(): string;
  set currentValue(newValue: string): void
}