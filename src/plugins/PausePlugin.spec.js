import { PausePlugin } from './PausePlugin';
import { Bellhop } from 'bellhop-iframe';

let pp;
before(() => {
  const button = document.createElement('button');
  document.body.innerHTML = '';
  button.id = 'test';
  document.body.appendChild(button);
  pp = new PausePlugin('#test');
});
describe('PausePlugin', () => {
  it('construct', () => {
    pp.pauseButton.forEach(element => {
      expect(element).to.be.instanceof(HTMLButtonElement);
    });
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

  it('.opened()', () => {
    pp.opened();
    expect(pp.pause).to.be.false;
  });

  it('.close()', () => {
    pp.close();
    expect(pp.pause).to.be.false;
  });

  it('.open()', () => {
    pp.open();
  });
  it('.close()', () => {
    pp.close();
  });
  it('.tearDown()', () => {
    pp.teardown();
  });
});
