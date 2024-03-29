import { SavedData } from '../SavedData';
import { ButtonPlugin } from '../base-plugins';
import { Slider, Button } from '../ui-elements';

/**
 * @export
 * @class SoundPlugin
 * @extends {ButtonPlugin}
 *
 */
export class SoundPlugin extends ButtonPlugin {
  /**
   * Creates an instance of SoundPlugin.
   * @param {string | HTMLElement} [soundButtons] selector string or HTML Element for the input(s)
   * @param {string | HTMLElement} [musicButtons] selector string or HTML Element for the input(s)
   * @param {string | HTMLElement} [voButtons] selector string or HTML Element for the input(s)
   * @param {string | HTMLElement} [sfxButtons] selector string or HTML Element for the input(s)
   * @param {string | HTMLElement} [soundSliders] selector string or HTML Element for the input(s)
   * @param {string | HTMLElement} [musicSliders] selector string or HTML Element for the input(s)
   * @param {string | HTMLElement} [sfxSliders] selector string or HTML Element for the input(s)
   * @param {string | HTMLElement} [voSliders] selector string or HTML Element for the input(s)
   * @memberof SoundPlugin
   */
  constructor({
    soundButtons,
    musicButtons,
    sfxButtons,
    voButtons,
    soundSliders,
    musicSliders,
    sfxSliders,
    voSliders
  } = {}) {
    super('Sound-Button-Plugin');
    const saved = SavedData.read(SoundPlugin.soundMutedKey);
    this.sendAllProperties = this.sendAllProperties.bind(this);
    this._soundMuted = saved ? saved : false;
    this._musicMuted = false;
    this._voMuted = false;
    this._sfxMuted = false;

    this._musicMutedByUser = false;
    this._soundMutedByUser = false;
    this._sfxMutedByUser = false;
    this._voMutedByUser = false;

    this.soundMutedEnabled = false;
    this.musicMutedEnabled = false;
    this.sfxMutedEnabled = false;
    this.voMutedEnabled = false;

    this.soundVolume = 1;
    this.musicVolume = 1;
    this.sfxVolume = 1;
    this.voVolume = 1;

    this.soundSliders = [];
    this.musicSliders = [];
    this.sfxSliders = [];
    this.voSliders = [];

    this.soundButtons = [];
    this.musicButtons = [];
    this.sfxButtons = [];
    this.voButtons= [];

    if (soundSliders instanceof HTMLElement) {
      this.soundSliders[0] = new Slider({
        slider: soundSliders,
        control: SoundPlugin.soundVolumeKey,
        defaultValue: this.soundVolume
      });
    } else {
      document.querySelectorAll(soundSliders).forEach((slider) => {
        const newSlider = new Slider({
          slider: slider,
          control: SoundPlugin.soundVolumeKey,
          defaultValue: this.soundVolume
        });
        if (newSlider.slider) {
          this.soundSliders.push(newSlider);
        }
      });
    }
    if (musicSliders instanceof HTMLElement) {
      this.musicSliders[0] = new Slider({
        slider: musicSliders,
        control: SoundPlugin.musicVolumeKey,
        defaultValue: this.musicVolume
      });
    } else {
      document.querySelectorAll(musicSliders).forEach((slider) => {
        const newSlider = new Slider({
          slider: slider,
          control: SoundPlugin.musicVolumeKey,
          defaultValue: this.musicVolume
        });
        if (newSlider.slider) {
          this.musicSliders.push(newSlider);
        }
      });
    }
    if (sfxSliders instanceof HTMLElement) {
      this.sfxSliders[0] = new Slider({
        slider: sfxSliders,
        control: SoundPlugin.sfxVolumeKey,
        defaultValue: this.sfxVolume
      });
    } else {
      document.querySelectorAll(sfxSliders).forEach((slider) => {
        const newSlider = new Slider({
          slider: slider,
          control: SoundPlugin.sfxVolumeKey,
          defaultValue: this.sfxVolume
        });
        if (newSlider.slider) {
          this.sfxSliders.push(newSlider);
        }
      });
    }
    if (voSliders instanceof HTMLElement) {
      this.voSliders[0] = new Slider({
        slider: voSliders,
        control: SoundPlugin.voVolumeKey,
        defaultValue: this.voVolume
      });
    } else {
      document.querySelectorAll(voSliders).forEach((slider) => {
        const newSlider = new Slider({
          slider: slider,
          control: SoundPlugin.voVolumeKey,
          defaultValue: this.voVolume
        });
        if (newSlider.slider) {
          this.voSliders.push(newSlider);
        }
      });
    }

    if ( soundButtons instanceof HTMLElement ) {
      this.soundButtons[0] = new Button({
        button: soundButtons,
        onClick: this.onSoundToggle.bind(this),
        channel: SoundPlugin.soundKey
      });
    } else {
      document.querySelectorAll(soundButtons).forEach((button) => {
        this.soundButtons.push(new Button({
          button: button,
          onClick: this.onSoundToggle.bind(this),
          channel: SoundPlugin.soundKey
        }));
      });
    }
    if ( musicButtons instanceof HTMLElement ) {
      this.musicButtons[0] = new Button({
        button: musicButtons,
        onClick: this.onMusicToggle.bind(this),
        channel: 'music'
      });
    } else {
      document.querySelectorAll(musicButtons).forEach((button) => {
        this.musicButtons.push(new Button({
          button: button,
          onClick: this.onMusicToggle.bind(this),
          channel: 'music'
        }));
      });
    }
    if ( sfxButtons instanceof HTMLElement ) {
      this.sfxButtons[0] = new Button({
        button: sfxButtons,
        onClick: this.onSFXToggle.bind(this),
        channel: 'sfx'
      });
    } else {
      document.querySelectorAll(sfxButtons).forEach((button) => {
        this.sfxButtons.push(new Button({
          button: button,
          onClick: this.onSFXToggle.bind(this),
          channel: 'sfx'
        }));
      });
    }
    if ( voButtons instanceof HTMLElement ) {
      this.voButtons[0] = new Button({
        button: voButtons,
        onClick: this.onVOToggle.bind(this),
        channel: 'vo'
      });
    } else {
      document.querySelectorAll(voButtons).forEach((button) => {
        this.voButtons.push(new Button({
          button: button,
          onClick: this.onVOToggle.bind(this),
          channel: 'vo'
        }));
      });
    }

    this.soundSlidersLength = this.soundSliders.length;
    this.musicSlidersLength = this.musicSliders.length;
    this.sfxSlidersLength = this.sfxSliders.length;
    this.voSlidersLength = this.voSliders.length;
    this.soundButtonsLength = this.soundButtons.length;
    this.musicButtonsLength = this.musicButtons.length;
    this.sfxButtonsLength = this.sfxButtons.length;
    this.voButtonsLength = this.voButtons.length;

    if (0 >= (this.soundSlidersLength + this.musicSlidersLength + this.sfxSlidersLength + this.voSlidersLength + this.soundButtonsLength + this.musicButtonsLength + this.sfxButtonsLength + this.voButtonsLength)) {
      this.warn('Plugin was not provided any valid HTML Elements');
      return;
    }

    for (let i = 0; i < this.soundSlidersLength; i++) {
      this.soundSliders[i].enableSliderEvents(this.onSoundVolumeChange.bind(this));
    }
    for (let i = 0; i < this.musicSlidersLength; i++) {
      this.musicSliders[i].enableSliderEvents(this.onMusicVolumeChange.bind(this));
    }
    for (let i = 0; i < this.sfxSlidersLength; i++) {
      this.sfxSliders[i].enableSliderEvents(this.onSFXVolumeChange.bind(this));
    }
    for (let i = 0; i < this.voSlidersLength; i++) {
      this.voSliders[i].enableSliderEvents(this.onVOVolumeChange.bind(this));
    }

    if (this.soundSliders[0] && this.soundSliders[0].slider) {
      this.soundVolume = this.soundSliders[0].value;
    }
    if (this.musicSliders[0] && this.musicSliders[0].slider) {
      this.musicVolume = this.musicSliders[0].value;
    }
    if (this.sfxSliders[0] && this.sfxSliders[0].slider) {
      this.sfxVolume = this.sfxSliders[0].value;
    }
    if (this.voSliders[0] && this.voSliders[0].slider) {
      this.voVolume = this.voSliders[0].value;
    }
  }

