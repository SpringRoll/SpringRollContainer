import { SoundPlugin } from '../index';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('SoundPlugin', () => {
  let sp;
  const options = {
    soundButton: 'sb',
    musicButton: 'mb',
    sfxButton: 'sfxb',
    voButton: 'vb',
    soundSlider: 'ss',
    musicSlider: 'ms',
    sfxSlider: 'sfxs',
    voSlider: 'vs'
  };

  before(() => {
    document.body.innerHTML = '';
    Object.keys(options).forEach(key => {
      if (/Button/.test(key)) {
        const button = document.createElement('button');
        button.id = options[key];
        options[key] = `#${options[key]}`;
        document.body.appendChild(button);
      } else {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = options[key];
        options[key] = `#${options[key]}`;
        document.body.appendChild(slider);
      }
    });
    sp = new SoundPlugin({ options });
  });

  it('construct', () => {
    expect(sp.soundButton).to.be.instanceof(HTMLButtonElement);
    expect(sp.musicButton).to.be.instanceof(HTMLButtonElement);
    expect(sp.sfxButton).to.be.instanceof(HTMLButtonElement);
    expect(sp.voButton).to.be.instanceof(HTMLButtonElement);
  });

  it('.setMuteProp()', () => {
    sp.setMuteProp('_soundMuted', true, sp.soundButton);
    expect(sp._soundMuted).to.be.true;
    sp.setMuteProp('_soundMuted', false, sp.soundButton);
    expect(sp._soundMuted).to.be.false;
  });

  it('.soundMuted()', () => {
    expect(sp.soundMuted).to.be.false;
    sp.soundMuted = true;
    expect(sp.soundMuted).to.be.true;
  });

  it('.voMuted()', () => {
    expect(sp.voMuted).to.be.false;
    sp.voMuted = true;
    expect(sp.voMuted).to.be.true;
  });

  it('.musicMuted()', () => {
    expect(sp.musicMuted).to.be.false;
    sp.musicMuted = true;
    expect(sp.musicMuted).to.be.true;
  });

  it('.sfxMuted()', () => {
    expect(sp.sfxMuted).to.be.false;
    sp.sfxMuted = true;
    expect(sp.sfxMuted).to.be.true;
  });

  it('.onSoundToggle()', () => {
    sp.onSoundToggle();
    expect(sp.soundMuted).to.be.false;
    expect(sp.voMuted).to.be.false;
    expect(sp.musicMuted).to.be.false;
    expect(sp.sfxMuted).to.be.false;
  });

  it('.onSoundVolumeChange()', () => {
    sp.soundSlider.value = 1;
    sp.soundSlider.dispatchEvent(initEvent('change'));

    expect(sp.sfxVolume).to.equal(1);
    expect(sp.voVolume).to.equal(1);
    expect(sp.musicVolume).to.equal(1);
    expect(sp.soundVolume).to.equal(1);

    sp.soundSlider.value = 0;
    sp.soundSlider.dispatchEvent(initEvent('change'));

    expect(sp.sfxVolume).to.equal(0);
    expect(sp.voVolume).to.equal(0);
    expect(sp.musicVolume).to.equal(0);
    expect(sp.soundVolume).to.equal(0);
  });

  it('.onMusicVolumeChange()', () => {
    sp.musicSlider.value = 1;
    sp.musicSlider.dispatchEvent(initEvent('change'));

    expect(sp.musicMuted).to.be.false;

    sp.musicSlider.value = 0;
    sp.musicSlider.dispatchEvent(initEvent('change'));

    expect(sp.musicMuted).to.be.true;
  });

  it('.onVoVolumeChange()', () => {
    sp.voSlider.value = 1;
    sp.voSlider.dispatchEvent(initEvent('change'));

    expect(sp.voMuted).to.be.false;

    sp.voSlider.value = 0;
    sp.voSlider.dispatchEvent(initEvent('change'));

    expect(sp.voMuted).to.be.true;
  });

  it('.onSfxVolumeChange()', () => {
    sp.sfxSlider.value = 1;
    sp.sfxSlider.dispatchEvent(initEvent('change'));

    expect(sp.sfxMuted).to.be.false;

    sp.sfxSlider.value = 0;
    sp.sfxSlider.dispatchEvent(initEvent('change'));

    expect(sp.sfxMuted).to.be.true;
  });

  it('.onMusicToggle()', () => {
    sp.onMusicToggle();
    expect(sp.musicMuted).to.be.a('boolean');
  });

  it('.onVOToggle()', () => {
    sp.onVOToggle();
    expect(sp.voMuted).to.be.a('boolean');
  });

  it('.onSFXToggle()', () => {
    sp.onSFXToggle();
    expect(sp.sfxMuted).to.be.a('boolean');
  });

  it('_checkSoundMute()', () => {
    sp._checkSoundMute();
    expect(sp.soundMuted).to.be.a('boolean');
  });

  it('.opened()', () => {
    sp.opened();
  });

  it('.close()', () => {
    sp.close();
  });

  it('.teardown()', () => {
    sp.teardown();
  });
});
