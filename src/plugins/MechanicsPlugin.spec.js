import { Container, MechanicsPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('MechanicsPlugin', () => {
  let mp;
  const options = {
    hitAreaScaleSliders: 'hass',
    dragThresholdScaleSliders: 'dtss',
    healthSliders: 'hs',
    objectCountSliders: 'ocs',
    completionPercentageSliders: 'cps',
    speedScaleSliders: 'sss',
    timersScaleSliders: 'tss',
    inputCountSliders: 'ics'
  };

  before(() => {
    document.body.innerHTML = '';
    Object.keys(options).forEach(key => {
      const sliderOne = document.createElement('input');
      const sliderTwo = document.createElement('input');
      sliderOne.type = 'range';
      sliderTwo.type = 'range';
      sliderOne.id = `${options[key]}One`;
      sliderTwo.id = `${options[key]}Two`;

      document.body.appendChild(sliderOne);
      document.body.appendChild(sliderTwo);

      options[key] = `#${options[key]}One, #${options[key]}Two`;
    });

    mp = new MechanicsPlugin(options);
    mp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#difficulty-plugin-iframe').client.trigger(
      'features'
    );
  });

  it('.onHitAreaScaleChange()', () => {
    mp.sliders.hitAreaScaleSliders[0].value = 1;
    mp.sliders.hitAreaScaleSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.hitAreaScaleSliders[0].value).to.equal('1');
    expect(mp.sliders.hitAreaScaleSliders[1].value).to.equal('1');
    expect(mp.values.hitAreaScale).to.equal(1);

    mp.sliders.hitAreaScaleSliders[0].value = 0;
    mp.sliders.hitAreaScaleSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.hitAreaScaleSliders[0].value).to.equal('0');
    expect(mp.sliders.hitAreaScaleSliders[1].value).to.equal('0');
    expect(mp.values.hitAreaScale).to.equal(0);

    mp.sliders.hitAreaScaleSliders[1].value = 1.1;
    mp.sliders.hitAreaScaleSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.hitAreaScaleSliders[0].value).to.equal('1');
    expect(mp.sliders.hitAreaScaleSliders[1].value).to.equal('1');
    expect(mp.values.hitAreaScale).to.equal(1);

    mp.sliders.hitAreaScaleSliders[1].value = -1;
    mp.sliders.hitAreaScaleSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.hitAreaScaleSliders[0].value).to.equal('0');
    expect(mp.sliders.hitAreaScaleSliders[1].value).to.equal('0');
    expect(mp.values.hitAreaScale).to.equal(0);
  });

  it('.onDragThresholdScaleChange()', () => {
    mp.sliders.dragThresholdScaleSliders[0].value = 1;
    mp.sliders.dragThresholdScaleSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.dragThresholdScaleSliders[0].value).to.equal('1');
    expect(mp.sliders.dragThresholdScaleSliders[1].value).to.equal('1');
    expect(mp.values.dragThresholdScale).to.equal(1);

    mp.sliders.dragThresholdScaleSliders[0].value = 0;
    mp.sliders.dragThresholdScaleSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.dragThresholdScaleSliders[0].value).to.equal('0');
    expect(mp.sliders.dragThresholdScaleSliders[1].value).to.equal('0');
    expect(mp.values.dragThresholdScale).to.equal(0);

    mp.sliders.dragThresholdScaleSliders[1].value = 1.1;
    mp.sliders.dragThresholdScaleSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.dragThresholdScaleSliders[0].value).to.equal('1');
    expect(mp.sliders.dragThresholdScaleSliders[1].value).to.equal('1');
    expect(mp.values.dragThresholdScale).to.equal(1);

    mp.sliders.dragThresholdScaleSliders[1].value = -1;
    mp.sliders.dragThresholdScaleSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.dragThresholdScaleSliders[0].value).to.equal('0');
    expect(mp.sliders.dragThresholdScaleSliders[1].value).to.equal('0');
    expect(mp.values.dragThresholdScale).to.equal(0);
  });

  it('.onHealthChange()', () => {
    mp.sliders.healthSliders[0].value = 1;
    mp.sliders.healthSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.healthSliders[0].value).to.equal('1');
    expect(mp.sliders.healthSliders[1].value).to.equal('1');
    expect(mp.values.health).to.equal(1);

    mp.sliders.healthSliders[0].value = 0;
    mp.sliders.healthSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.healthSliders[0].value).to.equal('0');
    expect(mp.sliders.healthSliders[1].value).to.equal('0');
    expect(mp.values.health).to.equal(0);

    mp.sliders.healthSliders[1].value = 1.1;
    mp.sliders.healthSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.healthSliders[0].value).to.equal('1');
    expect(mp.sliders.healthSliders[1].value).to.equal('1');
    expect(mp.values.health).to.equal(1);

    mp.sliders.healthSliders[1].value = -1;
    mp.sliders.healthSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.healthSliders[0].value).to.equal('0');
    expect(mp.sliders.healthSliders[1].value).to.equal('0');
    expect(mp.values.health).to.equal(0);
  });

  it('.onObjectCountChange()', () => {
    mp.sliders.objectCountSliders[0].value = 1;
    mp.sliders.objectCountSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.objectCountSliders[0].value).to.equal('1');
    expect(mp.sliders.objectCountSliders[1].value).to.equal('1');
    expect(mp.values.objectCount).to.equal(1);

    mp.sliders.objectCountSliders[0].value = 0;
    mp.sliders.objectCountSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.objectCountSliders[0].value).to.equal('0');
    expect(mp.sliders.objectCountSliders[1].value).to.equal('0');
    expect(mp.values.objectCount).to.equal(0);

    mp.sliders.objectCountSliders[1].value = 1.1;
    mp.sliders.objectCountSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.objectCountSliders[0].value).to.equal('1');
    expect(mp.sliders.objectCountSliders[1].value).to.equal('1');
    expect(mp.values.objectCount).to.equal(1);

    mp.sliders.objectCountSliders[1].value = -1;
    mp.sliders.objectCountSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.objectCountSliders[0].value).to.equal('0');
    expect(mp.sliders.objectCountSliders[1].value).to.equal('0');
    expect(mp.values.objectCount).to.equal(0);
  });

  it('.onCompletionPercentageChange()', () => {
    mp.sliders.completionPercentageSliders[0].value = 1;
    mp.sliders.completionPercentageSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.completionPercentageSliders[0].value).to.equal('1');
    expect(mp.sliders.completionPercentageSliders[1].value).to.equal('1');
    expect(mp.values.completionPercentage).to.equal(1);

    mp.sliders.completionPercentageSliders[0].value = 0;
    mp.sliders.completionPercentageSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.completionPercentageSliders[0].value).to.equal('0');
    expect(mp.sliders.completionPercentageSliders[1].value).to.equal('0');
    expect(mp.values.completionPercentage).to.equal(0);

    mp.sliders.completionPercentageSliders[1].value = 1.1;
    mp.sliders.completionPercentageSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.completionPercentageSliders[0].value).to.equal('1');
    expect(mp.sliders.completionPercentageSliders[1].value).to.equal('1');
    expect(mp.values.completionPercentage).to.equal(1);

    mp.sliders.completionPercentageSliders[1].value = -1;
    mp.sliders.completionPercentageSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.completionPercentageSliders[0].value).to.equal('0');
    expect(mp.sliders.completionPercentageSliders[1].value).to.equal('0');
    expect(mp.values.completionPercentage).to.equal(0);
  });

  it('.onSpeedScaleChange()', () => {
    mp.sliders.speedScaleSliders[0].value = 1;
    mp.sliders.speedScaleSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.speedScaleSliders[0].value).to.equal('1');
    expect(mp.sliders.speedScaleSliders[1].value).to.equal('1');
    expect(mp.values.speedScale).to.equal(1);

    mp.sliders.speedScaleSliders[0].value = 0;
    mp.sliders.speedScaleSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.speedScaleSliders[0].value).to.equal('0');
    expect(mp.sliders.speedScaleSliders[1].value).to.equal('0');
    expect(mp.values.speedScale).to.equal(0);

    mp.sliders.speedScaleSliders[1].value = 1.1;
    mp.sliders.speedScaleSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.speedScaleSliders[0].value).to.equal('1');
    expect(mp.sliders.speedScaleSliders[1].value).to.equal('1');
    expect(mp.values.speedScale).to.equal(1);

    mp.sliders.speedScaleSliders[1].value = -1;
    mp.sliders.speedScaleSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.speedScaleSliders[0].value).to.equal('0');
    expect(mp.sliders.speedScaleSliders[1].value).to.equal('0');
    expect(mp.values.speedScale).to.equal(0);
  });

  it('.onTimersScaleChange()', () => {
    mp.sliders.timersScaleSliders[0].value = 1;
    mp.sliders.timersScaleSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.timersScaleSliders[0].value).to.equal('1');
    expect(mp.sliders.timersScaleSliders[1].value).to.equal('1');
    expect(mp.values.timersScale).to.equal(1);

    mp.sliders.timersScaleSliders[0].value = 0;
    mp.sliders.timersScaleSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.timersScaleSliders[0].value).to.equal('0');
    expect(mp.sliders.timersScaleSliders[1].value).to.equal('0');
    expect(mp.values.timersScale).to.equal(0);

    mp.sliders.timersScaleSliders[1].value = 1.1;
    mp.sliders.timersScaleSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.timersScaleSliders[0].value).to.equal('1');
    expect(mp.sliders.timersScaleSliders[1].value).to.equal('1');
    expect(mp.values.timersScale).to.equal(1);

    mp.sliders.timersScaleSliders[1].value = -1;
    mp.sliders.timersScaleSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.timersScaleSliders[0].value).to.equal('0');
    expect(mp.sliders.timersScaleSliders[1].value).to.equal('0');
    expect(mp.values.timersScale).to.equal(0);
  });

  it('.onInputCountChange()', () => {
    mp.sliders.inputCountSliders[0].value = 1;
    mp.sliders.inputCountSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.inputCountSliders[0].value).to.equal('1');
    expect(mp.sliders.inputCountSliders[1].value).to.equal('1');
    expect(mp.values.inputCount).to.equal(1);

    mp.sliders.inputCountSliders[0].value = 0;
    mp.sliders.inputCountSliders[0].dispatchEvent(initEvent('change'));

    expect(mp.sliders.inputCountSliders[0].value).to.equal('0');
    expect(mp.sliders.inputCountSliders[1].value).to.equal('0');
    expect(mp.values.inputCount).to.equal(0);

    mp.sliders.inputCountSliders[1].value = 1.1;
    mp.sliders.inputCountSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.inputCountSliders[0].value).to.equal('1');
    expect(mp.sliders.inputCountSliders[1].value).to.equal('1');
    expect(mp.values.inputCount).to.equal(1);

    mp.sliders.inputCountSliders[1].value = -1;
    mp.sliders.inputCountSliders[1].dispatchEvent(initEvent('change'));

    expect(mp.sliders.inputCountSliders[0].value).to.equal('0');
    expect(mp.sliders.inputCountSliders[1].value).to.equal('0');
    expect(mp.values.inputCount).to.equal(0);
  });

  it('Plugin should work without any controls', () => {
    //set up empty plugin
    mp = new MechanicsPlugin();
    mp.preload({ client: new Bellhop() });
    mp.init();
    mp.client.trigger('features', {});
  });
});
