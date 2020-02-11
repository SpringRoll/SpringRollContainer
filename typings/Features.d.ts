type testOptions = {
  features?: {
    webgl?: boolean;
    geolocation?: boolean;
    webworkers?: boolean;
    webaudio?: boolean;
    websockets?: boolean;
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
  }
};
export class Features {
  static get basic(): string;
  static get canvas(): boolean;
  static get geolocation(): boolean;
  static get info(): string;
  static get touch(): boolean;
  static get webaudio(): boolean;
  static get webgl():boolean;
  static get websockets(): boolean;
  static get webworkers(): boolean;
  static test(capabilities: testOptions): string | null;
}
