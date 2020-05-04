import { ButtonPlugin } from '..';
import { Slider } from '../ui-elements';
import { Button } from '../ui-elements';

type SoundPluginOptions = {
  soundButtons?: string,
  musicButtons?: string,
  sfxButtons?: string,
  voButtons?: string,
  soundSliders?: string,
  musicSliders?: string,
  sfxSliders?: string,
  voSliders?: string
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

  soundButtons: Button[];
  musicButtons: Button[];
  sfxButtons: Button[];
  voButtons: Button[];

  soundSliders: Slider[];
  musicSliders: Slider[];
  sfxSliders: Slider[];
  voSliders: Slider[];

  soundSlidersLength: number;
  musicSlidersLength: number;
  sfxSlidersLength: number;
  voSlidersLength: number;
  soundButtonsLength: number;
  musicButtonsLength: number;
  sfxButtonsLength: number;
  voButtonsLength: number;

  onSoundVolumeChange(e: Event): void;
  onMusicVolumeChange(e: Event): void;
  onVoVolumeChange(e: Event): void;
  onSfxVolumeChange(e: Event): void;
  onSoundToggle(): void;
  onMusicToggle(): void;
  onVOToggle(): void;
  onSFXToggle(): void;
  setMuteProp(key: string, value: boolean, element: Button[]): void;
  sendAllProperties(): void;

  set soundMuted(muted: boolean);
  get soundMuted(): boolean;
  set voMuted(muted: boolean);
  get voMuted():boolean;
  set musicMuted(muted: boolean);
  get musicMuted(): boolean;
  set sfxMuted(muted:boolean);
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