  /**
   * @memberof SoundPlugin
   * @param {Event} e
   */
  onSoundVolumeChange(e) {
    if (this.soundSlidersLength <= 0) {
      this.soundVolume = e.target.value;
      return;
    }
    this.soundVolume = this.soundSliders[0].sliderRange(
      Number(e.target.value)
    );
    this.soundMuted = !this.soundVolume;

    if (!this._musicMutedByUser) {
      this.musicMuted = this.soundMuted;
    }
    if (!this._sfxMutedByUser) {
      this.sfxMuted = this.soundMuted;
    }
    if (!this._voMutedByUser) {
      this.voMuted = this.soundMuted;
    }

    this.sendProperty(SoundPlugin.soundVolumeKey, this.soundVolume);

    for (let i = 0; i < this.soundSlidersLength; i++) {
      this.soundSliders[i].value = this.soundVolume;
    }
  }

  /**
   * @memberof SoundPlugin
   * @param {Event} e
   */
  onMusicVolumeChange(e) {
    if (this.musicSlidersLength <= 0) {
      this.musicVolume = e.target.value;
      return;
    }

    this.musicVolume = this.musicSliders[0].sliderRange(
      Number(e.target.value)
    );

    this.musicMuted = !this.musicVolume;
    if (!this.musicMuted) { this._musicMutedByUser = false; }
    this._checkSoundMute();
    this.sendProperty(SoundPlugin.musicVolumeKey, this.musicVolume);

    for (let i = 0; i < this.musicSlidersLength; i++) {
      this.musicSliders[i].value = this.musicVolume;
    }
  }

