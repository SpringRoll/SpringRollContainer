import { ButtonPlugin } from '..';

type DifficultyPluginOptions = {
  difficultySlider?:string,
  defaultDifficulty?: number,
};

type Slider = {
  slider: HTMLInputElement | string, control: string, min: number, max: number, step: number, value: number
}

export class DifficultyPlugin extends ButtonPlugin {
  constructor(options: DifficultyPluginOptions)

  difficulty: number;

  difficultySlider: Slider | null;

  onDifficultySensitivityChange(): void;

  static get difficultySensitivityKey(): string;

}