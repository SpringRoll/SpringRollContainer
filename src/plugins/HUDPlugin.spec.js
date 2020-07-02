import { Container, HUDPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

describe('HUDPlugin', () => {
  let hp;

  before(() => {
    document.body.innerHTML = '';

    const topOne = document.createElement('input');
    topOne.type = 'radio';
    topOne.name = 'hud-position-one';
    topOne.value = 'top';
    const bottomOne = document.createElement('input');
    bottomOne.type = 'radio';
    bottomOne.name = 'hud-position-one';
    bottomOne.value = 'bottom';
    const rightOne = document.createElement('input');
    rightOne.type = 'radio';
    rightOne.name = 'hud-position-one';
    rightOne.value = 'right';
    const leftOne = document.createElement('input');
    leftOne.type = 'radio';
    leftOne.name = 'hud-position-one';
    leftOne.value = 'left';

    const topTwo = document.createElement('input');
    topTwo.type = 'radio';
    topTwo.name = 'hud-position-two';
    topTwo.value = 'top';
    const bottomTwo = document.createElement('input');
    bottomTwo.type = 'radio';
    bottomTwo.name = 'hud-position-two';
    bottomTwo.value = 'bottom';
    const rightTwo = document.createElement('input');
    rightTwo.type = 'radio';
    rightTwo.name = 'hud-position-two';
    rightTwo.value = 'right';
    const leftTwo = document.createElement('input');
    leftTwo.type = 'radio';
    leftTwo.name = 'hud-position-two';
    leftTwo.value = 'left';

    document.body.append(topOne, bottomOne, rightOne, leftOne, topTwo, bottomTwo, rightTwo, leftTwo);

    hp = new HUDPlugin('input[name=hud-position-one], input[name=hud-position-two]');
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
    expect(hp.hudRadios[0].radioGroup.top).to.be.instanceof(HTMLElement);
    expect(hp.hudRadios[1].radioGroup.top).to.be.instanceof(HTMLElement);
    expect(hp.hudRadios[0].radioGroup.bottom).to.be.instanceof(HTMLElement);
    expect(hp.hudRadios[1].radioGroup.bottom).to.be.instanceof(HTMLElement);

    expect(hp.hudRadios[0].radioGroup.left.style.display).to.equal('none');
    expect(hp.hudRadios[0].radioGroup.right.style.display).to.equal('none');
    expect(hp.hudRadios[1].radioGroup.left.style.display).to.equal('none');
    expect(hp.hudRadios[1].radioGroup.right.style.display).to.equal('none');
  });

  it('onHUDSelect()', () => {
    expect(hp.currentValue).to.equal('top');
    expect(hp.hudRadios[0].radioGroup.top.checked).to.be.true;
    expect(hp.hudRadios[1].radioGroup.top.checked).to.be.true;

    hp.hudRadios[0].radioGroup.bottom.click();

    expect(hp.currentValue).to.equal('bottom');
    expect(hp.hudRadios[0].radioGroup.bottom.checked).to.be.true;
    expect(hp.hudRadios[1].radioGroup.bottom.checked).to.be.true;

    hp.hudRadios[1].radioGroup.top.click();

    expect(hp.currentValue).to.equal('top');
    expect(hp.hudRadios[0].radioGroup.top.checked).to.be.true;
    expect(hp.hudRadios[1].radioGroup.top.checked).to.be.true;

    //if a hidden control is clicked it shouldn't update the current value
    hp.hudRadios[1].radioGroup.left.click();
    expect(hp.currentValue).to.equal('top');
    expect(hp.hudRadios[0].radioGroup.top.checked).to.be.true;
    expect(hp.hudRadios[1].radioGroup.top.checked).to.be.true;

  });

  it('Plugin should work without any controls', () => {
    //set up empty plugin
    hp = new HUDPlugin();
    hp.preload({ client: new Bellhop() });
    hp.init();
    hp.client.trigger('features', {});
  });

});
