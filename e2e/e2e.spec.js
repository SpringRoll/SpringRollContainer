import {
  CaptionsPlugin,
  Container,
  HelpPlugin,
  PausePlugin,
  SoundPlugin,
  UserDataPlugin,
  ControlsPlugin,
  UISizePlugin,
  LayersPlugin,
  HUDPlugin,
  DifficultyPlugin
} from '../src';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('End to End Test', () => {
  let container;
  const voButton = document.createElement('button');
  const helpButton = document.createElement('button');
  const captionsButton = document.createElement('button');
  const musicButton = document.createElement('button');
  const pauseButton = document.createElement('button');
  const sfxButton = document.createElement('button');
  const soundButton = document.createElement('button');
  const hudButton = document.createElement('button');

  const soundSlider = document.createElement('input');
  const voSlider = document.createElement('input');
  const sfxSlider = document.createElement('input');
  const musicSlider = document.createElement('input');

  const sensitivitySlider = document.createElement('input');
  const pointerSlider = document.createElement('input');
  const buttonSlider = document.createElement('input');
  const layersSlider = document.createElement('input');
  const difficultySlider = document.createElement('input');

  before(() => {
    voButton.id = 'voButton';
    helpButton.id = 'helpButton';
    captionsButton.id = 'captionsButton';
    musicButton.id = 'musicButton';
    pauseButton.id = 'pauseButton';
    sfxButton.id = 'sfxButton';
    soundButton.id = 'soundButton';
    hudButton.id = 'hudButton';

    soundSlider.id = 'soundSlider';
    soundSlider.type = 'range';
    voSlider.id = 'voSlider';
    voSlider.type = 'range';
    sfxSlider.id = 'sfxSlider';
    sfxSlider.type = 'range';
    musicSlider.id = 'musicSlider';
    musicSlider.type = 'range';

    sensitivitySlider.id = 'sensitivitySlider';
    sensitivitySlider.type = 'range';
    pointerSlider.id = 'pointerSlider';
    pointerSlider.type = 'range';
    buttonSlider.id = 'buttonSlider';
    buttonSlider.type = 'range';
    layersSlider.id = 'layersSlider';
    layersSlider.type = 'range';
    difficultySlider.id = 'difficultySlider';
    difficultySlider.type = 'range';

    document.body.appendChild(voButton);
    document.body.appendChild(helpButton);
    document.body.appendChild(captionsButton);
    document.body.appendChild(musicButton);
    document.body.appendChild(pauseButton);
    document.body.appendChild(sfxButton);
    document.body.appendChild(soundButton);
    document.body.appendChild(hudButton);

    document.body.appendChild(soundSlider);
    document.body.appendChild(voSlider);
    document.body.appendChild(musicSlider);
    document.body.appendChild(sfxSlider);
    document.body.appendChild(sensitivitySlider);
    document.body.appendChild(pointerSlider);
    document.body.appendChild(buttonSlider);
    document.body.appendChild(layersSlider);
    document.body.appendChild(difficultySlider);

    container = new Container({
      iframeSelector: '.karma-html',
      plugins: [
        new CaptionsPlugin('#captionsButton'),
        new PausePlugin('#pauseButton'),
        new SoundPlugin({
          voButton: '#voButton',
          musicButton: '#musicButton',
          sfxButton: '#sfxButton',
          soundButton: '#soundButton',
          soundSlider: '#soundSlider',
          musicSlider: '#musicSlider',
          voSlider: '#voSlider',
          sfxSlider: '#sfxSlider'
        }),
        new UserDataPlugin(),
        new HelpPlugin('#helpButton'),
        new ControlsPlugin({ sensitivitySlider: '#sensitivitySlider' }),
        new UISizePlugin({
          pointerSlider: '#pointerSlider',
          buttonSlider: '#buttonSlider'
        }),
        new LayersPlugin({ layersSlider: '#layersSlider' }),
        new HUDPlugin({ hudSelectorButton: '#hudButton' }),
        new DifficultyPlugin({ difficultySlider: '#difficultySlider' })
      ]
    });
  });

  it('Check all button click events', () => {
    voButton.click();
    helpButton.click();
    captionsButton.click();
    pauseButton.click();
    soundButton.click();
    musicButton.click();
    sfxButton.click();
    hudButton.click();
  });

  it('Check the sound slider events', () => {
    soundSlider.value = String(0.5);
    soundSlider.dispatchEvent(initEvent('change'));
    musicSlider.value = String(0.5);
    musicSlider.dispatchEvent(initEvent('change'));
    sfxSlider.value = String(0.5);
    sfxSlider.dispatchEvent(initEvent('change'));
    voSlider.value = String(0.5);
    voSlider.dispatchEvent(initEvent('change'));
  });

  it('check the slider change events', () => {
    sensitivitySlider.value = String(0.1);
    sensitivitySlider.dispatchEvent(initEvent('change'));
    pointerSlider.value = String(0.2);
    pointerSlider.dispatchEvent(initEvent('change'));
    buttonSlider.value = String(0.3);
    buttonSlider.dispatchEvent(initEvent('change'));
    layersSlider.value = String(0.4);
    layersSlider.dispatchEvent(initEvent('change'));
    difficultySlider.value = String(0.5);
    difficultySlider.dispatchEvent(initEvent('change'));
  });

  it('Should open the path to the game', () => {
    container.openPath('/base/e2e/client.html');
  });

  it('check all bellhop events to make sure they are working', () => {});
  it('features', done => {
    container.client.on('features', () => {
      done();
    });
    container.client.trigger('features');
  });
  it('focus', done => {
    container.client.on('focus', () => {
      done();
    });
    container.client.trigger('focus');
  });
  it('keepFocus', done => {
    container.client.on('keepFocus', () => {
      done();
    });
    container.client.trigger('keepFocus');
  });
  it('userDataRemoved', done => {
    container.client.on('userDataRemoved', () => {
      done();
    });
    container.client.trigger('userDataRemoved');
  });
  it('userDataRead', done => {
    container.client.on('userDataRead', () => {
      done();
    });
    container.client.trigger('userDataRead');
  });
  it('userDataWrite', done => {
    container.client.on('userDataWrite', () => {
      done();
    });
    container.client.trigger('userDataWrite');
  });
});
