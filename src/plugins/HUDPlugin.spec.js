import { Container, HUDPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

describe('HUDPlugin', () => {
  let hp;

  before(() => {
    document.body.innerHTML = '';

    const container = document.createElement('div');
    container.id = 'container';

    document.body.appendChild(container);

    hp = new HUDPlugin({ positionsContainer: '#container' });
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
    hp.client.trigger('hudPositions', ['top', 'bottom']);

    expect(document.querySelector('#radio-top')).to.be.instanceof(HTMLElement);
    expect(document.querySelector('#radio-bottom')).to.be.instanceof(
      HTMLElement
    );
  });

  it('onHUDToggle()', () => {
    expect(hp.currentPos).to.equal('top');

    hp.radioButtons[1].click();
    expect(hp.radioButtons[0].checked).to.be.false;
    expect(hp.radioButtons[1].checked).to.be.true;
    expect(hp.currentPos).to.equal('bottom');

    hp.radioButtons[0].click();
    expect(hp.radioButtons[0].checked).to.be.true;
    expect(hp.radioButtons[1].checked).to.be.false;
    expect(hp.currentPos).to.equal('top');
  });
});
