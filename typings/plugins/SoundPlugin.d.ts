import { ButtonPlugin } from '..';
import { Slider } from '..';

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

  private _soundButton: HTMLButtonElement | null;
  private _musicButton: HTMLButtonElement | null;
  private _sfxButton: HTMLButtonElement | null;
  private _voButton: HTMLButtonElement | null;

  soundSlider: Slider | null;
  musicSlider: Slider | null;
  sfxSlider: Slider | null;
  voSlider: Slider | null;

  onSoundVolumeChange(): void;
  onMusicVolumeChange(): void;
  onVoVolumeChange(): void;
  onSfxVolumeChange(): void;
  onSoundToggle(): void;
  onMusicToggle(): void;
  onVOToggle(): void;
  onSFXToggle(): void;
  setMuteProp(): void;

  set soundMuted(muted: boolean): void;
  get soundMuted(): boolean;
  set voMuted(muted: boolean): void;
  get voMuted():boolean;
  set musicMuted(muted: boolean): void;
  get musicMuted(): boolean;
  set sfxMuted(muted:boolean): void;
  get sfxMuted(): boolean;
  get soundButton(): HTMLButtonElement;
  get musicButton(): HTMLButtonElement;
  get sfxButton(): HTMLButtonElement;
  get voButton(): HTMLButtonElement;

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

