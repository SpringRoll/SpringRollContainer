import { Container, TimersScalePlugin } from '../index';
import { makeSlider } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('TimersScalePlugin', () => {
  let tsp;

  before(() => {
    document.body.innerHTML = '';
    const sliderOne = makeSlider('timers-one');
    const sliderTwo = makeSlider('timers-two');

    document.body.append(sliderOne, sliderTwo);

    tsp = new TimersScalePlugin('#timers-one, #timers-two');
    tsp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#difficulty-plugin-iframe', {plugins: [tsp]}).client.trigger(
      'features'
    );
  });

  it('.onTimersScaleChange()', () => {
    tsp.sliders[0].value = 1;
    tsp.sliders[0].dispatchEvent(initEvent('change'));

    expect(tsp.sliders[0].value).to.equal('1');
    expect(tsp.sliders[1].value).to.equal('1');
    expect(tsp.currentValue).to.equal(1);

    tsp.sliders[0].value = 0;
    tsp.sliders[0].dispatchEvent(initEvent('change'));

    expect(tsp.sliders[0].value).to.equal('0');
    expect(tsp.sliders[1].value).to.equal('0');
    expect(tsp.currentValue).to.equal(0);

    tsp.sliders[1].value = 1.1;
    tsp.sliders[1].dispatchEvent(initEvent('change'));

    expect(tsp.sliders[0].value).to.equal('1');
    expect(tsp.sliders[1].value).to.equal('1');
    expect(tsp.currentValue).to.equal(1);

    tsp.sliders[1].value = -1;
    tsp.sliders[1].dispatchEvent(initEvent('change'));

    expect(tsp.sliders[0].value).to.equal('0');
    expect(tsp.sliders[1].value).to.equal('0');
    expect(tsp.currentValue).to.equal(0);
  });


  it('Plugin should work without any controls', () => {
    //set up empty plugin
    tsp = new TimersScalePlugin();
    tsp.preload({ client: new Bellhop() });
    tsp.init();
    tsp.client.trigger('features', {});
  });
});
