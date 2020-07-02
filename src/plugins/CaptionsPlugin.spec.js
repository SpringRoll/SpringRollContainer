import { CaptionsPlugin } from './CaptionsPlugin';
import { Bellhop } from 'bellhop-iframe';

describe('CaptionsPlugin', () => {
  const idOne = 'button_test_one';
  const idTwo = 'button_test_two';
  let cp;

  before(() => {
    const buttonOne = document.createElement('button');
    buttonOne.id = idOne;

    const buttonTwo = document.createElement('button');
    buttonTwo.id = idTwo;

    const colorRadioOne = document.createElement('input');
    colorRadioOne.type = 'radio';
    colorRadioOne.name = 'caption-color';
    colorRadioOne.value = 'default';

    const colorRadioTwo = document.createElement('input');
    colorRadioTwo.type = 'radio';
    colorRadioTwo.name = 'caption-color';
    colorRadioTwo.value = 'inverted';

    const colorRadioThree = document.createElement('input');
    colorRadioThree.type = 'radio';
    colorRadioThree.name = 'caption-colorTwo';
    colorRadioThree.value = 'inverted';
    const colorRadioFour = document.createElement('input');
    colorRadioFour.type = 'radio';
    colorRadioFour.name = 'caption-colorTwo';
    colorRadioFour.value = 'default';

    const colorRadioFive = document.createElement('input');
    colorRadioFive.type = 'radio';
    colorRadioFive.name = 'not-tubular-colors';
    colorRadioFive.value = 'default';
    const colorRadioSix = document.createElement('input');
    colorRadioSix.type = 'radio';
    colorRadioSix.name = 'not-tubular-colors';
    colorRadioSix.value = 'not-tubular';


    const alignRadioOne = document.createElement('input');
    alignRadioOne.type = 'radio';
    alignRadioOne.name = 'caption-align';
    alignRadioOne.value = 'top';
    const alignRadioTwo = document.createElement('input');
    alignRadioTwo.type = 'radio';
    alignRadioTwo.name = 'caption-align';
    alignRadioTwo.value = 'bottom';

    const alignRadioThree = document.createElement('input');
    alignRadioThree.type = 'radio';
    alignRadioThree.name = 'caption-alignTwo';
    alignRadioThree.value = 'bottom';
    const alignRadioFour = document.createElement('input');
    alignRadioFour.type = 'radio';
    alignRadioFour.name = 'caption-alignTwo';
    alignRadioFour.value = 'top';

    const alignRadioFive = document.createElement('input');
    alignRadioFive.type = 'radio';
    alignRadioFive.name = 'bogus-align';

    const fontSizeRadioOne = document.createElement('input');
    fontSizeRadioOne.type = 'radio';
    fontSizeRadioOne.name = 'caption-fontSize';
    fontSizeRadioOne.value = 'small';
    const fontSizeRadioTwo = document.createElement('input');
    fontSizeRadioTwo.type = 'radio';
    fontSizeRadioTwo.name = 'caption-fontSize';
    fontSizeRadioTwo.value = 'medium';
    const fontSizeRadioThree = document.createElement('input');
    fontSizeRadioThree.type = 'radio';
    fontSizeRadioThree.name = 'caption-fontSize';
    fontSizeRadioThree.value = 'large';

    const fontSizeRadioFour = document.createElement('input');
    fontSizeRadioFour.type = 'radio';
    fontSizeRadioFour.name = 'caption-fontSizeTwo';
    fontSizeRadioFour.value = 'MEDIUM';
    const fontSizeRadioFive = document.createElement('input');
    fontSizeRadioFive.type = 'radio';
    fontSizeRadioFive.name = 'caption-fontSizeTwo';
    fontSizeRadioFive.value = 'lArGe';
    const fontSizeRadioSix = document.createElement('input');
    fontSizeRadioSix.type = 'radio';
    fontSizeRadioSix.name = 'caption-fontSizeTwo';
    fontSizeRadioSix.value = 'Small';

    document.body.appendChild(buttonOne);
    document.body.appendChild(buttonTwo);

    document.body.appendChild(colorRadioOne);
    document.body.appendChild(colorRadioTwo);

    document.body.appendChild(colorRadioThree);
    document.body.appendChild(colorRadioFour);

    document.body.appendChild(colorRadioFive);
    document.body.appendChild(colorRadioSix);

    document.body.appendChild(alignRadioOne);
    document.body.appendChild(alignRadioTwo);
    document.body.appendChild(alignRadioThree);
    document.body.appendChild(alignRadioFour);
    document.body.appendChild(alignRadioFive);

    document.body.appendChild(fontSizeRadioOne);
    document.body.appendChild(fontSizeRadioTwo);
    document.body.appendChild(fontSizeRadioThree);

    document.body.appendChild(fontSizeRadioFour);
    document.body.appendChild(fontSizeRadioFive);
    document.body.appendChild(fontSizeRadioSix);

    cp = new CaptionsPlugin({
      captionsButtons: `#${idOne}, #${idTwo}`,
      fontSizeRadios: 'input[name=caption-fontSize], input[name=caption-fontSizeTwo]',
      colorRadios: 'input[name=caption-color], input[name=caption-colorTwo], input[name=not-tubular-colors]',
      alignmentRadios: 'input[name=caption-align], input[name=caption-alignTwo], input[name=bogus-align]',
    });
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

    cp = new CaptionsPlugin({captionsButtons: buttonOne});
    cp.preload({ client: new Bellhop() });

    expect(cp.captionsMuted).to.equal(false);

    cp._captionsButtons[0].button.click();
    expect(cp.captionsMuted).to.equal(true);
    expect(cp._captionsButtons[0].button.classList.contains('muted')).to.equal(true);

  });
});
