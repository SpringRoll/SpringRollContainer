import { Container, HUDPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

describe('HUDPlugin', () => {
  let hp;

  before(() => {
    document.body.innerHTML = '';

    const buttonOne = document.createElement('button');
    buttonOne.id = 'buttonOne';
    document.body.appendChild(buttonOne);
    const buttonTwo = document.createElement('button');
    buttonTwo.id = 'buttonTwo';
    document.body.appendChild(buttonTwo);

    hp = new HUDPlugin({ hudSelectorButtons: '#buttonOne, #buttonTwo' });
    hp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'hud-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({
      iframeSelector: '#hud-plugin-iframe',
      plugins: [hp]
    });
    hp.init();
    hp.client.trigger('features', { hudPosition: true });
    hp.client.trigger('hudPositions', ['top', 'bottom', 'invalid-position']);

    expect(hp.positions.length).to.equal(2); //should discard the 'invalid-position'
    expect(hp._hudButtons[0].button).to.be.instanceof(HTMLElement);
    expect(hp._hudButtons[1].button).to.be.instanceof(HTMLElement);
  });

  it('onHUDToggle()', () => {
    expect(hp.positions[hp.currentPos]).to.equal('top');

    hp._hudButtons[0].button.click();
    expect(hp.positions[hp.currentPos]).to.equal('bottom');
    expect(hp._hudButtons[0].button.dataset['hudPosition']).to.equal('bottom');
    expect(hp._hudButtons[1].button.dataset['hudPosition']).to.equal('bottom');

    hp._hudButtons[1].button.click();
    expect(hp.positions[hp.currentPos]).to.equal('top');
    expect(hp._hudButtons[0].button.dataset['hudPosition']).to.equal('top');
    expect(hp._hudButtons[1].button.dataset['hudPosition']).to.equal('top');
  });

  it('Plugin should work without any controls', () => {
    //set up empty plugin
    hp = new HUDPlugin();
    hp.preload({ client: new Bellhop() });
    hp.init();
    hp.client.trigger('features', {});
  });

  it('should work with HTMLElement as parameter', () => {
    const button = document.createElement('button');
    button.id = 'button';
    document.body.appendChild(button);

    hp = new HUDPlugin({ hudSelectorButtons: button });
    hp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'hud-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({
      iframeSelector: '#hud-plugin-iframe',
      plugins: [hp]
    });
    hp.init();
    hp.client.trigger('features', { hudPosition: true });
    hp.client.trigger('hudPositions', ['top', 'bottom', 'invalid-position']);

    expect(hp.positions[hp.currentPos]).to.equal('top');

    hp._hudButtons[0].button.click();
    expect(hp.positions[hp.currentPos]).to.equal('bottom');
    expect(hp._hudButtons[0].button.dataset['hudPosition']).to.equal('bottom');
  });
});
