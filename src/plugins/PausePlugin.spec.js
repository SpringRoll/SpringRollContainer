import { PausePlugin } from './PausePlugin';
import { Bellhop } from 'bellhop-iframe';

let pp;
before(() => {
  const button = document.createElement('button');
  document.body.innerHTML = '';
  button.id = 'test';
  document.body.appendChild(button);
  pp = new PausePlugin('#test');
  pp.preload({ client: new Bellhop() });
});
describe('PausePlugin', () => {
  it('construct', () => {
    for (let i = 0, l = pp.pauseButton.length; i < l; i++) {
      expect(pp.pauseButton[i]).to.be.instanceof(HTMLButtonElement);
      expect(pp.pauseButton[i].classList.contains('disabled')).to.be.false;
      expect(pp.pauseButton[i].style.display).to.equal('');
    }
    expect(pp.client).to.be.instanceof(Bellhop);
  });

  it('.pause() - get', () => {
    expect(pp.pause).to.be.a('boolean');
  });

  it('.pause() - set', () => {
    pp.pause = true;
    expect(pp.pause).to.be.true;
  });

  it('.onPauseToggle()', () => {
    expect(pp.pause).to.be.true;
    pp.onPauseToggle();
    expect(pp.pause).to.be.false;
  });
});
