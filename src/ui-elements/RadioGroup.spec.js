import { RadioGroup } from './RadioGroup';

// const initEvent = eventName => {
//   const event = document.createEvent('Event');
//   event.initEvent(eventName, false, true);
//   return event;
// };

describe('RadioGroup', () => {
  let rg;

  before(() => {
    document.body.innerHTML = '';

    const radioOne = document.createElement('input');
    radioOne.type = 'radio';
    radioOne.name = 'test-radios';
    radioOne.value = 'testOne';
    const radioTwo = document.createElement('input');
    radioTwo.type = 'radio';
    radioTwo.name = 'test-radios';
    radioTwo.value = 'testTwo';

    document.body.append(radioOne, radioTwo);

    rg = new RadioGroup({selector: 'input[name=test-radios]', controlName: 'test-control', featureName: 'test-feature', defaultValue: 'testtwo', pluginName: 'TestPlugin' });
  });

  it('construct', () => {
    expect(rg.radioGroup.testone).to.be.instanceOf(HTMLInputElement);
    expect(rg.radioGroup.testtwo).to.be.instanceOf(HTMLInputElement);
    expect(rg.radioGroup.testone.checked).to.be.false;
    expect(rg.radioGroup.testtwo.checked).to.be.true;
  });

  it('.hasOnly()', () => {
    expect(rg.hasOnly(['testone', 'testtwo'])).to.be.true;
    expect(rg.hasOnly(['testone', 'testtwo', 'testThree'])).to.be.true; //should still work even if there is a value that is unused
    expect(rg.hasOnly(['testone'])).to.be.false;
  });

  it('.hasDuplicateValues()', () => {
    const radioThree = document.createElement('input');
    radioThree.name = 'test-radios';
    radioThree.value = 'testtwo';

    expect(rg.hasDuplicateValues()).to.be.false;
    rg.radioGroup.testThree = radioThree;
    expect(rg.hasDuplicateValues()).to.be.true;

    delete rg.radioGroup.testThree;
  });


  it('.enableRadioEvents()', done => {
    rg.enableRadioEvents(() => {
      done();
    });

    rg.radioGroup.testone.click();
    rg.radioGroup.testtwo.click();
  });

  it('.disableRadioEvents()', done => {
    rg.enableRadioEvents(() => {
      done();
    });

    rg.disableRadioEvents(() => {
      done();
    });
    expect(rg.radioGroup.testone.click()).to.throw(Error);
  });

  it('.displayRadios()', () => {
    rg.displayRadios({'test-feature': true});
    expect(rg.radioGroup.testone.style.display).to.not.equal('none');
    expect(rg.radioGroup.testtwo.style.display).to.not.equal('none');

    rg.displayRadios({'test-feature': false});
    expect(rg.radioGroup.testone.style.display).to.equal('none');
    expect(rg.radioGroup.testtwo.style.display).to.equal('none');
  });

  it('.resetState()', () => {
    rg.radioGroup.testone.click();
    expect(rg.radioGroup.testone.checked).to.be.true;
    expect(rg.radioGroup.testtwo.checked).to.be.false;

    rg.resetState();
    expect(rg.radioGroup.testone.checked).to.be.false;
    expect(rg.radioGroup.testtwo.checked).to.be.true;
  });

  it('.length', () => {
    expect(rg.length).to.equal(2);
  });

  it('.values()', () => {
    expect(rg.values.length).to.equal(2);
    expect(rg.values[0]).to.equal('testone');
    expect(rg.values[1]).to.equal('testtwo');
  });
});