  /**
   * @memberof SoundPlugin
   * @param {Event} e
   */
  onVOVolumeChange(e) {
    if (this.voSlidersLength <= 0) {
      this.voVolume = e.target.value;
      return;
    }
    this.voVolume = this.voSliders[0].sliderRange(Number(e.target.value));
    if (!this.voMuted) { this._voMutedByUser = false; }
    this.voMuted = !this.voVolume;
    this._checkSoundMute();

    this.sendProperty(SoundPlugin.voVolumeKey, this.voVolume);
    for (let i = 0; i < this.voSlidersLength; i++) {
      this.voSliders[i].value = this.voVolume;
    }
  }

  /**
   * @memberof SoundPlugin
   * @param {Event} e
   */
  onSFXVolumeChange(e) {
    if (this.sfxSlidersLength <= 0) {
      this.sfxVolume = e.target.value;
      return;
    }
    this.sfxVolume = this.sfxSliders[0].sliderRange(Number(e.target.value));
    if (!this.sfxMuted) { this._sfxMutedByUser = false; }
    this.sfxMuted = !this.sfxVolume;
    this._checkSoundMute();

    this.sendProperty(SoundPlugin.sfxVolumeKey, this.sfxVolume);

    for (let i = 0; i < this.sfxSlidersLength; i++) {
      this.sfxSliders[i].value = this.sfxVolume;
    }
  }

  /**
   * @memberof SoundPlugin
   */
  onSoundToggle() {
    const muted = !this.soundMuted;
    this.soundMuted = muted;

    if (!this._musicMutedByUser || muted) {
      this.musicMuted = muted;
    }
    if (!this._sfxMutedByUser || muted) {
      this.sfxMuted = muted;
    }
    if (!this._voMutedByUser || muted) {
      this.voMuted = muted;
    }
  }

  /**
   * @memberof SoundPlugin
   */
  onMusicToggle() {
    this.musicMuted = !this.musicMuted;
    this._musicMutedByUser = this.musicMuted;
    this._checkSoundMute();
  }

  /**
   * @memberof SoundPlugin
   */
  onVOToggle() {
    this.voMuted = !this.voMuted;
    this._voMutedByUser = this.voMuted;
    this._checkSoundMute();
  }

