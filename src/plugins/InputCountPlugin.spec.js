import { Container, InputCountPlugin } from '../index';
import { makeSlider } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('InputCountPlugin', () => {
  let icp; //Magnets! How do they work

  before(() => {
    document.body.innerHTML = '';
    const sliderOne = makeSlider('drag-threshold-one');
    const sliderTwo = makeSlider('drag-threshold-two');

    document.body.append(sliderOne, sliderTwo);

    icp = new InputCountPlugin('#drag-threshold-one, #drag-threshold-two');
    icp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#difficulty-plugin-iframe', {plugins: [icp]}).client.trigger(
      'features'
    );
  });

  it('.onInputCountChange()', () => {
    icp.sliders[0].value = 1;
    icp.sliders[0].dispatchEvent(initEvent('change'));

    expect(icp.sliders[0].value).to.equal('1');
    expect(icp.sliders[1].value).to.equal('1');
    expect(icp.currentValue).to.equal(1);

    icp.sliders[0].value = 0;
    icp.sliders[0].dispatchEvent(initEvent('change'));

    expect(icp.sliders[0].value).to.equal('0');
    expect(icp.sliders[1].value).to.equal('0');
    expect(icp.currentValue).to.equal(0);

    icp.sliders[1].value = 1.1;
    icp.sliders[1].dispatchEvent(initEvent('change'));

    expect(icp.sliders[0].value).to.equal('1');
    expect(icp.sliders[1].value).to.equal('1');
    expect(icp.currentValue).to.equal(1);

    icp.sliders[1].value = -1;
    icp.sliders[1].dispatchEvent(initEvent('change'));

    expect(icp.sliders[0].value).to.equal('0');
    expect(icp.sliders[1].value).to.equal('0');
    expect(icp.currentValue).to.equal(0);
  });


  it('Plugin should work without any controls', () => {
    //set up empty plugin
    icp = new InputCountPlugin();
    icp.preload({ client: new Bellhop() });
    icp.init();
    icp.client.trigger('features', {});
  });
});
