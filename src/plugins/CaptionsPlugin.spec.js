import { CaptionsPlugin } from './CaptionsPlugin';

describe('CaptionsPlugin', () => {
  const id = 'test';
  let cp;

  beforeEach(() => {
    const button = document.createElement('button');
    button.id = id;
    document.body.appendChild(button);
    cp = new CaptionsPlugin({ options: { captionsButton: `#${id}` } });
  });
  it('construct', () => {
    expect(cp.captionsButton).to.be.instanceof(HTMLButtonElement);
  });
  it('On click', () => {
    cp.captionsButton.click();
    expect(cp.captionsMuted).to.not.equal(test);
  });
  it('.setCaptionsStyles()', () => {
    cp.setCaptionsStyles({ font: 'comic-sans' });
    expect(cp.captionsStyles.font).to.equal('comic-sans');
  });
  it('.clearCaptionStyles()', () => {
    cp.clearCaptionsStyles();
    expect(cp.captionsStyles.font).to.equal('arial');
  });
  it('.getCaptionsStyles()', () => {
    expect(cp.getCaptionsStyles('font')).to.equal('arial');
    expect(cp.getCaptionsStyles()).to.be.instanceof(Object);
  });
  it('.opened()', () => {
    expect(cp.captionsButton).to.be.instanceof(HTMLButtonElement);
    cp.opened();
  });
  it('.teardown()', () => {
    expect(cp.captionsButton).to.be.instanceof(HTMLButtonElement);
    cp.teardown();
  });
  it('.close()', () => {
    expect(cp.captionsButton).to.be.instanceof(HTMLButtonElement);
    cp.close();
  });
});
