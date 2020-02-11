import { Container, DifficultyPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('DifficultyPlugin', () => {
  let dp;
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
    dp = new DifficultyPlugin(options);
    dp.preload({ client: new Bellhop() });
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
    dp.sliders.hitAreaScaleSlider.value = 1;
    dp.sliders.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.hitAreaScaleSlider.value).to.equal('1');
    expect(dp.values.hitAreaScale).to.equal(1);

    dp.sliders.hitAreaScaleSlider.value = 0;
    dp.sliders.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.hitAreaScaleSlider.value).to.equal('0');
    expect(dp.values.hitAreaScale).to.equal(0);

    dp.sliders.hitAreaScaleSlider.value = 1.1;
    dp.sliders.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.hitAreaScaleSlider.value).to.equal('1');
    expect(dp.values.hitAreaScale).to.equal(1);

    dp.sliders.hitAreaScaleSlider.value = -1;
    dp.sliders.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.hitAreaScaleSlider.value).to.equal('0');
    expect(dp.values.hitAreaScale).to.equal(0);
  });

  it('.onDragThresholdScaleChange()', () => {
    dp.sliders.dragThresholdScaleSlider.value = 1;
    dp.sliders.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.dragThresholdScaleSlider.value).to.equal('1');
    expect(dp.values.dragThresholdScale).to.equal(1);

    dp.sliders.dragThresholdScaleSlider.value = 0;
    dp.sliders.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.dragThresholdScaleSlider.value).to.equal('0');
    expect(dp.values.dragThresholdScale).to.equal(0);

    dp.sliders.dragThresholdScaleSlider.value = 1.1;
    dp.sliders.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.dragThresholdScaleSlider.value).to.equal('1');
    expect(dp.values.dragThresholdScale).to.equal(1);

    dp.sliders.dragThresholdScaleSlider.value = -1;
    dp.sliders.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.dragThresholdScaleSlider.value).to.equal('0');
    expect(dp.values.dragThresholdScale).to.equal(0);
  });

  it('.onHealthChange()', () => {
    dp.sliders.healthSlider.value = 1;
    dp.sliders.healthSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.healthSlider.value).to.equal('1');
    expect(dp.values.health).to.equal(1);

    dp.sliders.healthSlider.value = 0;
    dp.sliders.healthSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.healthSlider.value).to.equal('0');
    expect(dp.values.health).to.equal(0);

    dp.sliders.healthSlider.value = 1.1;
    dp.sliders.healthSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.healthSlider.value).to.equal('1');
    expect(dp.values.health).to.equal(1);

    dp.sliders.healthSlider.value = -1;
    dp.sliders.healthSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.healthSlider.value).to.equal('0');
    expect(dp.values.health).to.equal(0);
  });

  it('.onObjectCountChange()', () => {
    dp.sliders.objectCountSlider.value = 1;
    dp.sliders.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.objectCountSlider.value).to.equal('1');
    expect(dp.values.objectCount).to.equal(1);

    dp.sliders.objectCountSlider.value = 0;
    dp.sliders.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.objectCountSlider.value).to.equal('0');
    expect(dp.values.objectCount).to.equal(0);

    dp.sliders.objectCountSlider.value = 1.1;
    dp.sliders.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.objectCountSlider.value).to.equal('1');
    expect(dp.values.objectCount).to.equal(1);

    dp.sliders.objectCountSlider.value = -1;
    dp.sliders.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.objectCountSlider.value).to.equal('0');
    expect(dp.values.objectCount).to.equal(0);
  });

  it('.onCompletionPercentageChange()', () => {
    dp.sliders.completionPercentageSlider.value = 1;
    dp.sliders.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.completionPercentageSlider.value).to.equal('1');
    expect(dp.values.completionPercentage).to.equal(1);

    dp.sliders.completionPercentageSlider.value = 0;
    dp.sliders.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.completionPercentageSlider.value).to.equal('0');
    expect(dp.values.completionPercentage).to.equal(0);

    dp.sliders.completionPercentageSlider.value = 1.1;
    dp.sliders.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.completionPercentageSlider.value).to.equal('1');
    expect(dp.values.completionPercentage).to.equal(1);

    dp.sliders.completionPercentageSlider.value = -1;
    dp.sliders.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.completionPercentageSlider.value).to.equal('0');
    expect(dp.values.completionPercentage).to.equal(0);
  });

  it('.onSpeedScaleChange()', () => {
    dp.sliders.speedScaleSlider.value = 1;
    dp.sliders.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.speedScaleSlider.value).to.equal('1');
    expect(dp.values.speedScale).to.equal(1);

    dp.sliders.speedScaleSlider.value = 0;
    dp.sliders.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.speedScaleSlider.value).to.equal('0');
    expect(dp.values.speedScale).to.equal(0);

    dp.sliders.speedScaleSlider.value = 1.1;
    dp.sliders.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.speedScaleSlider.value).to.equal('1');
    expect(dp.values.speedScale).to.equal(1);

    dp.sliders.speedScaleSlider.value = -1;
    dp.sliders.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.speedScaleSlider.value).to.equal('0');
    expect(dp.values.speedScale).to.equal(0);
  });

  it('.onTimersScaleChange()', () => {
    dp.sliders.timersScaleSlider.value = 1;
    dp.sliders.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.timersScaleSlider.value).to.equal('1');
    expect(dp.values.timersScale).to.equal(1);

    dp.sliders.timersScaleSlider.value = 0;
    dp.sliders.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.timersScaleSlider.value).to.equal('0');
    expect(dp.values.timersScale).to.equal(0);

    dp.sliders.timersScaleSlider.value = 1.1;
    dp.sliders.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.timersScaleSlider.value).to.equal('1');
    expect(dp.values.timersScale).to.equal(1);

    dp.sliders.timersScaleSlider.value = -1;
    dp.sliders.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.timersScaleSlider.value).to.equal('0');
    expect(dp.values.timersScale).to.equal(0);
  });

  it('.onInputCountChange()', () => {
    dp.sliders.inputCountSlider.value = 1;
    dp.sliders.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.inputCountSlider.value).to.equal('1');
    expect(dp.values.inputCount).to.equal(1);

    dp.sliders.inputCountSlider.value = 0;
    dp.sliders.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.inputCountSlider.value).to.equal('0');
    expect(dp.values.inputCount).to.equal(0);

    dp.sliders.inputCountSlider.value = 1.1;
    dp.sliders.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.inputCountSlider.value).to.equal('1');
    expect(dp.values.inputCount).to.equal(1);

    dp.sliders.inputCountSlider.value = -1;
    dp.sliders.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.sliders.inputCountSlider.value).to.equal('0');
    expect(dp.values.inputCount).to.equal(0);
  });
});
