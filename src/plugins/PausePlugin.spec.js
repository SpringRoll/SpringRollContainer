import { PausePlugin } from './PausePlugin';
import { Bellhop } from 'bellhop-iframe';

let pp;
before(() => {
  const button = document.createElement('button');
  document.body.innerHTML = '';
  button.id = 'test';
  document.body.appendChild(button);
  const buttonTwo = document.createElement('button');
  buttonTwo.id = 'testTwo';
  document.body.appendChild(buttonTwo);
  pp = new PausePlugin('#test, #testTwo');
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
    expect(pp.pauseButton[0].classList.contains('paused')).to.be.true;
    pp.onPauseToggle();
    expect(pp.pause).to.be.false;
    expect(pp.pauseButton[0].classList.contains('unpaused')).to.be.true;
  });
});
