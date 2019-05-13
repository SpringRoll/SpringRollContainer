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
  LayersSliderPlugin
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
  const sensitivitySlider = document.createElement('input');
  const pointerSlider = document.createElement('input');
  const buttonSlider = document.createElement('input');
  const layersForm = document.createElement('form');
  const layersCB1 = document.createElement('input');
  const layersCB2 = document.createElement('input');
  const layersSlider = document.createElement('input');

  before(() => {
    voButton.id = 'voButton';
    helpButton.id = 'helpButton';
    captionsButton.id = 'captionsButton';
    musicButton.id = 'musicButton';
    pauseButton.id = 'pauseButton';
    sfxButton.id = 'sfxButton';
    soundButton.id = 'soundButton';

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
    document.body.appendChild(sensitivitySlider);
    document.body.appendChild(pointerSlider);
    document.body.appendChild(buttonSlider);
    document.body.appendChild(layersSlider);
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
        soundButton: '#soundButton'
      })
    );
    container.uses(new UserDataPlugin());
    container.uses(new HelpPlugin('#helpButton'));
    container.uses(
      new ControlsPlugin({ sensitivitySlider: '#sensitivitySlider' })
    );
    container.uses(
      new UISizePlugin({
        pointerSlider: pointerSlider,
        buttonSlider: buttonSlider
      })
    );
    container.uses(new LayersPlugin({ layersCheckBoxes: '#layersForm' }));
    container.uses(
      new LayersSliderPlugin({ layerSlider: '#layersSlider', num: 6 })
    );
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
