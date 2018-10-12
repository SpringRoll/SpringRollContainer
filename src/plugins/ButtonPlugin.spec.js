import { ButtonPlugin } from '../index';

const clearClassList = element => {
  while (element.classList.length > 0) {
    element.classList.remove(element.classList.item(0));
  }
};

describe('ButtonPlugin', () => {
  let bp;
  const button = document.createElement('button');
  beforeEach(() => {
    clearClassList(button);
  });

  it('construct', () => {
    bp = new ButtonPlugin('Test-Button');
    expect(bp).to.be.instanceof(ButtonPlugin);
    expect(bp.sendMutes).to.be.false;
  });

  it('.setup()', () => {
    bp.setup();
    expect(bp.sendMutes).to.be.true;
  });

  it('._disableButton()', () => {
    expect(button.classList[0]).to.not.be.string;
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
