import { CaptionsTogglePlugin } from './CaptionsTogglePlugin';
import { Bellhop } from 'bellhop-iframe';
import { makeButton } from '../../TestingUtils';

describe('CaptionsTogglePlugin', () => {
  let cp;

  before(() => {
    const buttonOne = makeButton('button_test_one');
    const buttonTwo = makeButton('button_test_two');

    document.body.append(buttonOne, buttonTwo);

    cp = new CaptionsTogglePlugin('#button_test_one, #button_test_two');
    cp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    expect(cp._captionsButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(cp._captionsButtons[0].button.style.display).to.equal('');
    expect(cp._captionsButtons[0].button.classList.contains('disabled')).to.be.false;
  });

  it('.captionsButtonClick()', () => {
    cp._captionsButtons[0].button.click();
    expect(cp.captionsMuted).to.equal(true);
    //check that the data attribute is being set correctly for both control elements
    expect(cp._captionsButtons[0].button.classList.contains('muted')).to.equal(true);
    expect(cp._captionsButtons[1].button.classList.contains('muted')).to.equal(true);

    cp._captionsButtons[1].button.click();
    expect(cp.captionsMuted).to.equal(false);
    expect(cp._captionsButtons[0].button.classList.contains('unmuted')).to.equal(true);
    expect(cp._captionsButtons[1].button.classList.contains('unmuted')).to.equal(true);
  });

  it('should work without any controls', () => {
    //set up empty plugin
    cp = new CaptionsTogglePlugin();
    cp.preload({ client: new Bellhop() });
    cp.init();
    cp.client.trigger('features', {});
  });

  it('should work with HTMLElement as parameter', () => {
    //Does not include radio buttons as they only accept strings
    const buttonOne = makeButton('#button_test_one');
    document.body.appendChild(buttonOne);

    cp = new CaptionsTogglePlugin(buttonOne);
    cp.preload({ client: new Bellhop() });

    expect(cp.captionsMuted).to.equal(false);

    cp._captionsButtons[0].button.click();
    expect(cp.captionsMuted).to.equal(true);
    expect(cp._captionsButtons[0].button.classList.contains('muted')).to.equal(true);
  });
});
