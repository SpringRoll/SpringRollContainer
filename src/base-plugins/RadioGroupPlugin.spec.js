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

    const invalidOne = makeRadio('invalid-group', 'invalid');

    const repeatRadioOne = makeRadio('repeat-group', 'identical');
    const repeatRadioTwo = makeRadio('repeat-group', 'indentical');

    document.body.append(topOne, bottomOne, rightOne, leftOne, invalidOne, repeatRadioOne, repeatRadioTwo);

    rgp = new RadioGroupPlugin('input[name=group-one], input[name=invalid-group], input[name=repeat-group]', 'radio-group-plugin', {
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
    new Container({ iframeSelector: '#radio-group-plugin-iframe' }).client.trigger(
      'features'
    );

    expect(rgp.radioGroups.length).to.equal(1);
    expect(rgp.initialValue).to.equal('bottom');
  });

});
