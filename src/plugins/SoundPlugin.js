import { SavedData } from '../SavedData';
import { ButtonPlugin } from './ButtonPlugin';
import { Slider } from '../classes/Slider';
import { Button } from '../classes/Button';

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
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this._soundMuted = saved ? saved : false;
    this._musicMuted = false;
    this._voMuted = false;
    this._sfxMuted = false;

    this.soundVolume = 0;
    this.musicVolume = 0;
    this.sfxVolume = 0;
    this.voVolume = 0;

    this.soundSlider = new Slider({
      slider: soundSlider,
      control: SoundPlugin.soundVolumeKey,
      value: this.soundVolume
    });
    this.musicSlider = new Slider({
      slider: musicSlider,
      control: SoundPlugin.musicVolumeKey,
      value: this.musicVolume
    });
    this.sfxSlider = new Slider({
      slider: sfxSlider,
      control: SoundPlugin.sfxVolumeKey,
      value: this.sfxVolume
    });
    this.voSlider = new Slider({
      slider: voSlider,
      control: SoundPlugin.voVolumeKey,
      value: this.voVolume
    });

    this.soundButton = new Button({
      button: soundButton,
      onClick: this.onSoundToggle.bind(this),
      channel: 'sound'
    });
    this.musicButton = new Button({
      button: musicButton,
      onClick: this.onMusicToggle.bind(this),
      channel: 'music'
    });
    this.sfxButton = new Button({
      button: sfxButton,
      onClick: this.onSFXToggle.bind(this),
      channel: 'sfx'
    });
    this.voButton = new Button({
      button: voButton,
      onClick: this.onVOToggle.bind(this),
      channel: 'vo'
    });
    //   soundButton instanceof HTMLElement
    //     ? soundButton
    //     : document.querySelector(soundButton);
    // this.musicButton =
    //   musicButton instanceof HTMLElement
    //     ? musicButton
    //     : document.querySelector(musicButton);
    // this.sfxButton =
    //   sfxButton instanceof HTMLElement
    //     ? sfxButton
    //     : document.querySelector(sfxButton);

    // this.voButton =
    //   voButton instanceof HTMLElement
    //     ? voButton
    //     : document.querySelector(voButton);

    // if (this.soundButton) {
    //   this.soundButton.addEventListener('click', this.onSoundToggle.bind(this));
    // }

    // if (this.musicButton) {
    //   this.musicButton.addEventListener('click', this.onMusicToggle.bind(this));
    // }

    // if (this.sfxButton) {
    //   this.sfxButton.addEventListener('click', this.onSFXToggle.bind(this));
    // }

    // if (this.voButton) {
    //   this.voButton.addEventListener('click', this.onVOToggle.bind(this));
    // }

    this.soundSlider.enableSliderEvents(this.onSoundVolumeChange.bind(this));
    this.musicSlider.enableSliderEvents(this.onMusicVolumeChange.bind(this));
    this.sfxSlider.enableSliderEvents(this.onSfxVolumeChange.bind(this));
    this.voSlider.enableSliderEvents(this.onVoVolumeChange.bind(this));
  }

  /**
   * @memberof SoundPlugin
   */
  onSoundVolumeChange() {
    this.soundVolume = this.soundSlider.sliderRange(
      Number(this.soundSlider.slider.value)
    );
    this.soundMuted = !this.soundVolume;
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.soundVolumeKey, this.soundVolume);
  }

  /**
   * @memberof SoundPlugin
   */
  onMusicVolumeChange() {
    this.musicVolume = this.musicSlider.sliderRange(
      Number(this.musicSlider.slider.value)
    );
    this.musicMuted = !this.musicVolume;
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.musicVolumeKey, this.musicVolume);
  }

  /**
   * @memberof SoundPlugin
   */
  onVoVolumeChange() {
    this.voVolume = this.voSlider.sliderRange(
      Number(this.voSlider.slider.value)
    );
    this.voMuted = !this.voVolume;
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.voVolumeKey, this.voVolume);
  }

  /**
   * @memberof SoundPlugin
   */
  onSfxVolumeChange() {
    this.sfxVolume = this.sfxSlider.sliderRange(
      Number(this.sfxSlider.slider.value)
    );
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
        if (!features.data) {
          return;
        }
        // if (this.voButton instanceof HTMLElement) {
        //   this.voButton.style.display = features.data.vo ? '' : 'none';
        // }
        // if (this.musicButton instanceof HTMLElement) {
        //   this.musicButton.style.display = features.data.music ? '' : 'none';
        // }
        // if (this.soundButton instanceof HTMLElement) {
        //   this.soundButton.style.display = features.data.sound ? '' : 'none';
        // }
        // if (this.sfxButton instanceof HTMLElement) {
        //   this.sfxButton.style.display = features.data.sfx ? '' : 'none';
        // }

        this.soundButton.displayButton(features.data);
        this.musicButton.displayButton(features.data);
        this.sfxButton.displayButton(features.data);
        this.voButton.displayButton(features.data);

        this.soundSlider.displaySlider(features.data);
        this.sfxSlider.displaySlider(features.data);
        this.voSlider.displaySlider(features.data);
        this.musicSlider.displaySlider(features.data);
      }.bind(this)
    );
  }

  /**
   * @memberof SoundPlugin
   */
  start() {
    // if (this.soundButton !== null) {
    //   this.soundButton.classList.remove('disabled');
    // }

    // if (this.sfxButton !== null) {
    //   this.sfxButton.classList.remove('disabled');
    // }

    // if (this.voButton !== null) {
    //   this.voButton.classList.remove('disabled');
    // }

    // if (this.musicButton !== null) {
    //   this.musicButton.classList.remove('disabled');
    // }

    this.soundButton.enableButton();
    this.soundButton.enableButton();
    this.soundButton.enableButton();
    this.soundButton.enableButton();

    this.soundMuted = !!SavedData.read(SoundPlugin.soundMutedKey);
    this.musicMuted = !!SavedData.read(SoundPlugin.musicMutedKey);
    this.sfxMuted = !!SavedData.read(SoundPlugin.sfxMutedKey);
    this.voMuted = !!SavedData.read(SoundPlugin.voMutedKey);

    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
   *
   * Saves the current state of all volume properties, and then sends them to the game
   * @memberof SoundPlugin
   */
  sendAllProperties() {
    this.sendProperty(SoundPlugin.soundVolumeKey, this.soundVolume);
    this.sendProperty(SoundPlugin.musicVolumeKey, this.musicVolume);
    this.sendProperty(SoundPlugin.voVolumeKey, this.voVolume);
    this.sendProperty(SoundPlugin.sfxVolumeKey, this.sfxVolume);

    this.sendProperty(SoundPlugin.voMutedKey, this.voMuted);
    this.sendProperty(SoundPlugin.soundMutedKey, this.soundMuted);
    this.sendProperty(SoundPlugin.musicMutedKey, this.musicMuted);
    this.sendProperty(SoundPlugin.sfxMutedKey, this.sfxMuted);
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
