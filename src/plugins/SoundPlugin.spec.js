import { Container, SoundPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('SoundPlugin', () => {
  let sp;
  const options = {
    soundButtons: 'sb',
    musicButtons: 'mb',
    sfxButtons: 'sfxb',
    voButtons: 'vb',
    soundSliders: 'ss',
    musicSliders: 'ms',
    sfxSliders: 'sfxs',
    voSliders: 'vs'
  };

  before(() => {
    document.body.innerHTML = '';
    Object.keys(options).forEach(key => {
      if (/Button/.test(key)) {
        const button = document.createElement('button');
        const buttonTwo = document.createElement('button');

        button.id = options[key];
        buttonTwo.id = `${options[key]}Two`;

        document.body.appendChild(button);
        document.body.appendChild(buttonTwo);

        options[key] = `#${options[key]}, #${options[key]}Two`;
      } else {
        const slider = document.createElement('input');
        const sliderTwo = document.createElement('input');

        slider.type = 'range';
        sliderTwo.type = 'range';

        slider.id = options[key];
        sliderTwo.id = `${options[key]}Two`;

        options[key] = `#${options[key]}, #${options[key]}Two`;

        document.body.appendChild(slider);
        document.body.appendChild(sliderTwo);
      }
    });
    sp = new SoundPlugin(options);
    sp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'sound-plugin-iframe';
    document.body.appendChild(iframe);

    expect(sp.soundButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.soundButtons[0].button.style.display).to.equal('');
    expect(sp.soundButtons[0].button.classList.contains('disabled')).to.be.false;
    expect(sp.soundButtons[1].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.soundButtons[1].button.style.display).to.equal('');
    expect(sp.soundButtons[1].button.classList.contains('disabled')).to.be.false;

    expect(sp.musicButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.musicButtons[0].button.style.display).to.equal('');
    expect(sp.musicButtons[0].button.classList.contains('disabled')).to.be.false;
    expect(sp.musicButtons[1].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.musicButtons[1].button.style.display).to.equal('');
    expect(sp.musicButtons[1].button.classList.contains('disabled')).to.be.false;

    expect(sp.sfxButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.sfxButtons[0].button.style.display).to.equal('');
    expect(sp.sfxButtons[0].button.classList.contains('disabled')).to.be.false;
    expect(sp.sfxButtons[1].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.sfxButtons[1].button.style.display).to.equal('');
    expect(sp.sfxButtons[1].button.classList.contains('disabled')).to.be.false;

    expect(sp.voButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.voButtons[0].button.style.display).to.equal('');
    expect(sp.voButtons[0].button.classList.contains('disabled')).to.be.false;
    expect(sp.voButtons[1].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.voButtons[1].button.style.display).to.equal('');
    expect(sp.voButtons[1].button.classList.contains('disabled')).to.be.false;

    new Container('#sound-plugin-iframe').client.trigger(
      'features'
    );
  });

  it('.setMuteProp()', () => {
    sp.setMuteProp('soundMuted', true, sp.soundButtons);
    expect(sp._soundMuted).to.be.true;
    sp.setMuteProp('soundMuted', false, sp.soundButtons);
    expect(sp._soundMuted).to.be.false;
  });

  it('.soundMuted()', () => {
    expect(sp.soundMuted).to.be.false;
    expect(sp.soundButtons[0].button.classList.contains('muted')).to.be.false;
    sp.soundMuted = true;
    expect(sp.soundMuted).to.be.true;
    expect(sp.soundButtons[0].button.classList.contains('muted')).to.be.true;
  });

  it('.voMuted()', () => {
    expect(sp.voMuted).to.be.false;
    expect(sp.voButtons[0].button.classList.contains('muted')).to.be.false;
    sp.voMuted = true;
    expect(sp.voMuted).to.be.true;
    expect(sp.voButtons[0].button.classList.contains('muted')).to.be.true;
  });

  it('.musicMuted()', () => {
    expect(sp.musicMuted).to.be.false;
    expect(sp.musicButtons[0].button.classList.contains('muted')).to.be.false;
    sp.musicMuted = true;
    expect(sp.musicMuted).to.be.true;
    expect(sp.musicButtons[0].button.classList.contains('muted')).to.be.true;
  });

  it('.sfxMuted()', () => {
    expect(sp.sfxMuted).to.be.false;
    expect(sp.sfxButtons[0].button.classList.contains('muted')).to.be.false;
    sp.sfxMuted = true;
    expect(sp.sfxMuted).to.be.true;
    expect(sp.sfxButtons[0].button.classList.contains('muted')).to.be.true;
  });

  it('.onSoundVolumeChange()', () => {
    sp.soundSliders[0].value = 1;
    sp.soundSliders[0].dispatchEvent(initEvent('change'));

    expect(sp.soundVolume).to.equal(1);
    expect(sp.soundSliders[0].value).to.equal('1');
    expect(sp.soundSliders[1].value).to.equal('1');

    sp.soundSliders[1].value = 0;
    sp.soundSliders[1].dispatchEvent(initEvent('change'));

    expect(sp.soundVolume).to.equal(0);
    expect(sp.soundSliders[0].value).to.equal('0');
    expect(sp.soundSliders[1].value).to.equal('0');
  });

  it('.onMusicVolumeChange()', () => {
    sp.musicSliders[0].value = 1;
    sp.musicSliders[0].dispatchEvent(initEvent('change'));

    expect(sp.musicMuted).to.be.false;
    expect(sp.musicSliders[0].value).to.equal('1');
    expect(sp.musicSliders[1].value).to.equal('1');

    sp.musicSliders[0].value = 0;
    sp.musicSliders[0].dispatchEvent(initEvent('change'));

    expect(sp.musicMuted).to.be.true;
    expect(sp.musicSliders[0].value).to.equal('0');
    expect(sp.musicSliders[1].value).to.equal('0');
  });

  it('.onVoVolumeChange()', () => {
    sp.voSliders[0].value = 1;
    sp.voSliders[0].dispatchEvent(initEvent('change'));

    expect(sp.voMuted).to.be.false;
    expect(sp.voSliders[0].value).to.equal('1');
    expect(sp.voSliders[1].value).to.equal('1');

    sp.voSliders[0].value = 0;
    sp.voSliders[0].dispatchEvent(initEvent('change'));

    expect(sp.voMuted).to.be.true;
    expect(sp.voSliders[0].value).to.equal('0');
    expect(sp.voSliders[1].value).to.equal('0');
  });

  it('.onSfxVolumeChange()', () => {
    sp.sfxSliders[0].value = 1;
    sp.sfxSliders[0].dispatchEvent(initEvent('change'));

    expect(sp.sfxMuted).to.be.false;
    expect(sp.sfxSliders[0].value).to.equal('1');
    expect(sp.sfxSliders[1].value).to.equal('1');

    sp.sfxSliders[0].value = 0;
    sp.sfxSliders[0].dispatchEvent(initEvent('change'));

    expect(sp.sfxMuted).to.be.true;
    expect(sp.sfxSliders[0].value).to.equal('0');
    expect(sp.sfxSliders[1].value).to.equal('0');
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

  it('should work without any controls', () => {
    //set up empty plugin
    sp = new SoundPlugin();
    sp.preload({ client: new Bellhop() });
    sp.init();
    sp.client.trigger('features', {});
  });

  it('should work with only button elements', () => {
    document.body.innerHTML = '';

    const buttonOptions = {
      soundButtons: 'sb',
      musicButtons: 'mb',
      sfxButtons: 'sfxb',
      voButtons: 'vb',
    };

    Object.keys(buttonOptions).forEach(key => {
      if (/Button/.test(key)) {

        const button = document.createElement('button');
        button.id = buttonOptions[key];
        document.body.appendChild(button);
        buttonOptions[key] = button;
      }
    });

    sp = new SoundPlugin(buttonOptions);
    sp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'sound-plugin-iframe';
    document.body.appendChild(iframe);

    new Container('#sound-plugin-iframe').client.trigger(
      'features'
    );

    expect(sp.soundSlidersLength).to.equal(0);
    expect(sp.musicSlidersLength).to.equal(0);
    expect(sp.sfxSlidersLength).to.equal(0);
    expect(sp.voSlidersLength).to.equal(0);

    //buttons
    expect(sp.soundButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.soundButtons[0].button.style.display).to.equal('');
    expect(sp.soundButtons[0].button.classList.contains('disabled')).to.be.false;

    expect(sp.musicButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.musicButtons[0].button.style.display).to.equal('');
    expect(sp.musicButtons[0].button.classList.contains('disabled')).to.be.false;

    expect(sp.sfxButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.sfxButtons[0].button.style.display).to.equal('');
    expect(sp.sfxButtons[0].button.classList.contains('disabled')).to.be.false;

    expect(sp.voButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.voButtons[0].button.style.display).to.equal('');
    expect(sp.voButtons[0].button.classList.contains('disabled')).to.be.false;
  });

  it('should work with only slider elements', () => {
    document.body.innerHTML = '';
    const sliderOptions = {
      soundSliders: 'ss',
      musicSliders: 'ms',
      sfxSliders: 'sfxs',
      voSliders: 'vs'
    };

    Object.keys(sliderOptions).forEach(key => {
      if (/Slider/.test(key)) {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = sliderOptions[key];
        sliderOptions[key] = slider;
        document.body.appendChild(slider);
      }
    });

    sp = new SoundPlugin(sliderOptions);
    sp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'sound-plugin-iframe';
    document.body.appendChild(iframe);

    new Container('#sound-plugin-iframe').client.trigger(
      'features'
    );

    expect(sp.soundButtonsLength).to.equal(0);
    expect(sp.musicButtonsLength).to.equal(0);
    expect(sp.sfxButtonsLength).to.equal(0);
    expect(sp.voButtonsLength).to.equal(0);

    //sliders
    expect(sp.soundSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.soundSliders[0].slider.style.display).to.equal('');

    expect(sp.musicSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.musicSliders[0].slider.style.display).to.equal('');

    expect(sp.sfxSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.sfxSliders[0].slider.style.display).to.equal('');

    expect(sp.voSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.voSliders[0].slider.style.display).to.equal('');
  });

  it('should allow custom step value for sliders', () => {
    document.body.innerHTML = '';
    const sliderOptions = {
      soundSliders: 'ss',
      musicSliders: 'ms',
      sfxSliders: 'sfxs',
      voSliders: 'vs',
      stepOverride: 0.25,
    };

    Object.keys(sliderOptions).forEach(key => {
      if (/Slider/.test(key)) {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = sliderOptions[key];
        sliderOptions[key] = slider;
        document.body.appendChild(slider);
      }
    });

    sp = new SoundPlugin(sliderOptions);
    sp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'sound-plugin-iframe';
    document.body.appendChild(iframe);

    new Container('#sound-plugin-iframe').client.trigger(
      'features'
    );

    //sliders
    expect(sp.soundSliders[0].slider.step).to.equal('0.25');

    expect(sp.musicSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.musicSliders[0].slider.step).to.equal('0.25');

    expect(sp.sfxSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.sfxSliders[0].slider.step).to.equal('0.25');

    expect(sp.voSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.voSliders[0].slider.step).to.equal('0.25');
  });

  it('should ignore step value greater than or equal to 1', () => {
    document.body.innerHTML = '';
    const sliderOptions = {
      soundSliders: 'ss',
      musicSliders: 'ms',
      sfxSliders: 'sfxs',
      voSliders: 'vs',
      stepOverride: 1,
    };

    Object.keys(sliderOptions).forEach(key => {
      if (/Slider/.test(key)) {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = sliderOptions[key];
        sliderOptions[key] = slider;
        document.body.appendChild(slider);
      }
    });

    sp = new SoundPlugin(sliderOptions);
    sp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'sound-plugin-iframe';
    document.body.appendChild(iframe);

    new Container('#sound-plugin-iframe').client.trigger(
      'features'
    );

    //sliders
    expect(sp.soundSliders[0].slider.step).to.equal('0.1');

    expect(sp.musicSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.musicSliders[0].slider.step).to.equal('0.1');

    expect(sp.sfxSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.sfxSliders[0].slider.step).to.equal('0.1');

    expect(sp.voSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.voSliders[0].slider.step).to.equal('0.1');
  });

  it('should ignore step value less than or equal to 0', () => {
    document.body.innerHTML = '';
    const sliderOptions = {
      soundSliders: 'ss',
      musicSliders: 'ms',
      sfxSliders: 'sfxs',
      voSliders: 'vs',
      stepOverride: 0,
    };

    Object.keys(sliderOptions).forEach(key => {
      if (/Slider/.test(key)) {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = sliderOptions[key];
        sliderOptions[key] = slider;
        document.body.appendChild(slider);
      }
    });

    sp = new SoundPlugin(sliderOptions);
    sp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'sound-plugin-iframe';
    document.body.appendChild(iframe);

    new Container('#sound-plugin-iframe').client.trigger(
      'features'
    );

    //sliders
    expect(sp.soundSliders[0].slider.step).to.equal('0.1');

    expect(sp.musicSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.musicSliders[0].slider.step).to.equal('0.1');

    expect(sp.sfxSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.sfxSliders[0].slider.step).to.equal('0.1');

    expect(sp.voSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.voSliders[0].slider.step).to.equal('0.1');
  });

  it('should work without any controls', () => {
    sp = new SoundPlugin();
    sp.preload({ client: new Bellhop() });
    sp.init();
    sp.client.trigger('features', {});
  });

  it('should work with HTML elements as parameters', () => {
    document.body.innerHTML = '';

    Object.keys(options).forEach(key => {
      if (/Button/.test(key)) {

        const button = document.createElement('button');
        button.id = options[key];
        document.body.appendChild(button);
        options[key] = button;

      } else {

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = options[key];
        options[key] = slider;
        document.body.appendChild(slider);

      }
    });
    sp = new SoundPlugin(options);
    sp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'sound-plugin-iframe';
    document.body.appendChild(iframe);

    new Container('#sound-plugin-iframe').client.trigger(
      'features'
    );

    //buttons
    expect(sp.soundButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.soundButtons[0].button.style.display).to.equal('');
    expect(sp.soundButtons[0].button.classList.contains('disabled')).to.be.false;

    expect(sp.musicButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.musicButtons[0].button.style.display).to.equal('');
    expect(sp.musicButtons[0].button.classList.contains('disabled')).to.be.false;

    expect(sp.sfxButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.sfxButtons[0].button.style.display).to.equal('');
    expect(sp.sfxButtons[0].button.classList.contains('disabled')).to.be.false;

    expect(sp.voButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(sp.voButtons[0].button.style.display).to.equal('');
    expect(sp.voButtons[0].button.classList.contains('disabled')).to.be.false;

    //sliders
    expect(sp.soundSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.soundSliders[0].slider.style.display).to.equal('');

    expect(sp.musicSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.musicSliders[0].slider.style.display).to.equal('');

    expect(sp.sfxSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.sfxSliders[0].slider.style.display).to.equal('');

    expect(sp.voSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(sp.voSliders[0].slider.style.display).to.equal('');

  });
});
