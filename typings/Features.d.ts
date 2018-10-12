type testOptions = {
  features?: {
    webgl?: boolean;
    geolocation?: boolean;
    webWorkers?: boolean;
    webAudio?: boolean;
    webSockets?: boolean;
  },
  sizes?: {
    xsmall: boolean;
    small: boolean;
    medium: boolean;
    large: boolean;
    xlarge: boolean;
  }
  ui?: {
    touch: boolean;
    mouse: boolean;
  }
};
export class Features {
  static get basic(): string;
  static get canvas(): boolean;
  static get geolocation(): boolean;
  static get info(): string;
  static get touch(): boolean;
  static get webAudio(): boolean;
  static get webgl():boolean;
  static get webSockets(): boolean;
  static get webWorkers(): boolean;
  static test(capabilities: testOptions): string | null;
}