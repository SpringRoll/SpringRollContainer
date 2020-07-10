import { Container, ColorVisionPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';
import { makeRadio } from '../../TestingUtils';

describe('ColorVisionPlugin', () => {
  let cvp;

  before(() => {
    document.body.innerHTML = '';

    const deuteranopiaOne = makeRadio('color-vision-one', 'deuteranopia');
    const tritanopiaOne = makeRadio('color-vision-one', 'tritanopia');
    const protanopiaOne = makeRadio('color-vision-one', 'protanopia');
    const achromatopsiaOne = makeRadio('color-vision-one', 'achromatopsia');
    const noneOne = makeRadio('color-vision-one', 'none');

    const deuteranopiaTwo = makeRadio('color-vision-two', 'deuteranopia');
    const tritanopiaTwo = makeRadio('color-vision-two', 'tritanopia');
    const protanopiaTwo = makeRadio('color-vision-two', 'protanopia');
    const achromatopsiaTwo = makeRadio('color-vision-two', 'achromatopsia');
    const noneTwo = makeRadio('color-vision-two', 'none');

    document.body.append(deuteranopiaOne, tritanopiaOne, protanopiaOne, achromatopsiaOne, noneOne, deuteranopiaTwo, tritanopiaTwo, protanopiaTwo, achromatopsiaTwo, noneTwo);

    cvp = new ColorVisionPlugin('input[name=color-vision-one], input[name=color-vision-two]');
    cvp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'color-filter-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#color-filter-plugin-iframe', {
      plugins: [cvp]
    });
    cvp.init();
    cvp.client.trigger('features', {
      colorVision: true
    });
    cvp.client.trigger('colorFilters', [
      'None',
      'Deuteranopia',
      'Tritanopia',
      'invalid'
    ]);

    expect(cvp.colors.length).to.equal(3); //discard the 'invalid'
    console.log(cvp.radioGroups[0].radioGroup);
    expect(cvp.radioGroups[0].radioGroup.achromatopsia.style.display).to.equal('none');
    expect(cvp.radioGroups[0].radioGroup.protanopia.style.display).to.equal('none');
    expect(cvp.radioGroups[1].radioGroup.achromatopsia.style.display).to.equal('none');
    expect(cvp.radioGroups[1].radioGroup.protanopia.style.display).to.equal('none');
  });

  it('.onColorChange()', () => {
    expect(cvp.currentValue).to.equal('none');
    expect(cvp.radioGroups[0].radioGroup.none.checked).to.be.true;
    expect(cvp.radioGroups[1].radioGroup.none.checked).to.be.true;

    cvp.radioGroups[0].radioGroup.tritanopia.click();

    expect(cvp.currentValue).to.equal('tritanopia');
    expect(cvp.radioGroups[0].radioGroup.tritanopia.checked).to.be.true;
    expect(cvp.radioGroups[1].radioGroup.tritanopia.checked).to.be.true;

    cvp.radioGroups[1].radioGroup.deuteranopia.click();

    expect(cvp.currentValue).to.equal('deuteranopia');
    expect(cvp.radioGroups[0].radioGroup.deuteranopia.checked).to.be.true;
    expect(cvp.radioGroups[1].radioGroup.deuteranopia.checked).to.be.true;

    //if a hidden control is clicked it shouldn't update the current value
    cvp.radioGroups[1].radioGroup.achromatopsia.click();
    expect(cvp.currentValue).to.equal('deuteranopia');
    expect(cvp.radioGroups[0].radioGroup.deuteranopia.checked).to.be.true;
    expect(cvp.radioGroups[1].radioGroup.deuteranopia.checked).to.be.true;
  });

  it('should work without any controls', () => {
    //set up empty plugin
    cvp = new ColorVisionPlugin();
    cvp.preload({ client: new Bellhop() });
    new Container('#color-filter-plugin-iframe', {
      plugins: [cvp]
    });
    cvp.init();
    cvp.client.trigger('features', {});
  });
});
