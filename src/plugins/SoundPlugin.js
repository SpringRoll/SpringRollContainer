import { SavedData } from '../SavedData';
import { ButtonPlugin } from './ButtonPlugin';

/**
 * @export
 * @class SoundPlugin
 * @extends {ButtonPlugin}
 *
 */
export class SoundPlugin extends ButtonPlugin {
  /**
   *Creates an instance of SoundPlugin.
   * @param {object} params
   * @param {string | HTMLElement} [params.soundButton]
   * @param {string | HTMLElement} [params.musicButton]
   * @param {string | HTMLElement} [params.voButton]
   * @param {string | HTMLElement} [params.sfxButton]
   * @param {string | HTMLElement} [params.soundSlider]
   * @param {string | HTMLElement} [params.musicSlider]
   * @param {string | HTMLElement} [params.sfxSlider]
   * @param {string | HTMLElement} [params.voSlider]
   * @memberof SoundPlugin
   */
  constructor({
    soundButton,
    musicButton,
    sfxButton,
    voButton,
    soundSlider,
    musicSlider,
    sfxSlider,
    voSlider
  } = {}) {
    super('Sound-Button-Plugin');
    const saved = SavedData.read(SoundPlugin.soundMutedKey);
    this._soundMuted = saved ? saved : false;
    this._musicMuted = false;
    this._voMuted = false;
    this._sfxMuted = false;

    this.soundVolume = 0;
    this.musicVolume = 0;
    this.sfxVolume = 0;
    this.voVolume = 0;

    this.soundSlider = this.sliderSetup(
      soundSlider,
      SoundPlugin.soundVolumeKey
    );
    this.musicSlider = this.sliderSetup(
      musicSlider,
      SoundPlugin.musicVolumeKey
    );
    this.sfxSlider = this.sliderSetup(sfxSlider, SoundPlugin.sfxVolumeKey);
    this.voSlider = this.sliderSetup(voSlider, SoundPlugin.voVolumeKey);

    this.soundButton =
      soundButton instanceof HTMLElement
        ? soundButton
        : document.querySelector(soundButton);
    this.musicButton =
      musicButton instanceof HTMLElement
        ? musicButton
        : document.querySelector(musicButton);
    this.sfxButton =
      sfxButton instanceof HTMLElement
        ? sfxButton
        : document.querySelector(sfxButton);

    this.voButton =
      voButton instanceof HTMLElement
        ? voButton
        : document.querySelector(voButton);

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

    this.enableSliderEvents();
  }

