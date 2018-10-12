import { ButtonPlugin } from '..';
export class PausePlugin extends ButtonPlugin {
  constructor(pauseButton: string);

  private _isManualPause: boolean;
  private _disablePause: boolean;
  private _paused: boolean;

  set pause(paused: boolean): void;
  get pause(): boolean;

  pauseButton: NodeListOf<HTMLButtonElement>;

  onPauseToggle(): void;
  opened(): void;
  close(): void;
  teardown(): void;
}
