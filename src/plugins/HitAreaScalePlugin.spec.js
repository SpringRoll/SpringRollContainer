import { Container, HitAreaScalePlugin } from '../index';
import { makeSlider } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('HitAreaScalePlugin', () => {
  let hasp;

  before(() => {
    document.body.innerHTML = '';
    const sliderOne = makeSlider('hit-area-one');
    const sliderTwo = makeSlider('hit-area-two');

    document.body.append(sliderOne, sliderTwo);

    hasp = new HitAreaScalePlugin('#hit-area-one, #hit-area-two');
    hasp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#difficulty-plugin-iframe', {plugins: [hasp]}).client.trigger(
      'features'
    );
  });

  it('.onHitAreaScaleChange()', () => {
    hasp.sliders[0].value = 1;
    hasp.sliders[0].dispatchEvent(initEvent('change'));

    expect(hasp.sliders[0].value).to.equal('1');
    expect(hasp.sliders[1].value).to.equal('1');
    expect(hasp.currentValue).to.equal(1);

    hasp.sliders[0].value = 0;
    hasp.sliders[0].dispatchEvent(initEvent('change'));

    expect(hasp.sliders[0].value).to.equal('0');
    expect(hasp.sliders[1].value).to.equal('0');
    expect(hasp.currentValue).to.equal(0);

    hasp.sliders[1].value = 1.1;
    hasp.sliders[1].dispatchEvent(initEvent('change'));

    expect(hasp.sliders[0].value).to.equal('1');
    expect(hasp.sliders[1].value).to.equal('1');
    expect(hasp.currentValue).to.equal(1);

    hasp.sliders[1].value = -1;
    hasp.sliders[1].dispatchEvent(initEvent('change'));

    expect(hasp.sliders[0].value).to.equal('0');
    expect(hasp.sliders[1].value).to.equal('0');
    expect(hasp.currentValue).to.equal(0);
  });


  it('Plugin should work without any controls', () => {
    //set up empty plugin
    hasp = new HitAreaScalePlugin();
    hasp.preload({ client: new Bellhop() });
    hasp.init();
    hasp.client.trigger('features', {});
  });
});
