import {
  CaptionsPlugin,
  Container,
  FeaturesPlugin,
  FocusPlugin,
  HelpPlugin,
  PausePlugin,
  SoundPlugin,
  UserDataPlugin
} from '../src';

describe('End to End Test', () => {
  let container;
  const voButton = document.createElement('button');
  const helpButton = document.createElement('button');
  const captionsButton = document.createElement('button');
  const musicButton = document.createElement('button');
  const pauseButton = document.createElement('button');
  const sfxButton = document.createElement('button');
  const soundButton = document.createElement('button');
  before(() => {
    voButton.id = 'voButton';
    helpButton.id = 'helpButton';
    captionsButton.id = 'captionsButton';
    musicButton.id = 'musicButton';
    pauseButton.id = 'pauseButton';
    sfxButton.id = 'sfxButton';
    soundButton.id = 'soundButton';
    document.body.appendChild(voButton);
    document.body.appendChild(helpButton);
    document.body.appendChild(captionsButton);
    document.body.appendChild(musicButton);
    document.body.appendChild(pauseButton);
    document.body.appendChild(sfxButton);
    document.body.appendChild(soundButton);
  });

  it('setup the container and all it\'s plugins', () => {
    Container.uses(CaptionsPlugin);
    Container.uses(FeaturesPlugin);
    Container.uses(FocusPlugin);
    Container.uses(PausePlugin);
    Container.uses(SoundPlugin);
    Container.uses(UserDataPlugin);
    Container.uses(HelpPlugin);
    container = new Container('.karma-html', {
      voButton: '#voButton',
      helpButton: '#helpButton',
      captionsButton: '#captionsButton',
      musicButton: '#musicButton',
      pauseButton: '#pauseButton',
      sfxButton: '#sfxButton',
      soundButton: '#soundButton'
    });
    container.initClient();
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
