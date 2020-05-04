import { CaptionsPlugin } from './CaptionsPlugin';
import { Bellhop } from 'bellhop-iframe';

describe('CaptionsPlugin', () => {
  const idOne = 'button_test_one';
  const idTwo = 'button_test_two';
  let cp;

  beforeEach(() => {
    const buttonOne = document.createElement('button');
    buttonOne.id = idOne;
    document.body.appendChild(buttonOne);
    const buttonTwo = document.createElement('button');
    buttonTwo.id = idTwo;
    document.body.appendChild(buttonTwo);
    cp = new CaptionsPlugin(`#${idOne}, #${idTwo}`);
    cp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    expect(cp._captionsButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(cp._captionsButtons[0].button.style.display).to.equal('');
    expect(cp._captionsButtons[0].button.classList.contains('disabled')).to.be.false;
  });

  it('On click', () => {
    cp._captionsButtons[0].button.click();
    expect(cp.captionsMuted).to.equal(true);
    //check that the data attribute is being set correctly for both control elements
    expect(cp._captionsButtons[0].button.dataset.captionsMuted).to.equal('true');
    expect(cp._captionsButtons[1].button.dataset.captionsMuted).to.equal('true');

    cp._captionsButtons[1].button.click();
    expect(cp.captionsMuted).to.equal(false);
    expect(cp._captionsButtons[0].button.dataset.captionsMuted).to.equal('false');
    expect(cp._captionsButtons[1].button.dataset.captionsMuted).to.equal('false');
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

  it('should work without any controls', () => {
    //set up empty plugin
    cp = new CaptionsPlugin();
    cp.preload({ client: new Bellhop() });
    cp.init();
    cp.client.trigger('features', {});
  });

  it('should work with HTMLElement as parameter', () => {

    const buttonOne = document.createElement('button');
    buttonOne.id = idOne;
    document.body.appendChild(buttonOne);

    cp = new CaptionsPlugin(buttonOne);
    cp.preload({ client: new Bellhop() });

    expect(cp.captionsMuted).to.equal(false);

    cp._captionsButtons[0].button.click();
    expect(cp.captionsMuted).to.equal(true);
    expect(cp._captionsButtons[0].button.dataset.captionsMuted).to.equal('true');

  });
});
