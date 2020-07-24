import { Container, ObjectCountPlugin } from '../index';
import { makeSlider } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('ObjectCountPlugin', () => {
  let ocp;

  before(() => {
    document.body.innerHTML = '';
    const sliderOne = makeSlider('object-count-one');
    const sliderTwo = makeSlider('object-count-two');

    document.body.append(sliderOne, sliderTwo);

    ocp = new ObjectCountPlugin('#object-count-one, #object-count-two');
    ocp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#difficulty-plugin-iframe', {plugins: [ocp]}).client.trigger(
      'features'
    );
  });

  it('.onObjectCountChange()', () => {
    ocp.sliders[0].value = 1;
    ocp.sliders[0].dispatchEvent(initEvent('change'));

    expect(ocp.sliders[0].value).to.equal('1');
    expect(ocp.sliders[1].value).to.equal('1');
    expect(ocp.currentValue).to.equal(1);

    ocp.sliders[0].value = 0;
    ocp.sliders[0].dispatchEvent(initEvent('change'));

    expect(ocp.sliders[0].value).to.equal('0');
    expect(ocp.sliders[1].value).to.equal('0');
    expect(ocp.currentValue).to.equal(0);

    ocp.sliders[1].value = 1.1;
    ocp.sliders[1].dispatchEvent(initEvent('change'));

    expect(ocp.sliders[0].value).to.equal('1');
    expect(ocp.sliders[1].value).to.equal('1');
    expect(ocp.currentValue).to.equal(1);

    ocp.sliders[1].value = -1;
    ocp.sliders[1].dispatchEvent(initEvent('change'));

    expect(ocp.sliders[0].value).to.equal('0');
    expect(ocp.sliders[1].value).to.equal('0');
    expect(ocp.currentValue).to.equal(0);
  });


  it('Plugin should work without any controls', () => {
    //set up empty plugin
    ocp = new ObjectCountPlugin();
    ocp.preload({ client: new Bellhop() });
    ocp.init();
    ocp.client.trigger('features', {});
  });
});
