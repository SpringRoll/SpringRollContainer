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
    dp.hitAreaScaleSlider.value = 1;
    dp.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.hitAreaScaleSlider.value).to.equal('1');
    expect(dp.hitAreaScale).to.equal(1);

    dp.hitAreaScaleSlider.value = 0;
    dp.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.hitAreaScaleSlider.value).to.equal('0');
    expect(dp.hitAreaScale).to.equal(0);

    dp.hitAreaScaleSlider.value = 1.1;
    dp.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.hitAreaScaleSlider.value).to.equal('1');
    expect(dp.hitAreaScale).to.equal(1);

    dp.hitAreaScaleSlider.value = -1;
    dp.hitAreaScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.hitAreaScaleSlider.value).to.equal('0');
    expect(dp.hitAreaScale).to.equal(0);
  });

  it('.onDragThresholdScaleChange()', () => {
    dp.dragThresholdScaleSlider.value = 1;
    dp.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.dragThresholdScaleSlider.value).to.equal('1');
    expect(dp.dragThresholdScale).to.equal(1);

    dp.dragThresholdScaleSlider.value = 0;
    dp.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.dragThresholdScaleSlider.value).to.equal('0');
    expect(dp.dragThresholdScale).to.equal(0);

    dp.dragThresholdScaleSlider.value = 1.1;
    dp.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.dragThresholdScaleSlider.value).to.equal('1');
    expect(dp.dragThresholdScale).to.equal(1);

    dp.dragThresholdScaleSlider.value = -1;
    dp.dragThresholdScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.dragThresholdScaleSlider.value).to.equal('0');
    expect(dp.dragThresholdScale).to.equal(0);
  });

  it('.onHealthChange()', () => {
    dp.healthSlider.value = 1;
    dp.healthSlider.dispatchEvent(initEvent('change'));

    expect(dp.healthSlider.value).to.equal('1');
    expect(dp.health).to.equal(1);

    dp.healthSlider.value = 0;
    dp.healthSlider.dispatchEvent(initEvent('change'));

    expect(dp.healthSlider.value).to.equal('0');
    expect(dp.health).to.equal(0);

    dp.healthSlider.value = 1.1;
    dp.healthSlider.dispatchEvent(initEvent('change'));

    expect(dp.healthSlider.value).to.equal('1');
    expect(dp.health).to.equal(1);

    dp.healthSlider.value = -1;
    dp.healthSlider.dispatchEvent(initEvent('change'));

    expect(dp.healthSlider.value).to.equal('0');
    expect(dp.health).to.equal(0);
  });

  it('.onObjectCountChange()', () => {
    dp.objectCountSlider.value = 1;
    dp.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.objectCountSlider.value).to.equal('1');
    expect(dp.objectCount).to.equal(1);

    dp.objectCountSlider.value = 0;
    dp.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.objectCountSlider.value).to.equal('0');
    expect(dp.objectCount).to.equal(0);

    dp.objectCountSlider.value = 1.1;
    dp.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.objectCountSlider.value).to.equal('1');
    expect(dp.objectCount).to.equal(1);

    dp.objectCountSlider.value = -1;
    dp.objectCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.objectCountSlider.value).to.equal('0');
    expect(dp.objectCount).to.equal(0);
  });

  it('.onCompletionPercentageChange()', () => {
    dp.completionPercentageSlider.value = 1;
    dp.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(dp.completionPercentageSlider.value).to.equal('1');
    expect(dp.completionPercentage).to.equal(1);

    dp.completionPercentageSlider.value = 0;
    dp.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(dp.completionPercentageSlider.value).to.equal('0');
    expect(dp.completionPercentage).to.equal(0);

    dp.completionPercentageSlider.value = 1.1;
    dp.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(dp.completionPercentageSlider.value).to.equal('1');
    expect(dp.completionPercentage).to.equal(1);

    dp.completionPercentageSlider.value = -1;
    dp.completionPercentageSlider.dispatchEvent(initEvent('change'));

    expect(dp.completionPercentageSlider.value).to.equal('0');
    expect(dp.completionPercentage).to.equal(0);
  });

  it('.onSpeedScaleChange()', () => {
    dp.speedScaleSlider.value = 1;
    dp.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.speedScaleSlider.value).to.equal('1');
    expect(dp.speedScale).to.equal(1);

    dp.speedScaleSlider.value = 0;
    dp.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.speedScaleSlider.value).to.equal('0');
    expect(dp.speedScale).to.equal(0);

    dp.speedScaleSlider.value = 1.1;
    dp.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.speedScaleSlider.value).to.equal('1');
    expect(dp.speedScale).to.equal(1);

    dp.speedScaleSlider.value = -1;
    dp.speedScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.speedScaleSlider.value).to.equal('0');
    expect(dp.speedScale).to.equal(0);
  });

  it('.onTimersScaleChange()', () => {
    dp.timersScaleSlider.value = 1;
    dp.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.timersScaleSlider.value).to.equal('1');
    expect(dp.timersScale).to.equal(1);

    dp.timersScaleSlider.value = 0;
    dp.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.timersScaleSlider.value).to.equal('0');
    expect(dp.timersScale).to.equal(0);

    dp.timersScaleSlider.value = 1.1;
    dp.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.timersScaleSlider.value).to.equal('1');
    expect(dp.timersScale).to.equal(1);

    dp.timersScaleSlider.value = -1;
    dp.timersScaleSlider.dispatchEvent(initEvent('change'));

    expect(dp.timersScaleSlider.value).to.equal('0');
    expect(dp.timersScale).to.equal(0);
  });

  it('.onInputCountChange()', () => {
    dp.inputCountSlider.value = 1;
    dp.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.inputCountSlider.value).to.equal('1');
    expect(dp.inputCount).to.equal(1);

    dp.inputCountSlider.value = 0;
    dp.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.inputCountSlider.value).to.equal('0');
    expect(dp.inputCount).to.equal(0);

    dp.inputCountSlider.value = 1.1;
    dp.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.inputCountSlider.value).to.equal('1');
    expect(dp.inputCount).to.equal(1);

    dp.inputCountSlider.value = -1;
    dp.inputCountSlider.dispatchEvent(initEvent('change'));

    expect(dp.inputCountSlider.value).to.equal('0');
    expect(dp.inputCount).to.equal(0);
  });
});
