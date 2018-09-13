import { ButtonPlugin } from './ButtonPlugin';
import { Bellhop } from 'bellhop-iframe';

const clearClassList = element =>
  element.classList.forEach(cssClass => element.classList.remove(cssClass));

describe('ButtonPlugin', () => {
  let bp;
  const button = document.createElement('button');
  beforeEach(() => {
    clearClassList(button);
  });

  it('construct', () => {
    bp = new ButtonPlugin({ client: new Bellhop() }, 99);
    expect(bp).to.be.instanceof(ButtonPlugin);
    expect(bp.priority).to.equal(99);
    expect(bp.sendMutes).to.be.false;
    expect(bp.client).to.be.instanceof(Bellhop);
  });

  it('.setup()', () => {
    bp.setup();
    expect(bp.sendMutes).to.be.true;
  });

  it('._disableButton()', () => {
    expect(button.classList[0]).to.be.undefined;
    bp._disableButton(button);
    expect(button.classList[0]).to.equal('disabled');
  });

  it('.removeListeners', () => {
    bp.removeListeners(button);
    expect(button.classList.contains('muted')).to.be.true;
  });

  it('._setMuteProp', () => {
    const tasks = [
      () => bp._setMuteProp('ButtonPlugin', button),
      () => bp._setMuteProp('ButtonPlugin', [button])
    ];

    tasks.forEach(task => {
      clearClassList(button);
      expect(button.classList.length).to.equal(0);
      task();
      expect(button.classList[0]).to.equal('muted');
    });
  });

  it('.reset(), .teardown()', () => {
    expect(bp.sendMutes).to.be.true;
    bp.teardown();
    expect(bp.sendMutes).to.be.false;
  });
});
