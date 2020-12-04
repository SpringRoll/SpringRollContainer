import { Container, FullScreenPlugin } from '../index';
import { makeButton } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

describe('FullScreenPlugin', () => {
  
  let fs;

  before(() => {
    document.body.innerHTML = '';
    const toggleButton = makeButton('toggleButton');
    document.body.append(toggleButton);
    
    fs = new FullScreenPlugin('#fullscreen-plugin-iframe', '#toggleButton');
    fs.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('div');

    iframe.id = 'fullscreen-plugin-iframe';
    iframe.setAttribute('allow', 'fullscreen');

    document.body.appendChild(iframe);

    new Container('#fullscreen-plugin-iframe', {plugins: [fs]}).client.trigger(
      'features'
    );

  });

  it('.toggleFullScreen()', () => {
  });


  it('Plugin should work without any controls', () => {
    //set up empty plugin
    fs = new FullScreenPlugin();
    fs.preload({ client: new Bellhop() });
    fs.init();
    fs.client.trigger('features', {});
  });

  it('Plugin should work with HTMLElement as parameter', () => {
    const buttonOne = makeButton('toggleButton');
    document.body.appendChild(buttonOne);

    fs = new FullScreenPlugin('#fullscreen-plugin-iframe', buttonOne);
    fs.preload({ client: new Bellhop() });

  });
  it('Plugin should respond to the click event', () => {
    const buttonOne = makeButton('toggleButton');
    document.body.appendChild(buttonOne);

    fs = new FullScreenPlugin('#fullscreen-plugin-iframe', buttonOne);
    fs.preload({ client: new Bellhop() });

    buttonOne.click();


  });
});