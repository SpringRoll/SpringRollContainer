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
  DifficultyPlugin,
  ColorVisionPlugin
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

  const colorSelect = document.createElement('select');
  const keyContainer = document.createElement('div');

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

    colorSelect.id = 'colorSelect';
    keyContainer.id = 'keyContainer';

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
    document.body.appendChild(colorSelect);
    document.body.appendChild(keyContainer);

    const colorVisionPlugin = new ColorVisionPlugin({
      colorSelect: '#colorSelect'
    });
    const captionsPlugin = new CaptionsPlugin('#captionsButton');
    const pausePlugin = new PausePlugin('#pauseButton');
    const soundPlugin = new SoundPlugin({
      voButton: '#voButton',
      musicButton: '#musicButton',
      sfxButton: '#sfxButton',
      soundButton: '#soundButton',
      soundSlider: '#soundSlider',
      musicSlider: '#musicSlider',
      voSlider: '#voSlider',
      sfxSlider: '#sfxSlider'
    });
    const userDataPlugin = new UserDataPlugin();
    const helpPlugin = new HelpPlugin('#helpButton');
    const controlsPlugin = new ControlsPlugin({
      sensitivitySlider: '#sensitivitySlider',
      keyContainer: '#keyContainer'
    });
    const uiSizePlugin = new UISizePlugin({
      pointerSlider: '#pointerSlider',
      buttonSlider: '#buttonSlider'
    });
    const layersPlugin = new LayersPlugin({ layersSlider: '#layersSlider' });
    const hudPlugin = new HUDPlugin({ hudSelectorButton: '#hudButton' });
    const difficultyPlugin = new DifficultyPlugin({
      difficultySlider: '#difficultySlider'
    });

    container = new Container({
      iframeSelector: '.karma-html',
      plugins: [
        captionsPlugin,
        pausePlugin,
        soundPlugin,
        userDataPlugin,
        helpPlugin,
        controlsPlugin,
        uiSizePlugin,
        layersPlugin,
        hudPlugin,
        difficultyPlugin,
        colorVisionPlugin
      ]
    });

    //triggering the respond calls for plugins that require them
    colorVisionPlugin.init();
    hudPlugin.init();
    controlsPlugin.init();

    container.client.trigger('features', {
      colorVision: true,
      hudPosition: true,
      keyBinding: true
    });

    controlsPlugin.client.trigger('keyBindings', [
      { actionName: 'Up', defaultKey: 'w' }
    ]);
    hudPlugin.client.trigger('hudPositions', [
      'top',
      'bottom',
      'invalid-position'
    ]);
    colorVisionPlugin.client.trigger('colorFilters', [
      'None',
      'Deuteranopia',
      'Tritanopia',
      'invalid'
    ]);
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

  it('check the color vision dropdown event', () => {
    colorSelect.value = 'tritanopia';
    colorSelect.dispatchEvent(initEvent('change'));
  });

  it('check the key binding change event', () => {
    const event = document.createEvent('Event');
    event.key = 'a';
    event.initEvent('keyup');
    keyContainer.firstChild.click();
    document.dispatchEvent(event);
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
