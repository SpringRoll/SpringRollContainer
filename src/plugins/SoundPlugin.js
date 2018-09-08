import { BasePlugin } from './BasePlugin';
import { SavedData } from '../SavedData';

export class SoundPlugin extends BasePlugin {
  constructor({ soundButton, musicButton, sfxButton, voButton, bellhop }) {
    super(60);
    const saved = SavedData.read('soundMuted');
    this._soundMuted = saved ? saved : false;
    this._musicMuted = false;
    this._voMuted = false;
    this._sfxMuted = false;
    this.client = bellhop;

    this.soundButton = document.querySelector(soundButton);
    this.musicButton = document.querySelector(musicButton);
    this.sfxButton = document.querySelector(sfxButton);
    this.voButton = document.querySelector(voButton);

    if (this.soundButton) {
      this.soundButton.addEventListener('click', onSoundToggle.bind(this));
    }

    if (this.musicButton) {
      this.musicButton.addEventListener('click', onMusicToggle.bind(this));
    }

    if (this.sfxButton) {
      this.sfxButton.addEventListener('click', onSFXToggle.bind(this));
    }

    if (this.voButton) {
      this.voButton.addEventListener('click', onVOToggle.bind(this));
    }

    this.client.on(
      'features',
      function(features) {
        if (this.voButton) {
          this.voButton.style.display = 'none';
        }

        if (this.musicButton) {
          this.musicButton.style.display = 'none';
        }

        if (this.soundButton) {
          this.soundButton.style.display = 'none';
        }

        if (this.sfxButton) {
          this.sfxButton.style.display = 'none';
        }

        if (features.vo && this.voButton) {
          this.voButton.style.display = 'inline-block';
        }

        if (features.music && this.musicButton) {
          this.musicButton.style.display = 'inline-block';
        }
        if (features.sound && this.soundButton) {
          this.soundButton.style.display = 'inline-block';
        }

        if (features.sfxButton && this.sfxButton) {
          this.sfxButton.style.display = 'inline-block';
        }
      }.bind(this)
    );
  }

  onSoundToggle() {
    const muted = !this.soundMuted;
    this.soundMuted = muted;
    this.musicMuted = muted;
    this.voMuted = muted;
    this.sfxMuted = muted;
  }

  onMusicToggle() {
    this.musicMuted = !this.musicMuted;
    this._checkSoundMute();
  }

  onVOToggle() {
    this.voMuted = !this.voMuted;
    this._checkSoundMute();
  }

  onSFXToggle() {
    this.sfxMuted = !this.sfxMuted;
    this._checkSoundMute();
  }

  _checkSoundMute() {
    this.soundMuted = this.sfxMuted && this.voMuted && this.musicMuted;
  }

  setMuteProp(key, value, element) {
    this[key] = value;
    this._setMuteProp(key, element, value);
  }

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

  close() {
    this._disableButton(this.soundButton);
    this._disableButton(this.musicButton);
    this._disableButton(this.voButton);
    this._disableButton(this.sfxButton);
  }

  _disableButton(...args) {
    /*TODO=*/
  }
  _setMuteProp(...args) {
    /*TODO=*/
  }

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

  set soundMuted(muted) {
    this.setMuteProp('_soundMuted', muted, this.soundButton);
  }

  get soundMuted() {
    return this._soundMuted;
  }

  set voMuted(muted) {
    this.setMuteProp('_voMuted', muted, this.voButton);
  }

  get voMuted() {
    return this._voMuted;
  }

  set musicMuted(muted) {
    this.setMuteProp('_musicMuted', muted, this.musicButton);
  }

  get musicMuted() {
    return this._musicMuted;
  }

  set sfxMuted(muted) {
    this.setMuteProp('_sfxMuted', muted, this.sfxButton);
  }

  get sfxMuted() {
    return this.sfxMuted;
  }
}
