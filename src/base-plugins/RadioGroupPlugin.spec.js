import { Container, RadioGroupPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';
import { makeRadio } from '../../TestingUtils';

describe('RadioGroupPlugin', () => {
  let rgp;

  before(() => {
    document.body.innerHTML = '';

    const topOne = makeRadio('group-one', 'top');
    const bottomOne = makeRadio('group-one', 'bottom');
    const rightOne = makeRadio('group-one', 'right');
    const leftOne = makeRadio('group-one', 'left');

    const topTwo = makeRadio('group-Two', 'top');
    const bottomTwo = makeRadio('group-Two', 'bottom');
    const rightTwo = makeRadio('group-Two', 'right');
    const leftTwo = makeRadio('group-Two', 'left');



    const invalidOne = makeRadio('invalid-group', 'invalid');

    const repeatRadioOne = makeRadio('repeat-group', 'identical');
    const repeatRadioTwo = makeRadio('repeat-group', 'indentical');

    document.body.append(topOne, bottomOne, rightOne, leftOne, invalidOne, repeatRadioOne, repeatRadioTwo, topTwo, bottomTwo, rightTwo, leftTwo,);

    rgp = new RadioGroupPlugin('input[name=group-one], input[name=invalid-group], input[name=repeat-group], input[name=group-Two]', 'radio-group-plugin', {
      supportedValues: ['top', 'bottom', 'left', 'right'],
      initialValue: 'bottom',
      controlName: 'TestControl',
      featureName: 'RadioGroupTest',
      radioCount: 4
    });
    rgp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'radio-group-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#radio-group-plugin-iframe').client.trigger(
      'features'
    );

    expect(rgp.radioGroups.length).to.equal(2);
    expect(rgp.initialValue).to.equal('bottom');
    expect(rgp.currentValue).to.equal('bottom');
  });

  it('set currentValue', () => {
    rgp.currentValue = 'invalid';
    expect(rgp.currentValue).to.equal('bottom');

    rgp.currentValue = 'top';
    expect(rgp.currentValue).to.equal('top');
  });

});
