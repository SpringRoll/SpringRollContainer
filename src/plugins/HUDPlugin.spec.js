import { Container, HUDPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

describe('HUDPlugin', () => {
  let hp;

  before(() => {
    document.body.innerHTML = '';

    const button = document.createElement('button');
    button.id = 'button';

    document.body.appendChild(button);

    hp = new HUDPlugin({ hudSelectorButton: '#button' });
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
    expect(document.querySelector('#button')).to.be.instanceof(HTMLElement);
  });

  it('onHUDToggle()', () => {
    expect(hp.positions[hp.currentPos]).to.equal('top');

    hp.hudButton.click();
    expect(hp.positions[hp.currentPos]).to.equal('bottom');

    hp.hudButton.click();
    expect(hp.positions[hp.currentPos]).to.equal('top');
  });

  it('Plugin should work without any controls', () => {
    //set up empty plugin
    hp = new HUDPlugin();
    hp.preload({ client: new Bellhop() });
    hp.init();
    hp.client.trigger('features', {});
  });
});
