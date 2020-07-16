import { Container, HealthPlugin } from '../index';
import { makeSlider } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('HealthPlugin', () => {
  let hp;

  before(() => {
    document.body.innerHTML = '';
    const sliderOne = makeSlider('health-one');
    const sliderTwo = makeSlider('health-two');

    document.body.append(sliderOne, sliderTwo);

    hp = new HealthPlugin('#health-one, #health-two');
    hp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#difficulty-plugin-iframe', {plugins: [hp]}).client.trigger(
      'features'
    );
  });

  it('.onHealthChange()', () => {
    hp.sliders[0].value = 1;
    hp.sliders[0].dispatchEvent(initEvent('change'));

    expect(hp.sliders[0].value).to.equal('1');
    expect(hp.sliders[1].value).to.equal('1');
    expect(hp.currentValue).to.equal(1);

    hp.sliders[0].value = 0;
    hp.sliders[0].dispatchEvent(initEvent('change'));

    expect(hp.sliders[0].value).to.equal('0');
    expect(hp.sliders[1].value).to.equal('0');
    expect(hp.currentValue).to.equal(0);

    hp.sliders[1].value = 1.1;
    hp.sliders[1].dispatchEvent(initEvent('change'));

    expect(hp.sliders[0].value).to.equal('1');
    expect(hp.sliders[1].value).to.equal('1');
    expect(hp.currentValue).to.equal(1);

    hp.sliders[1].value = -1;
    hp.sliders[1].dispatchEvent(initEvent('change'));

    expect(hp.sliders[0].value).to.equal('0');
    expect(hp.sliders[1].value).to.equal('0');
    expect(hp.currentValue).to.equal(0);
  });


  it('Plugin should work without any controls', () => {
    //set up empty plugin
    hp = new HealthPlugin();
    hp.preload({ client: new Bellhop() });
    hp.init();
    hp.client.trigger('features', {});
  });
});
