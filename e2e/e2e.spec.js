import {
  CaptionsPlugin,
  Container,
  FeaturesPlugin,
  FocusPlugin,
  HelpPlugin,
  PausePlugin,
  RemotePlugin,
  SoundPlugin,
  UserDataPlugin
} from '../src';
describe('End to End test', () => {
  let container;
  before(() => {
    const voButton = document.createElement('button');
    const helpButton = document.createElement('button');
    const captionsButton = document.createElement('button');
    const musicButton = document.createElement('button');
    const pauseButton = document.createElement('button');
    const sfxButton = document.createElement('button');
    const soundButton = document.createElement('button');
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
    Container.uses(RemotePlugin);
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
    container.client.trigger('userDataRead');
  });
});
