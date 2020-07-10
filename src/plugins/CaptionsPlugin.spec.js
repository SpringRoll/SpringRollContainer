import { CaptionsPlugin } from './CaptionsPlugin';
import { Bellhop } from 'bellhop-iframe';
import { makeRadio } from '../../TestingUtils';

describe('CaptionsPlugin', () => {
  const idOne = 'button_test_one';
  const idTwo = 'button_test_two';
  let cp;

  before(() => {
    const buttonOne = document.createElement('button');
    buttonOne.id = idOne;

    const buttonTwo = document.createElement('button');
    buttonTwo.id = idTwo;

    const colorRadioOne = makeRadio('caption-color', 'default');
    const colorRadioTwo = makeRadio('caption-color', 'inverted');

    const colorRadioThree = makeRadio('caption-colorTwo', 'inverted');
    const colorRadioFour = makeRadio('caption-colorTwo', 'default');


    const colorRadioFive = makeRadio('not-tubular-colors', 'default');
    const colorRadioSix = makeRadio('not-tubular-colors', 'not-tubular');



    const alignRadioOne = makeRadio('caption-align', 'top');
    const alignRadioTwo = makeRadio('caption-align', 'bottom');

    const alignRadioThree = makeRadio('caption-alignTwo', 'bottom');
    const alignRadioFour = makeRadio('caption-alignTwo', 'top');

    const alignRadioFive = makeRadio('bogus-align', 'bogus-align');

    const fontSizeRadioOne = makeRadio('caption-fontSize', 'small');
    const fontSizeRadioTwo = makeRadio('caption-fontSize', 'medium');
    const fontSizeRadioThree = makeRadio('caption-fontSize', 'large');

    const fontSizeRadioFour = makeRadio('caption-fontSizeTwo', 'MEDIUM');
    const fontSizeRadioFive = makeRadio('caption-fontSizeTwo', 'lArGe');
    const fontSizeRadioSix = makeRadio('caption-fontSizeTwo', 'Small');

    document.body.append(buttonOne, buttonTwo, colorRadioOne, colorRadioTwo, colorRadioThree, colorRadioFour, colorRadioFive,
      colorRadioSix, alignRadioOne, alignRadioTwo, alignRadioThree, alignRadioFour, alignRadioFive, fontSizeRadioOne, fontSizeRadioTwo,
      fontSizeRadioThree, fontSizeRadioFour, fontSizeRadioFive, fontSizeRadioSix);

    cp = new CaptionsPlugin(
      `#${idOne}, #${idTwo}`,
      'input[name=caption-fontSize], input[name=caption-fontSizeTwo]',
      'input[name=caption-color], input[name=caption-colorTwo], input[name=not-tubular-colors]',
      'input[name=caption-align], input[name=caption-alignTwo], input[name=bogus-align]',
    );
    cp.preload({ client: new Bellhop() });


  });

  it('construct', () => {
    expect(cp._captionsButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(cp._captionsButtons[0].button.style.display).to.equal('');
    expect(cp._captionsButtons[0].button.classList.contains('disabled')).to.be.false;
    expect(cp.fontSizeRadios.length).to.equal(2);
    expect(cp.colorRadios.length).to.equal(2); //should skip the not-tubular group as the value is incorrect
    expect(cp.alignmentRadios.length).to.equal(2); //Should skip the bogus-align group since there is only one radio button
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

  it('.onFontSizeChange()', () => {
    expect(cp.fontSizeRadios[0].radioGroup.medium.checked).to.be.true;
    expect(cp.fontSizeRadios[1].radioGroup.medium.checked).to.be.true;
    expect(cp.getCaptionsStyles('size')).to.equal('medium');

    cp.fontSizeRadios[0].radioGroup.small.click();

    expect(cp.fontSizeRadios[0].radioGroup.small.checked).to.be.true;
    expect(cp.fontSizeRadios[1].radioGroup.small.checked).to.be.true;
    expect(cp.getCaptionsStyles('size')).to.equal('small');

    cp.fontSizeRadios[1].radioGroup.large.click();

    expect(cp.fontSizeRadios[0].radioGroup.large.checked).to.be.true;
    expect(cp.fontSizeRadios[1].radioGroup.large.checked).to.be.true;
    expect(cp.getCaptionsStyles('size')).to.equal('large');
  });

  it('.onAlignmentChange()', () => {
    expect(cp.alignmentRadios[0].radioGroup.top.checked).to.be.true;
    expect(cp.alignmentRadios[1].radioGroup.top.checked).to.be.true;
    expect(cp.getCaptionsStyles('align')).to.equal('top');

    cp.alignmentRadios[0].radioGroup.bottom.click();

    expect(cp.alignmentRadios[0].radioGroup.bottom.checked).to.be.true;
    expect(cp.alignmentRadios[1].radioGroup.bottom.checked).to.be.true;
    expect(cp.getCaptionsStyles('align')).to.equal('bottom');

    cp.alignmentRadios[1].radioGroup.top.click();

    expect(cp.alignmentRadios[0].radioGroup.top.checked).to.be.true;
    expect(cp.alignmentRadios[1].radioGroup.top.checked).to.be.true;
    expect(cp.getCaptionsStyles('align')).to.equal('top');
  });

  it('.onColorChange()', () => {
    expect(cp.colorRadios[0].radioGroup.default.checked).to.be.true;
    expect(cp.colorRadios[1].radioGroup.default.checked).to.be.true;
    expect(cp.getCaptionsStyles('background')).to.equal('black');
    expect(cp.getCaptionsStyles('color')).to.equal('white');

    cp.colorRadios[0].radioGroup.inverted.click();

    expect(cp.colorRadios[0].radioGroup.inverted.checked).to.be.true;
    expect(cp.colorRadios[1].radioGroup.inverted.checked).to.be.true;
    expect(cp.getCaptionsStyles('background')).to.equal('white');
    expect(cp.getCaptionsStyles('color')).to.equal('black');

    cp.colorRadios[1].radioGroup.default.click();

    expect(cp.colorRadios[0].radioGroup.default.checked).to.be.true;
    expect(cp.colorRadios[1].radioGroup.default.checked).to.be.true;
    expect(cp.getCaptionsStyles('background')).to.equal('black');
    expect(cp.getCaptionsStyles('color')).to.equal('white');
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
    //Does not include radio buttons as they only accept strings
    const buttonOne = document.createElement('button');
    buttonOne.id = idOne;
    document.body.appendChild(buttonOne);

    cp = new CaptionsPlugin(buttonOne);
    cp.preload({ client: new Bellhop() });

    expect(cp.captionsMuted).to.equal(false);

    cp._captionsButtons[0].button.click();
    expect(cp.captionsMuted).to.equal(true);
    expect(cp._captionsButtons[0].button.classList.contains('muted')).to.equal(true);

  });
});