  /**
   * @memberof SoundPlugin
   */
  onSFXToggle() {
    this.sfxMuted = !this.sfxMuted;
    this._sfxMutedByUser = this.sfxMuted;
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
  setMuteProp(key, value, element, disableSend = false) {
    this['_' + key] = value;
    this._setMuteProp(key, element, value, disableSend);
  }

  /**
   * @memberof SoundPlugin
   */
  async preload({ client }) {
    this.client = client;
    this.client.on(
      'features',
      function(features) {
        if (!features.data) {
          return;
        }
        
        // Confirm that the mute features are supported
        this.soundMutedEnabled = !!features.data.sound;
        this.musicMutedEnabled = !!features.data.music;
        this.sfxMutedEnabled = !!features.data.sfx;
        this.voMutedEnabled = !!features.data.vo;
        
        this.soundVolumeEnabled = !!features.data.soundVolume;
        this.musicVolumeEnabled = !!features.data.musicVolume;
        this.sfxVolumeEnabled = !!features.data.sfxVolume;
        this.voVolumeEnabled = !!features.data.voVolume;
        
        for (let i = 0; i < this.soundButtonsLength; i++) {
          this.soundButtons[i].displayButton(features.data);
        }
        for (let i = 0; i < this.musicButtonsLength; i++) {
          this.musicButtons[i].displayButton(features.data);
        }
        for (let i = 0; i < this.sfxButtonsLength; i++) {
          this.sfxButtons[i].displayButton(features.data);
        }
        for (let i = 0; i < this.voButtonsLength; i++) {
          this.voButtons[i].displayButton(features.data);
        }
        for (let i = 0; i < this.soundSlidersLength; i++) {
          this.soundSliders[i].displaySlider(features.data);
        }
        for (let i = 0; i < this.musicSlidersLength; i++) {
          this.musicSliders[i].displaySlider(features.data);
        }
        for (let i = 0; i < this.sfxSlidersLength; i++) {
          this.sfxSliders[i].displaySlider(features.data);
        }
        for (let i = 0; i < this.voSlidersLength; i++) {
          this.voSliders[i].displaySlider(features.data);
        }

        const soundMuted = !!SavedData.read(SoundPlugin.soundMutedKey);
        const musicMuted = !!SavedData.read(SoundPlugin.musicMutedKey);
        const sfxMuted = !!SavedData.read(SoundPlugin.sfxMutedKey);
        const voMuted = !!SavedData.read(SoundPlugin.voMutedKey);

        // set the property in case buttons exist but disable the send here
        // properties will be sent in sendAllProperties
        this.setMuteProp('soundMuted', soundMuted, this.soundButtons, true);
        this.setMuteProp('musicMuted', musicMuted, this.musicButtons, true);
        this.setMuteProp('sfxMuted', sfxMuted, this.sfxButtons, true);
        this.setMuteProp('voMuted', voMuted, this.voButtons, true);
      }.bind(this)
    );
  }

  /**
   * @memberof SoundPlugin
   */
  start() {
    for (let i = 0; i < this.soundButtonsLength; i++) {
      this.soundButtons[i].enableButton();
    }
    for (let i = 0; i < this.musicButtonsLength; i++) {
      this.musicButtons[i].enableButton();
    }
    for (let i = 0; i < this.sfxButtonsLength; i++) {
      this.sfxButtons[i].enableButton();
    }
    for (let i = 0; i < this.voButtonsLength; i++) {
      this.voButtons[i].enableButton();
    }

    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
   *
   * Saves the current state of all volume properties, and then sends them to the game
   * @memberof SoundPlugin
   */
  sendAllProperties() {

    if ( this.soundVolumeEnabled && this.soundSlidersLength > 0 ) {
      this.sendProperty(SoundPlugin.soundVolumeKey, this.soundVolume);
    }
    if ( this.musicVolumeEnabled && this.musicSlidersLength > 0 ) {
      this.sendProperty(SoundPlugin.musicVolumeKey, this.musicVolume);
    }
    if ( this.voVolumeEnabled && this.voSlidersLength > 0 ) {
      this.sendProperty(SoundPlugin.voVolumeKey, this.voVolume);
    }
    if ( this.sfxVolumeEnabled && this.sfxSlidersLength > 0 ) {
      this.sendProperty(SoundPlugin.sfxVolumeKey, this.sfxVolume);
    }

    // to avoid the mute property overwriting the volume on startup, mutes should only send if they're true
    // or the volume channel isn't enabled
    if ( (this.soundButtonsLength > 0 && this.soundMutedEnabled) && (this.soundMuted || !this.soundVolumeEnabled )) {
      this.sendProperty(SoundPlugin.soundMutedKey, this.soundMuted);
    }
    if ( (this.musicButtonsLength > 0 && this.musicMutedEnabled) && (this.musicMuted || !this.musicVolumeEnabled )) {
      this.sendProperty(SoundPlugin.musicMutedKey, this.musicMuted);
    }
    if ( (this.voButtonsLength > 0 && this.voMutedEnabled) && ( this.voMuted || !this.voVolumeEnabled )) {
      this.sendProperty(SoundPlugin.voMutedKey, this.voMuted);
    }
    if ( (this.sfxButtonsLength > 0 && this.sfxMutedEnabled) && (this.sfxMuted || !this.sfxVolumeEnabled )) {
      this.sendProperty(SoundPlugin.sfxMutedKey, this.sfxMuted);
    }
  }

  /**
   * @memberof SoundPlugin
   * @param {boolean} muted
   */
  set soundMuted(muted) {
    if (muted === this.soundMuted) {
      // have to do this to make sure it gets set up properly on start up
      this.setMuteProp('soundMuted', muted, this.soundButtons, true);
      return;
    }

    let disableSend = false;
    // if volume is enabled and the channel is becoming unmuted we update everything but only send the volume
    if (this.soundVolumeEnabled && !muted) {
      this.sendProperty(SoundPlugin.soundVolumeKey, this.soundVolume);
      disableSend = true;
    }
    this.setMuteProp('soundMuted', muted, this.soundButtons, disableSend);
  }

  /**
   * @memberof SoundPlugin
   */
  get soundMuted() {
    return this._soundMuted;
  }

  /**
   * @memberof SoundPlugin
   * @param {boolean} muted
   */
  set voMuted(muted) {
    let disableSend = false;
    if (this.voMuted === muted) {
      // have to do this to make sure it gets set up properly on start up
      this.setMuteProp('voMuted', muted, this.voButtons, true);
      return;
    }
    if ((this.voVolumeEnabled && !muted)) {
      this.sendProperty(SoundPlugin.voVolumeKey, this.voVolume);
      disableSend = true;
    }
    this.setMuteProp('voMuted', muted, this.voButtons, disableSend);
  }

  /**
   * @memberof SoundPlugin
   */
  get voMuted() {
    return this._voMuted;
  }

  /**
   * @memberof SoundPlugin
   * @param {boolean} muted
   */
  set musicMuted(muted) {
    if (this.musicMuted === muted) {
      // have to do this to make sure it gets set up properly on start up
      this.setMuteProp('musicMuted', muted, this.musicButtons, true);
      return;  
    }
    let disableSend = false;
    if (this.musicVolumeEnabled && !muted) {
      this.sendProperty(SoundPlugin.musicVolumeKey, this.musicVolume);
      disableSend = true;
    }

    this.setMuteProp('musicMuted', muted, this.musicButtons, disableSend);
  }

  /**
   * @memberof SoundPlugin
   */
  get musicMuted() {
    return this._musicMuted;
  }

  /**
   * @memberof SoundPlugin
   * @param {boolean} muted
   */
  set sfxMuted(muted) {
    if (this.sfxMuted === muted) {
      // have to do this to make sure it gets set up properly on start up
      this.setMuteProp('sfxMuted', muted, this.sfxButtons, true);
      return;
    }
    let disableSend = false;
    if (this.sfxVolumeEnabled && !muted) {
      this.sendProperty(SoundPlugin.sfxVolumeKey, this.sfxVolume);
      disableSend = true;
    }
    this.setMuteProp('sfxMuted', muted, this.sfxButtons, disableSend);
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

  /**
   * @readonly
   * @static
   * @memberof SpeedScalePlugin
   * @return {string}
   */
  static get soundKey() {
    return 'sound';
  }
}
