import { Container, SpeedScalePlugin } from '../index';
import { makeSlider } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('SpeedScalePlugin', () => {
  let ssp;

  before(() => {
    document.body.innerHTML = '';
    const sliderOne = makeSlider('speed-scale-one');
    const sliderTwo = makeSlider('speed-scale-two');

    document.body.append(sliderOne, sliderTwo);

    ssp = new SpeedScalePlugin('#speed-scale-one, #speed-scale-two');
    ssp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#difficulty-plugin-iframe', {plugins: [ssp]}).client.trigger(
      'features'
    );
  });

  it('.onSpeedScaleChange()', () => {
    ssp.sliders[0].value = 1;
    ssp.sliders[0].dispatchEvent(initEvent('change'));

    expect(ssp.sliders[0].value).to.equal('1');
    expect(ssp.sliders[1].value).to.equal('1');
    expect(ssp.currentValue).to.equal(1);

    ssp.sliders[0].value = 0;
    ssp.sliders[0].dispatchEvent(initEvent('change'));

    expect(ssp.sliders[0].value).to.equal('0');
    expect(ssp.sliders[1].value).to.equal('0');
    expect(ssp.currentValue).to.equal(0);

    ssp.sliders[1].value = 1.1;
    ssp.sliders[1].dispatchEvent(initEvent('change'));

    expect(ssp.sliders[0].value).to.equal('1');
    expect(ssp.sliders[1].value).to.equal('1');
    expect(ssp.currentValue).to.equal(1);

    ssp.sliders[1].value = -1;
    ssp.sliders[1].dispatchEvent(initEvent('change'));

    expect(ssp.sliders[0].value).to.equal('0');
    expect(ssp.sliders[1].value).to.equal('0');
    expect(ssp.currentValue).to.equal(0);
  });


  it('Plugin should work without any controls', () => {
    //set up empty plugin
    ssp = new SpeedScalePlugin();
    ssp.preload({ client: new Bellhop() });
    ssp.init();
    ssp.client.trigger('features', {});
  });
});
