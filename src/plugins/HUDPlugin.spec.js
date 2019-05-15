import { Container, HUDPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

describe('HUDPlugin', () => {
  let hp;

  before(() => {
    document.body.innerHTML = '';

    const radioOne = document.createElement('input');
    radioOne.id = 'r1';
    radioOne.name = 'hrb';
    radioOne.type = 'radio';
    radioOne.value = 'top';
    const radioTwo = document.createElement('input');
    radioTwo.id = 'r2';
    radioTwo.name = 'hrb';
    radioTwo.type = 'radio';
    radioTwo.value = 'bottom';
    const radioThree = document.createElement('input');
    radioThree.id = 'r3';
    radioThree.name = 'hrb';
    radioThree.type = 'radio';
    radioThree.value = 'left';

    document.body.appendChild(radioOne);
    document.body.appendChild(radioTwo);
    document.body.appendChild(radioThree);

    hp = new HUDPlugin({ positions: 'hrb' });
    hp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'hud-plugin-iframe';
    document.body.appendChild(iframe);
    expect(hp.positionControls[1]).to.be.instanceof(HTMLInputElement);
    new Container('#hud-plugin-iframe').client.trigger('features');
  });

  it('onHUDToggle()', () => {
    hp.positionControls[0].click();
    expect(hp.positionControls[0].checked).to.be.true;
    expect(hp.positionControls[1].checked).to.be.false;
    expect(hp.positionControls[2].checked).to.be.false;

    hp.positionControls[1].click();
    expect(hp.positionControls[0].checked).to.be.false;
    expect(hp.positionControls[1].checked).to.be.true;
    expect(hp.positionControls[2].checked).to.be.false;

    hp.positionControls[2].click();
    expect(hp.positionControls[0].checked).to.be.false;
    expect(hp.positionControls[1].checked).to.be.false;
    expect(hp.positionControls[2].checked).to.be.true;
  });
});
