import { SavedData } from '../SavedData';
import { ButtonPlugin } from './ButtonPlugin';

/**
 * @export
 * @class SoundPlugin
 * @extends {ButtonPlugin}
 */
export class SoundPlugin extends ButtonPlugin {
  /**
   *Creates an instance of SoundPlugin.
   * @param {object} Container
   * @memberof SoundPlugin
   */
  constructor({ options: { soundButton, musicButton, sfxButton, voButton } }) {
    super(60);
    const saved = SavedData.read('soundMuted');
    this._soundMuted = saved ? saved : false;
    this._musicMuted = false;
    this._voMuted = false;
    this._sfxMuted = false;

    this.soundButton = document.querySelector(soundButton);
    this.musicButton = document.querySelector(musicButton);
    this.sfxButton = document.querySelector(sfxButton);
    this.voButton = document.querySelector(voButton);

    if (this.soundButton) {
      this.soundButton.addEventListener('click', this.onSoundToggle.bind(this));
    }

    if (this.musicButton) {
      this.musicButton.addEventListener('click', this.onMusicToggle.bind(this));
    }

    if (this.sfxButton) {
      this.sfxButton.addEventListener('click', this.onSFXToggle.bind(this));
    }

    if (this.voButton) {
      this.voButton.addEventListener('click', this.onVOToggle.bind(this));
    }

    this.client.on(
      'features',
      function(features) {
        this.voButton.style.display =
          features.vo && this.voButton ? 'inline-block' : 'none';
        this.musicButton.style.display =
          features.music && this.musicButton ? 'inline-block' : 'none';
        this.soundButton.style.display =
          features.sound && this.soundButton ? 'inline-block' : 'none';
        this.sfxButton.style.display =
          features.sfxButton && this.sfxButton ? 'inline-block' : 'none';
      }.bind(this)
    );
  }

  /**
   * @memberof SoundPlugin
   */
  onSoundToggle() {
    const muted = !this.soundMuted;
    this.soundMuted = muted;
    this.musicMuted = muted;
    this.voMuted = muted;
    this.sfxMuted = muted;
  }

  /**
   * @memberof SoundPlugin
   */
  onMusicToggle() {
    this.musicMuted = !this.musicMuted;
    this._checkSoundMute();
  }

  /**
   * @memberof SoundPlugin
   */
  onVOToggle() {
    this.voMuted = !this.voMuted;
    this._checkSoundMute();
  }

  /**
   * @memberof SoundPlugin
   */
  onSFXToggle() {
    this.sfxMuted = !this.sfxMuted;
    this._checkSoundMute();
  }

  /**
   * @memberof SoundPlugin
   */
  _checkSoundMute() {
    this.soundMuted = this.sfxMuted && this.voMuted && this.musicMuted;
  }

  /**
   *
   *
   * @param {*} key
   * @param {*} value
   * @param {*} element
   * @memberof SoundPlugin
   */
  setMuteProp(key, value, element) {
    this[key] = value;
    this._setMuteProp(key, element, value);
  }

  /**
   *
   *
   * @memberof SoundPlugin
   */
  opened() {
    if (this.soundButton !== null) {
      this.soundButton.classList.remove('disabled');
    }

    if (this.sfxButton !== null) {
      this.sfxButton.classList.remove('disabled');
    }

    if (this.voButton !== null) {
      this.voButton.classList.remove('disabled');
    }

    if (this.musicButton !== null) {
      this.musicButton.classList.remove('disabled');
    }

    this.soundMuted = !!SavedData.read('soundMuted');
    this.musicMuted = !!SavedData.read('musicMuted');
    this.sfxMuted = !!SavedData.read('sfxMuted');
    this.voMuted = !!SavedData.read('voMuted');
  }

  /**
   * @memberof SoundPlugin
   */
  close() {
    this._disableButton(this.soundButton);
    this._disableButton(this.voButton);
    this._disableButton(this.sfxButton);
    this._disableButton(this.musicButton);
  }

  /**
   * @memberof SoundPlugin
   */
  teardown() {
    if (this.soundButton !== null) {
      this.soundButton.removeEventListener(
        'click',
        this.onSoundToggle.bind(this)
      );
    }

    if (this.musicButton !== null) {
      this.musicButton.removeEventListener(
        'click',
        this.onMusicToggle.bind(this)
      );
    }

    if (this.sfxButton !== null) {
      this.sfxButton.removeEventListener('click', this.onSFXToggle.bind(this));
    }

    if (this.voButton !== null) {
      this.voButton.removeEventListener('click', this.onVOToggle.bind(this));
    }
  }

  /**
   * @memberof SoundPlugin
   */
  set soundMuted(muted) {
    this.setMuteProp('_soundMuted', muted, this.soundButton);
  }

  /**
   * @memberof SoundPlugin
   */
  get soundMuted() {
    return this._soundMuted;
  }

  /**
   * @memberof SoundPlugin
   */
  set voMuted(muted) {
    this.setMuteProp('_voMuted', muted, this.voButton);
  }

  /**
   *
   *
   * @memberof SoundPlugin
   */
  get voMuted() {
    return this._voMuted;
  }

  /**
   * @memberof SoundPlugin
   */
  set musicMuted(muted) {
    this.setMuteProp('_musicMuted', muted, this.musicButton);
  }

  /**
   * @memberof SoundPlugin
   */
  get musicMuted() {
    return this._musicMuted;
  }

  /**
   * @memberof SoundPlugin
   */
  set sfxMuted(muted) {
    this.setMuteProp('_sfxMuted', muted, this.sfxButton);
  }

  /**
   * @memberof SoundPlugin
   */
  get sfxMuted() {
    return this._sfxMuted;
  }
}
