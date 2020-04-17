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
    hitAreaScaleSlider: 'hass',
    dragThresholdScaleSlider: 'dtss',
    healthSlider: 'hs',
    objectCountSlider: 'ocs',
    completionPercentageSlider: 'cps',
    speedScaleSlider: 'sss',
    timersScaleSlider: 'tss',
    inputCountSlider: 'ics'
  };

  before(() => {
    document.body.innerHTML = '';
    Object.keys(options).forEach(key => {
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.id = options[key];
      options[key] = `#${options[key]}`;
      document.body.appendChild(slider);
    });
    mp = new MechanicsPlugin(options);
    mp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({ iframeSelector: '#difficulty-plugin-iframe' }).client.trigger(
      'features'
    );
  });

  it('.onHitAreaScaleChange()', () => {
    mp.sliders.hitAreaScaleSlider.value = 1;
    mp.sliders.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.hitAreaScaleSlider.value).to.equal('1');
    expect(mp.values.hitAreaScale).to.equal(1);

    mp.sliders.hitAreaScaleSlider.value = 0;
    mp.sliders.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.hitAreaScaleSlider.value).to.equal('0');
    expect(mp.values.hitAreaScale).to.equal(0);

    mp.sliders.hitAreaScaleSlider.value = 1.1;
    mp.sliders.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.hitAreaScaleSlider.value).to.equal('1');
    expect(mp.values.hitAreaScale).to.equal(1);

    mp.sliders.hitAreaScaleSlider.value = -1;
    mp.sliders.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.hitAreaScaleSlider.value).to.equal('0');
    expect(mp.values.hitAreaScale).to.equal(0);
  });

  it('.onDragThresholdScaleChange()', () => {
    mp.sliders.dragThresholdScaleSlider.value = 1;
    mp.sliders.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.dragThresholdScaleSlider.value).to.equal('1');
    expect(mp.values.dragThresholdScale).to.equal(1);

    mp.sliders.dragThresholdScaleSlider.value = 0;
    mp.sliders.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.dragThresholdScaleSlider.value).to.equal('0');
    expect(mp.values.dragThresholdScale).to.equal(0);

    mp.sliders.dragThresholdScaleSlider.value = 1.1;
    mp.sliders.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.dragThresholdScaleSlider.value).to.equal('1');
    expect(mp.values.dragThresholdScale).to.equal(1);

    mp.sliders.dragThresholdScaleSlider.value = -1;
    mp.sliders.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.dragThresholdScaleSlider.value).to.equal('0');
    expect(mp.values.dragThresholdScale).to.equal(0);
  });

  it('.onHealthChange()', () => {
    mp.sliders.healthSlider.value = 1;
    mp.sliders.healthSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.healthSlider.value).to.equal('1');
    expect(mp.values.health).to.equal(1);

    mp.sliders.healthSlider.value = 0;
    mp.sliders.healthSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.healthSlider.value).to.equal('0');
    expect(mp.values.health).to.equal(0);

    mp.sliders.healthSlider.value = 1.1;
    mp.sliders.healthSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.healthSlider.value).to.equal('1');
    expect(mp.values.health).to.equal(1);

    mp.sliders.healthSlider.value = -1;
    mp.sliders.healthSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.healthSlider.value).to.equal('0');
    expect(mp.values.health).to.equal(0);
  });

  it('.onObjectCountChange()', () => {
    mp.sliders.objectCountSlider.value = 1;
    mp.sliders.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.objectCountSlider.value).to.equal('1');
    expect(mp.values.objectCount).to.equal(1);

    mp.sliders.objectCountSlider.value = 0;
    mp.sliders.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.objectCountSlider.value).to.equal('0');
    expect(mp.values.objectCount).to.equal(0);

    mp.sliders.objectCountSlider.value = 1.1;
    mp.sliders.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.objectCountSlider.value).to.equal('1');
    expect(mp.values.objectCount).to.equal(1);

    mp.sliders.objectCountSlider.value = -1;
    mp.sliders.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.objectCountSlider.value).to.equal('0');
    expect(mp.values.objectCount).to.equal(0);
  });

  it('.onCompletionPercentageChange()', () => {
    mp.sliders.completionPercentageSlider.value = 1;
    mp.sliders.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.completionPercentageSlider.value).to.equal('1');
    expect(mp.values.completionPercentage).to.equal(1);

    mp.sliders.completionPercentageSlider.value = 0;
    mp.sliders.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.completionPercentageSlider.value).to.equal('0');
    expect(mp.values.completionPercentage).to.equal(0);

    mp.sliders.completionPercentageSlider.value = 1.1;
    mp.sliders.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.completionPercentageSlider.value).to.equal('1');
    expect(mp.values.completionPercentage).to.equal(1);

    mp.sliders.completionPercentageSlider.value = -1;
    mp.sliders.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.completionPercentageSlider.value).to.equal('0');
    expect(mp.values.completionPercentage).to.equal(0);
  });

  it('.onSpeedScaleChange()', () => {
    mp.sliders.speedScaleSlider.value = 1;
    mp.sliders.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.speedScaleSlider.value).to.equal('1');
    expect(mp.values.speedScale).to.equal(1);

    mp.sliders.speedScaleSlider.value = 0;
    mp.sliders.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.speedScaleSlider.value).to.equal('0');
    expect(mp.values.speedScale).to.equal(0);

    mp.sliders.speedScaleSlider.value = 1.1;
    mp.sliders.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.speedScaleSlider.value).to.equal('1');
    expect(mp.values.speedScale).to.equal(1);

    mp.sliders.speedScaleSlider.value = -1;
    mp.sliders.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.speedScaleSlider.value).to.equal('0');
    expect(mp.values.speedScale).to.equal(0);
  });

  it('.onTimersScaleChange()', () => {
    mp.sliders.timersScaleSlider.value = 1;
    mp.sliders.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.timersScaleSlider.value).to.equal('1');
    expect(mp.values.timersScale).to.equal(1);

    mp.sliders.timersScaleSlider.value = 0;
    mp.sliders.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.timersScaleSlider.value).to.equal('0');
    expect(mp.values.timersScale).to.equal(0);

    mp.sliders.timersScaleSlider.value = 1.1;
    mp.sliders.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.timersScaleSlider.value).to.equal('1');
    expect(mp.values.timersScale).to.equal(1);

    mp.sliders.timersScaleSlider.value = -1;
    mp.sliders.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.timersScaleSlider.value).to.equal('0');
    expect(mp.values.timersScale).to.equal(0);
  });

  it('.onInputCountChange()', () => {
    mp.sliders.inputCountSlider.value = 1;
    mp.sliders.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.inputCountSlider.value).to.equal('1');
    expect(mp.values.inputCount).to.equal(1);

    mp.sliders.inputCountSlider.value = 0;
    mp.sliders.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.inputCountSlider.value).to.equal('0');
    expect(mp.values.inputCount).to.equal(0);

    mp.sliders.inputCountSlider.value = 1.1;
    mp.sliders.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.inputCountSlider.value).to.equal('1');
    expect(mp.values.inputCount).to.equal(1);

    mp.sliders.inputCountSlider.value = -1;
    mp.sliders.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(mp.sliders.inputCountSlider.value).to.equal('0');
    expect(mp.values.inputCount).to.equal(0);
  });

  it('Plugin should work without any controls', () => {
    //set up empty plugin
    mp = new MechanicsPlugin();
    mp.preload({ client: new Bellhop() });
    mp.init();
    mp.client.trigger('features', {
    });
  });
});
