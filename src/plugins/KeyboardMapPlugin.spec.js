import { Container, KeyboardMapPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

describe('KeyboardMapPlugin', () => {
  let kmp;

  before(() => {
    document.body.innerHTML = '';

    const keyContainerOne = document.createElement('div');
    keyContainerOne.id = 'keyContainerOne';
    const keyContainerTwo = document.createElement('div');
    keyContainerTwo.id = 'keyContainerTwo';

    document.body.append(keyContainerOne, keyContainerTwo);

    kmp = new KeyboardMapPlugin('#keyContainerOne, #keyContainerTwo');
    kmp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'controls-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#controls-plugin-iframe', { plugins: [kmp] });
    kmp.init();
    kmp.client.trigger('features', {
      keyBinding: true
    });
    kmp.client.trigger('keyBindings', [
      { actionName: 'Up', defaultKey: 'w' },
      { actionName: 'Down', defaultKey: 's' }
    ]);

    expect(kmp.buttons[0].length).to.equal(2);
    expect(kmp.buttons[1].length).to.equal(2);
  });

  it('.onKeyButtonClick()', () => {
    const event = document.createEvent('Event');
    event.key = 'a';
    event.initEvent('keyup');

    expect(kmp.keyBindings.Up.currentKey).to.equal('w');
    kmp.buttons[0][0].click();
    document.dispatchEvent(event);
    expect(kmp.keyBindings.Up.currentKey).to.equal('a');

    expect(kmp.keyBindings.Down.currentKey).to.equal('s');
    kmp.buttons[1][1].click();
    event.key = 'h';
    document.dispatchEvent(event);
    expect(kmp.keyBindings.Down.currentKey).to.equal('h');

    expect(kmp.buttons[0][0].textContent).to.equal('a');
    expect(kmp.buttons[1][0].textContent).to.equal('a');
    expect(kmp.buttons[0][1].textContent).to.equal('h');
    expect(kmp.buttons[1][1].textContent).to.equal('h');
  });

  it('should work without any controls', () => {
    //set up empty plugin
    kmp = new KeyboardMapPlugin();
    kmp.preload({ client: new Bellhop() });
    kmp.init();
    kmp.client.trigger('features', {});
  });

  it('should work with an HTMLElement as parameters', () => {
    //Plugin re-setup
    document.body.innerHTML = '';

    const keyContainerOne = document.createElement('div');
    keyContainerOne.id = 'keyContainerOne';

    document.body.appendChild(keyContainerOne);

    kmp = new KeyboardMapPlugin(keyContainerOne);
    kmp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'controls-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#controls-plugin-iframe', {plugins: [kmp] });
    kmp.init();
    kmp.client.trigger('features', {
      keyBinding: true
    });
    kmp.client.trigger('keyBindings', [
      { actionName: 'Up', defaultKey: 'w' },
      { actionName: 'Down', defaultKey: 's' }
    ]);

    const event = document.createEvent('Event');
    event.key = 'a';
    event.initEvent('keyup');

    expect(kmp.keyBindings.Up.currentKey).to.equal('w');
    kmp.buttons[0][0].click();
    document.dispatchEvent(event);
    expect(kmp.keyBindings.Up.currentKey).to.equal('a');
  });
});
