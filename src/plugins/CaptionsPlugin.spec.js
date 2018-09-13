import { CaptionsPlugin } from './CaptionsPlugin';
import { Bellhop } from 'bellhop-iframe';

const id = 'test';
let cp;

before(() => {
  const button = document.createElement('button');
  document.body.innerHTML = '';
  button.id = id;
  document.body.appendChild(button);
  cp = new CaptionsPlugin({
    client: new Bellhop(),
    options: { captionButton: `#${id}` }
  });
});
describe('CaptionsPlugin', () => {
  it('construct', () => {
    expect(cp.client).to.be.instanceof(Bellhop);
    expect(cp.captionsButton).to.be.instanceof(HTMLButtonElement);
  });
  it('On click', () => {
    const test = cp.captionsMuted;
    cp.captionsButton.click();
    expect(cp.captionsMuted).to.not.equal(test);
  });
  it('.setCaptionsStyles()', () => {
    cp.setCaptionsStyles({ font: 'comic-sans' });
    expect(cp.captionsStyles.font).to.equal('comic-sans');
  });
  it('.clearCaptionStyles()', () => {
    expect(cp.captionsStyles.font).to.equal('comic-sans');
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
