import { BasePlugin } from "..plugins/BasePlugin";

type RadioGroupOptions = {
  selector: string,
  controlName: string,
  featureName?: string,
  defaultValue: string,
  pluginName: string,
};

export class RadioGroup extends BasePlugin {
  constructor(
    RadioGroupOptions: RadioGroupOptions
  )

  controlName: string;
  featureName: string;
  radioElements: NodeList;
  defaultValue: string;
  radioGroup: Object;

  hasOnly(valuesArray: string[]): boolean;
  hasDuplicateValues(): boolean;
  enableRadioEvents(callBack: Function): void;
  disableRadioEvents(callBack: Function): void;
  displayRadios(data: object): void;
  resetState(): void;

  get length(): number;
  get values(): string[];
}