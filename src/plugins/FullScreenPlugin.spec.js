import { Container, FullScreenPlugin } from '../index';
import { makeButton } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

describe('FullScreenPlugin', () => {
  let fs;
  let iframe;

  before(() => {
    document.body.innerHTML = '';
    const toggleButton = makeButton('toggleButton');
    document.body.append(toggleButton);
  });

  it('construct', () => {
    iframe = document.createElement('iframe');
    
    iframe.id = 'fullscreen-plugin-iframe';
    iframe.setAttribute('allow', 'fullscreen');
    
    document.body.appendChild(iframe);
    
    fs = new FullScreenPlugin('#toggleButton');
    
    new Container('#fullscreen-plugin-iframe', {plugins: [fs]}).client.trigger(
      'features'
    );
    
    fs.init(document.getElementById('fullscreen-plugin-iframe'));
    fs.preload({ client: new Bellhop() });

  });

  it('Plugin should work without any controls', () => {
    //set up empty plugin
    fs = new FullScreenPlugin();
    fs.preload({ client: new Bellhop() });
    fs.init(document.getElementById('fullscreen-plugin-iframe'));
    fs.client.trigger('features', {});
  });

  });
  it('Plugin should respond to the click event', () => {
    
    document.body.appendChild(iframe);
    const buttonOne = makeButton('toggleButton');
    document.body.appendChild(buttonOne);

    fs = new FullScreenPlugin('toggleButton');
    fs.preload({ client: new Bellhop() });

    fs.init(document.getElementById('fullscreen-plugin-iframe'));

    buttonOne.click();

  });
});