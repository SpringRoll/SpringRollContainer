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
  constructor({
    options: {
      soundButton,
      musicButton,
      sfxButton,
      voButton,
      soundSlider,
      musicSlider,
      sfxSlider,
      voSlider
    }
  }) {
    super(60);
    const saved = SavedData.read('soundMuted');
    this._soundMuted = saved ? saved : false;
    this._musicMuted = false;
    this._voMuted = false;
    this._sfxMuted = false;

    this.soundVolume = 0;
    this.musicVolume = 0;
    this.sfxVolume = 0;
    this.voVolume = 0;

    this.soundSlider = this.sliderSetup(
      document.querySelector(soundSlider),
      soundSlider
    );
    this.musicSlider = this.sliderSetup(
      document.querySelector(musicSlider),
      musicSlider
    );
    this.sfxSlider = this.sliderSetup(
      document.querySelector(sfxSlider),
      sfxSlider
    );
    this.voSlider = this.sliderSetup(
      document.querySelector(voSlider),
      voSlider
    );

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

    if (this.soundSlider) {
      this.soundSlider.addEventListener(
        'change',
        this.onSoundVolumeChange.bind(this)
      );
    }

    if (this.musicSlider) {
      this.musicSlider.addEventListener(
        'change',
        this.onMusicVolumeChange.bind(this)
      );
    }

    if (this.sfxSlider) {
      this.sfxSlider.addEventListener(
        'change',
        this.onSfxVolumeChange.bind(this)
      );
    }

    if (this.voSlider) {
      this.voSlider.addEventListener(
        'change',
        this.onVoVolumeChange.bind(this)
      );
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
   *
   *
   * @memberof SoundPlugin
   */
  onSoundVolumeChange() {
    this.soundVolume = this.volumeRange(Number(this.soundSlider.value));
    this.soundMuted = !this.soundVolume;
    this._checkSoundMute();
    this.sendProperty('soundVolume', this.soundVolume);
  }

  /**
   *
   *
   * @memberof SoundPlugin
   */
  onMusicVolumeChange() {
    this.musicVolume = this.volumeRange(Number(this.musicSlider.value));
    this.musicMuted = !this.musicVolume;
    this._checkSoundMute();
    this.sendProperty('musicVolume', this.musicVolume);
  }

  /**
   *
   *
   * @memberof SoundPlugin
   */
  onVoVolumeChange() {
    this.voVolume = this.volumeRange(Number(this.voSlider.value));
    this.voMuted = !this.voVolume;
    this._checkSoundMute();
    this.sendProperty('voVolume', this.voVolume);
  }

  /**
   *
   *
   * @memberof SoundPlugin
   */
  onSfxVolumeChange() {
    this.sfxVolume = this.volumeRange(Number(this.sfxSlider.value));
    this.sfxMuted = !this.sfxVolume;
    this._checkSoundMute();
    this.sendProperty('sfxVolume', this.sfxVolume);
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
   *
   *
   * @param {HTMLInputElement} slider
   * @param {string} elementName
   * @memberof SoundPlugin
   */
  sliderSetup(slider, elementName) {
    if ('range' !== slider.type) {
      console.warn(
        `SpringRoll Container: Sound plugin was passed a invalid input of ${elementName}. Input must be of type range`
      );
      return null;
    }

    slider.min = '0';
    slider.max = '1';
    slider.step = '0.1';
    return slider;
  }

  /**
   * Controls the volume range
   * @param {number} i
   * @param {number} [min=0]
   * @param {number} [max=1]
   * @returns
   * @memberof SoundPlugin
   */
  volumeRange(i, min = 0, max = 1) {
    switch (true) {
    case i < min:
      return min;
    case i > max:
      return max;
    default:
      return i;
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
