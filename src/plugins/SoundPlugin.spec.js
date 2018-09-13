import { SoundPlugin } from './SoundPlugin';
import { Bellhop } from 'bellhop-iframe';

describe('SoundPlugin', () => {
  let sp;
  const options = {
    soundButton: 'sb',
    musicButton: 'mb',
    sfxButton: 'sfxb',
    voButton: 'vb'
  };

  before(() => {
    document.body.innerHTML = '';
    Object.keys(options).forEach(key => {
      const button = document.createElement('button');
      button.id = options[key];
      options[key] = `#${options[key]}`;
      document.body.appendChild(button);
    });
    sp = new SoundPlugin({ options, client: new Bellhop() });
  });

  it('construct', () => {
    expect(sp.soundButton).to.be.instanceof(HTMLButtonElement);
    expect(sp.musicButton).to.be.instanceof(HTMLButtonElement);
    expect(sp.sfxButton).to.be.instanceof(HTMLButtonElement);
    expect(sp.voButton).to.be.instanceof(HTMLButtonElement);
    expect(sp.client).to.be.instanceof(Bellhop);
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

  it('.onMusicToggle()', () => {
    sp.onMusicToggle();
    expect(sp.musicMuted).to.be.true;
  });

  it('.onVOToggle()', () => {
    sp.onVOToggle();
    expect(sp.voMuted).to.be.true;
  });

  it('.onSFXToggle()', () => {
    sp.onSFXToggle();
    expect(sp.sfxMuted).to.be.true;
  });

  it('_checkSoundMute()', () => {
    sp._checkSoundMute();
    expect(sp.soundMuted).to.be.true;
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
