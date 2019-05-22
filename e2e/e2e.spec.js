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
  LayersSliderPlugin,
  HUDPlugin
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

  const soundSlider = document.createElement('input');
  const voSlider = document.createElement('input');
  const sfxSlider = document.createElement('input');
  const musicSlider = document.createElement('input');

  const sensitivitySlider = document.createElement('input');
  const pointerSlider = document.createElement('input');
  const buttonSlider = document.createElement('input');
  const layersForm = document.createElement('form');
  const layersCB1 = document.createElement('input');
  const layersCB2 = document.createElement('input');
  const layersSlider = document.createElement('input');
  const hudRBOne = document.createElement('input');
  const hudRBTwo = document.createElement('input');

  before(() => {
    voButton.id = 'voButton';
    helpButton.id = 'helpButton';
    captionsButton.id = 'captionsButton';
    musicButton.id = 'musicButton';
    pauseButton.id = 'pauseButton';
    sfxButton.id = 'sfxButton';
    soundButton.id = 'soundButton';

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

    layersForm.id = 'layersForm';
    layersCB1.id = 'cb1';
    layersCB1.type = 'checkbox';
    layersCB1.name = 'layer';
    layersCB1.value = 'layer1';
    layersCB2.id = 'cb2';
    layersCB2.type = 'checkbox';
    layersCB2.name = 'layer';
    layersCB2.value = 'layer2';

    hudRBOne.id = 'rb1';
    hudRBOne.type = 'radio';
    hudRBOne.name = 'hudButtons';
    hudRBOne.value = 'top';
    hudRBTwo.id = 'rb2';
    hudRBTwo.type = 'radio';
    hudRBTwo.name = 'hudButtons';
    hudRBTwo.value = 'bottom';

    layersForm.appendChild(layersCB1);
    layersForm.appendChild(layersCB2);
    document.body.appendChild(layersForm);

    document.body.appendChild(voButton);
    document.body.appendChild(helpButton);
    document.body.appendChild(captionsButton);
    document.body.appendChild(musicButton);
    document.body.appendChild(pauseButton);
    document.body.appendChild(sfxButton);
    document.body.appendChild(soundButton);

    document.body.appendChild(soundSlider);
    document.body.appendChild(voSlider);
    document.body.appendChild(musicSlider);
    document.body.appendChild(sfxSlider);
    document.body.appendChild(sensitivitySlider);
    document.body.appendChild(pointerSlider);
    document.body.appendChild(buttonSlider);
    document.body.appendChild(layersSlider);

    document.body.appendChild(hudRBOne);
    document.body.appendChild(hudRBTwo);

    container = new Container('.karma-html');
  });

  it('setup the container and all it\'s plugins', () => {
    container.uses(new CaptionsPlugin('#captionsButton'));
    container.uses(new PausePlugin('#pauseButton'));
    container.uses(
      new SoundPlugin({
        voButton: '#voButton',
        musicButton: '#musicButton',
        sfxButton: '#sfxButton',
        soundButton: '#soundButton',
        soundSlider: '#soundSlider',
        musicSlider: '#musicSlider',
        voSlider: '#voSlider',
        sfxSlider: '#sfxSlider'
      })
    );
    container.uses(new UserDataPlugin());
    container.uses(new HelpPlugin('#helpButton'));
    container.uses(
      new ControlsPlugin({ sensitivitySlider: '#sensitivitySlider' })
    );
    container.uses(
      new UISizePlugin({
        pointerSlider: '#pointerSlider',
        buttonSlider: '#buttonSlider'
      })
    );
    container.uses(new LayersPlugin({ layersCheckBoxes: '#layersForm' }));
    container.uses(
      new LayersSliderPlugin({ layerSlider: '#layersSlider', num: 6 })
    );
    container.uses(new HUDPlugin({ positions: 'hudButtons' }));
    container.initClient();
    container.setupPlugins();
  });
  it('Check all button click events', () => {
    voButton.click();
    helpButton.click();
    captionsButton.click();
    pauseButton.click();
    soundButton.click();
    musicButton.click();
    sfxButton.click();
  });

  it('Check the sound slider events', () => {
    soundSlider.value = 0.5;
    soundSlider.dispatchEvent(initEvent('change'));
    musicSlider.value = 0.5;
    musicSlider.dispatchEvent(initEvent('change'));
    sfxSlider.value = 0.5;
    sfxSlider.dispatchEvent(initEvent('change'));
    voSlider.value = 0.5;
    voSlider.dispatchEvent(initEvent('change'));
  });

  it('check the slider change events', () => {
    sensitivitySlider.value = 0.1;
    sensitivitySlider.dispatchEvent(initEvent('change'));
    pointerSlider.value = 0.2;
    pointerSlider.dispatchEvent(initEvent('change'));
    buttonSlider.value = 0.3;
    buttonSlider.dispatchEvent(initEvent('change'));
    layersSlider.value = 0.4;
    layersSlider.dispatchEvent(initEvent('change'));
  });

  it('check the layers checkboxes', () => {
    layersCB1.click();
    layersCB2.click();
  });

  it('check the HUD radio buttons', () => {
    hudRBOne.click();
    hudRBTwo.click();
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
