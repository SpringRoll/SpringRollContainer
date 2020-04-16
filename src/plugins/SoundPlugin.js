import { SavedData } from '../SavedData';
import { ButtonPlugin } from './ButtonPlugin';
import { Slider, Button } from '../ui-elements';

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

    this.soundVolume = 1;
    this.musicVolume = 1;
    this.sfxVolume = 1;
    this.voVolume = 1;

    this.soundSlider = new Slider({
      slider: soundSlider,
      control: SoundPlugin.soundVolumeKey,
      defaultValue: this.soundVolume
    });
    this.musicSlider = new Slider({
      slider: musicSlider,
      control: SoundPlugin.musicVolumeKey,
      defaultValue: this.musicVolume
    });
    this.sfxSlider = new Slider({
      slider: sfxSlider,
      control: SoundPlugin.sfxVolumeKey,
      defaultValue: this.sfxVolume
    });
    this.voSlider = new Slider({
      slider: voSlider,
      control: SoundPlugin.voVolumeKey,
      defaultValue: this.voVolume
    });

    this._soundButton = new Button({
      button: soundButton,
      onClick: this.onSoundToggle.bind(this),
      channel: 'sound'
    });
    this._musicButton = new Button({
      button: musicButton,
      onClick: this.onMusicToggle.bind(this),
      channel: 'music'
    });
    this._sfxButton = new Button({
      button: sfxButton,
      onClick: this.onSFXToggle.bind(this),
      channel: 'sfx'
    });
    this._voButton = new Button({
      button: voButton,
      onClick: this.onVOToggle.bind(this),
      channel: 'vo'
    });

    this.soundSlider.enableSliderEvents(this.onSoundVolumeChange.bind(this));
    this.musicSlider.enableSliderEvents(this.onMusicVolumeChange.bind(this));
    this.sfxSlider.enableSliderEvents(this.onSfxVolumeChange.bind(this));
    this.voSlider.enableSliderEvents(this.onVoVolumeChange.bind(this));

    this.soundVolume = this.soundSlider.slider ? this.soundSlider.value : 1;
    this.musicVolume = this.musicSlider.slider ? this.musicSlider.value : 1;
    this.sfxVolume = this.sfxSlider.slider ? this.sfxSlider.value : 1;
    this.voVolume = this.voSlider.slider ? this.voSlider.value : 1;
  }

  /**
   * @memberof SoundPlugin
   */
  onSoundVolumeChange() {
    this.soundVolume = this.soundSlider.sliderRange(
      Number(this.soundSlider.value)
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
      Number(this.musicSlider.value)
    );
    this.musicMuted = !this.musicVolume;
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.musicVolumeKey, this.musicVolume);
  }

  /**
   * @memberof SoundPlugin
   */
  onVoVolumeChange() {
    this.voVolume = this.voSlider.sliderRange(Number(this.voSlider.value));
    this.voMuted = !this.voVolume;
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.voVolumeKey, this.voVolume);
  }

  /**
   * @memberof SoundPlugin
   */
  onSfxVolumeChange() {
    this.sfxVolume = this.sfxSlider.sliderRange(Number(this.sfxSlider.value));
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

        console.log(features.data);
        this._soundButton.displayButton(features.data);
        this._musicButton.displayButton(features.data);
        this._sfxButton.displayButton(features.data);
        this._voButton.displayButton(features.data);

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
    this._soundButton.enableButton();
    this._musicButton.enableButton();
    this._sfxButton.enableButton();
    this._voButton.enableButton();

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

  /**
   * @readonly
   * @memberof SoundPlugin
   */
  get soundButton() {
    return this._soundButton.button;
  }

  /**
   * @readonly
   * @memberof SoundPlugin
   */
  get musicButton() {
    return this._musicButton.button;
  }
  /**
   * @readonly
   * @memberof SoundPlugin
   */
  get sfxButton() {
    return this._sfxButton.button;
  }
  /**
   * @readonly
   * @memberof SoundPlugin
   */
  get voButton() {
    return this._voButton.button;
  }
}
