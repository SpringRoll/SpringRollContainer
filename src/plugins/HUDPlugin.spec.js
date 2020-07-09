import { Container, HUDPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';
import { makeRadio } from '../../TestingUtils';

describe('HUDPlugin', () => {
  let hp;

  before(() => {
    document.body.innerHTML = '';

    const topOne = makeRadio('hud-position-one', 'top');
    const bottomOne = makeRadio('hud-position-one', 'bottom');
    const rightOne = makeRadio('hud-position-one', 'right');
    const leftOne = makeRadio('hud-position-one', 'left');

    const topTwo = makeRadio('hud-position-two', 'top');
    const bottomTwo = makeRadio('hud-position-two', 'bottom');
    const rightTwo = makeRadio('hud-position-two', 'right');
    const leftTwo = makeRadio('hud-position-two', 'left');

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
    expect(hp.radioGroups[0].radioGroup.top).to.be.instanceof(HTMLElement);
    expect(hp.radioGroups[1].radioGroup.top).to.be.instanceof(HTMLElement);
    expect(hp.radioGroups[0].radioGroup.bottom).to.be.instanceof(HTMLElement);
    expect(hp.radioGroups[1].radioGroup.bottom).to.be.instanceof(HTMLElement);

    expect(hp.radioGroups[0].radioGroup.left.style.display).to.equal('none');
    expect(hp.radioGroups[0].radioGroup.right.style.display).to.equal('none');
    expect(hp.radioGroups[1].radioGroup.left.style.display).to.equal('none');
    expect(hp.radioGroups[1].radioGroup.right.style.display).to.equal('none');
  });

  it('onHUDSelect()', () => {
    expect(hp.currentValue).to.equal('top');
    expect(hp.radioGroups[0].radioGroup.top.checked).to.be.true;
    expect(hp.radioGroups[1].radioGroup.top.checked).to.be.true;

    hp.radioGroups[0].radioGroup.bottom.click();

    expect(hp.currentValue).to.equal('bottom');
    expect(hp.radioGroups[0].radioGroup.bottom.checked).to.be.true;
    expect(hp.radioGroups[1].radioGroup.bottom.checked).to.be.true;

    hp.radioGroups[1].radioGroup.top.click();

    expect(hp.currentValue).to.equal('top');
    expect(hp.radioGroups[0].radioGroup.top.checked).to.be.true;
    expect(hp.radioGroups[1].radioGroup.top.checked).to.be.true;

    //if a hidden control is clicked it shouldn't update the current value
    hp.radioGroups[1].radioGroup.left.click();
    expect(hp.currentValue).to.equal('top');
    expect(hp.radioGroups[0].radioGroup.top.checked).to.be.true;
    expect(hp.radioGroups[1].radioGroup.top.checked).to.be.true;

  });

  it('Plugin should work without any controls', () => {
    //set up empty plugin
    hp = new HUDPlugin();
    hp.preload({ client: new Bellhop() });
    hp.init();
    hp.client.trigger('features', {});
  });

});