  /**
   * @memberof SoundPlugin
   */
  onSoundVolumeChange() {
    this.soundVolume = this.volumeRange(Number(this.soundSlider.value));
    this.soundMuted = !this.soundVolume;
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.soundVolumeKey, this.soundVolume);
  }

  /**
   * @memberof SoundPlugin
   */
  enableSliderEvents() {
    if (this.soundSlider) {
      const onSoundVolumeChange = this.onSoundVolumeChange.bind(this);
      this.soundSlider.addEventListener('change', onSoundVolumeChange);
      this.soundSlider.addEventListener('input', onSoundVolumeChange);
    }

    if (this.musicSlider) {
      const onMusicVolumeChange = this.onMusicVolumeChange.bind(this);
      this.musicSlider.addEventListener('change', onMusicVolumeChange);
      this.soundSlider.addEventListener('input', onMusicVolumeChange);
    }

    if (this.sfxSlider) {
      const onSfxVolumeChange = this.onSfxVolumeChange.bind(this);
      this.sfxSlider.addEventListener('change', onSfxVolumeChange);
      this.soundSlider.addEventListener('input', onSfxVolumeChange);
    }

    if (this.voSlider) {
      const onVoVolumeChange = this.onVoVolumeChange.bind(this);
      this.voSlider.addEventListener('change', onVoVolumeChange);
      this.soundSlider.addEventListener('input', onVoVolumeChange);
    }
  }

  /**
   * @memberof SoundPlugin
   */
  disableSliderEvents() {
    if (this.soundSlider) {
      const onSoundVolumeChange = this.onSoundVolumeChange.bind(this);
      this.soundSlider.removeEventListener('change', onSoundVolumeChange);
      this.soundSlider.removeEventListener('input', onSoundVolumeChange);
    }

    if (this.musicSlider) {
      const onMusicVolumeChange = this.onMusicVolumeChange.bind(this);
      this.musicSlider.removeEventListener('change', onMusicVolumeChange);
      this.soundSlider.removeEventListener('input', onMusicVolumeChange);
    }

    if (this.sfxSlider) {
      const onSfxVolumeChange = this.onSfxVolumeChange.bind(this);
      this.sfxSlider.removeEventListener('change', onSfxVolumeChange);
      this.soundSlider.removeEventListener('input', onSfxVolumeChange);
    }

    if (this.voSlider) {
      const onVoVolumeChange = this.onVoVolumeChange.bind(this);
      this.voSlider.removeEventListener('change', onVoVolumeChange);
      this.soundSlider.removeEventListener('input', onVoVolumeChange);
    }
  }

  /**
   * @memberof SoundPlugin
   */
  onMusicVolumeChange() {
    this.musicVolume = this.volumeRange(Number(this.musicSlider.value));
    this.musicMuted = !this.musicVolume;
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.musicVolumeKey, this.musicVolume);
  }

  /**
   * @memberof SoundPlugin
   */
  onVoVolumeChange() {
    this.voVolume = this.volumeRange(Number(this.voSlider.value));
    this.voMuted = !this.voVolume;
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.voVolumeKey, this.voVolume);
  }

  /**
   * @memberof SoundPlugin
   */
  onSfxVolumeChange() {
    this.sfxVolume = this.volumeRange(Number(this.sfxSlider.value));
    this.sfxMuted = !this.sfxVolume;
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.sfxVolumeKey, this.sfxVolume);
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
   * @param {string} key
   * @param {*} value
   * @param {Element} element
   * @memberof SoundPlugin
   */
  setMuteProp(key, value, element) {
    this['_' + key] = value;
    this._setMuteProp(key, element, value);
  }

  /**
   * @memberof SoundPlugin
   */
  init() {
    this.client.on(
      'features',
      function(features) {
        if (
          !features.data ||
          'object' !== typeof features.data ||
          null === features.data
        ) {
          return;
        }
        if (this.voButton instanceof HTMLElement) {
          this.voButton.style.display = features.data.vo
            ? 'inline-block'
            : 'none';
        }
        if (this.musicButton instanceof HTMLElement) {
          this.musicButton.style.display = features.data.music
            ? 'inline-block'
            : 'none';
        }
        if (this.soundButton instanceof HTMLElement) {
          this.soundButton.style.display = features.data.sound
            ? 'inline-block'
            : 'none';
        }
        if (this.sfxButton instanceof HTMLElement) {
          this.sfxButton.style.display = features.data.sfx
            ? 'inline-block'
            : 'none';
        }

        if (this.soundSlider) {
          this.soundSlider.style.display = features.data.soundVolume
            ? 'inline-block'
            : 'none';
        }
        if (this.voSlider) {
          this.voSlider.style.display = features.data.voVolume
            ? 'inline-block'
            : 'none';
        }
        if (this.musicSlider) {
          this.musicSlider.style.display = features.data.musicVolume
            ? 'inline-block'
            : 'none';
        }
        if (this.sfxSlider) {
          this.sfxSlider.style.display = features.data.sfxVolume
            ? 'inline-block'
            : 'none';
        }
      }.bind(this)
    );
  }

  /**
   * @memberof SoundPlugin
   */
  start() {
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

    this.soundMuted = !!SavedData.read(SoundPlugin.soundMutedKey);
    this.musicMuted = !!SavedData.read(SoundPlugin.musicMutedKey);
    this.sfxMuted = !!SavedData.read(SoundPlugin.sfxMutedKey);
    this.voMuted = !!SavedData.read(SoundPlugin.voMutedKey);
  }

  /**
   * @param {string | HTMLInputElement | HTMLElement} slider
   * @param {string} soundChannel The audio channel this slider will be controlling
   * @returns {Element | HTMLElement}
   * @memberof SoundPlugin
   */
  sliderSetup(slider, soundChannel) {
    if ('string' === typeof slider) {
      slider = document.querySelector(slider);
    }

    if (!slider || 'range' !== slider.type) {
      return null;
    }
    const value = SavedData.read(soundChannel);
    slider['value'] =
      null !== value && value.toString().trim().length > 0 ? value : 1;
    slider['min'] = '0';
    slider['max'] = '1';
    slider['step'] = '0.1';
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
    if (i < min) {
      return min;
    } else if (i > max) {
      return max;
    } else {
      return i;
    }
  }

  /**
   * @memberof SoundPlugin
   */
  set soundMuted(muted) {
    this.setMuteProp('soundMuted', muted, this.soundButton);
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
    this.setMuteProp('voMuted', muted, this.voButton);
  }

  /**
   * @memberof SoundPlugin
   */
  get voMuted() {
    return this._voMuted;
  }

  /**
   * @memberof SoundPlugin
   */
  set musicMuted(muted) {
    this.setMuteProp('musicMuted', muted, this.musicButton);
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
    this.setMuteProp('sfxMuted', muted, this.sfxButton);
  }

  /**
   * @memberof SoundPlugin
   */
  get sfxMuted() {
    return this._sfxMuted;
  }

  /**
   * @readonly
   * @static
   * @memberof SoundPlugin
   */
  static get soundMutedKey() {
    return 'soundMuted';
  }

  /**
   * @readonly
   * @static
   * @memberof SoundPlugin
   */
  static get voMutedKey() {
    return 'voMuted';
  }

  /**
   * @readonly
   * @static
   * @memberof SoundPlugin
   */
  static get musicMutedKey() {
    return 'musicMuted';
  }

  /**
   * @readonly
   * @static
   * @memberof SoundPlugin
   */
  static get sfxMutedKey() {
    return 'sfxMuted';
  }

  /**
   * @readonly
   * @static
   * @memberof SoundPlugin
   */
  static get soundVolumeKey() {
    return 'soundVolume';
  }

  /**
   * @readonly
   * @static
   * @memberof SoundPlugin
   */
  static get sfxVolumeKey() {
    return 'sfxVolume';
  }

  /**
   * @readonly
   * @static
   * @memberof SoundPlugin
   */
  static get voVolumeKey() {
    return 'voVolume';
  }

  /**
   * @readonly
   * @static
   * @memberof SoundPlugin
   */
  static get musicVolumeKey() {
    return 'musicVolume';
  }
}
