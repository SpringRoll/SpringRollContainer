import { ButtonPlugin } from '..';

type SoundPluginOptions = {
  soundButton?:string,
  musicButton?:string,
  sfxButton?:string,
  voButton?:string,
  soundSlider?:string,
  musicSlider?:string,
  sfxSlider?:string,
  voSlider?:string
};

export class SoundPlugin extends ButtonPlugin {
  constructor(options: SoundPluginOptions)

  private _soundMuted: boolean;
  private _musicMuted: boolean;
  private _voMuted: boolean;
  private _sfxMuted: boolean;

  soundVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voVolume: number;

  soundButton: HTMLButtonElement | null;
  musicButton: HTMLButtonElement | null;
  sfxButton: HTMLButtonElement | null;
  voButton: HTMLButtonElement | null;

  soundSlider: HTMLInputElement | null;
  musicSlider: HTMLInputElement | null;
  sfxSlider: HTMLInputElement | null;
  voSlider: HTMLInputElement | null;

  onSoundVolumeChange(): void;
  onMusicVolumeChange(): void;
  onVoVolumeChange(): void;
  onSfxVolumeChange(): void;
  onSoundToggle(): void;
  onMusicToggle(): void;
  onVOToggle(): void;
  onSFXToggle(): void;
  setMuteProp(): void;
  sliderSetup(slider: HTMLInputElement | string, soundChannel: string): HTMLInputElement | null;

  volumeRange(i: number, min?: number, max?: number): number;
  enableSliderEvents():void;
  disableSliderEvents():void;


  set soundMuted(muted: boolean): void;
  get soundMuted(): boolean;
  set voMuted(muted: boolean): void;
  get voMuted():boolean;
  set musicMuted(muted: boolean): void;
  get musicMuted(): boolean;
  set sfxMuted(muted:boolean): void;
  get sfxMuted(): boolean;

  static get musicVolumeKey(): string;
  static get voVolumeKey(): string;
  static get sfxVolumeKey(): string;
  static get soundVolumeKey(): string;
  static get sfxMutedKey(): string;
  static get musicMutedKey(): string;
  static get voMutedKey(): string;
  static get soundMutedKey(): string;

  private _checkSoundMute(): void;
}

