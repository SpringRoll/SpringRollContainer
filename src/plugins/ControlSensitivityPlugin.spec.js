import { Container, ControlSensitivityPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';
import { makeSlider } from '../../TestingUtils';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('ControlSensitivityPlugin', () => {
  let csp;

  before(() => {
    document.body.innerHTML = '';
    const sliderOne = makeSlider('ssOne');
    const sliderTwo = makeSlider('ssTwo');

    document.body.append(sliderOne, sliderTwo);

    csp = new ControlSensitivityPlugin('#ssOne, #ssTwo');
    csp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'controls-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#controls-plugin-iframe', { plugins: [csp] });
    csp.init();
    csp.client.trigger('features', {
      controlSensitivity: true,
    });

    expect(csp.sliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(csp.sliders[1].slider).to.be.instanceof(HTMLInputElement);
  });

  it('.onControlSensitivityChange()', () => {
    expect(csp.sliders[0].value).to.equal('0.5');
    expect(csp.sliders[1].value).to.equal('0.5');

    csp.sliders[0].value = '1';
    csp.sliders[0].dispatchEvent(initEvent('change'));

    expect(csp.sliders[0].value).to.equal('1');
    expect(csp.sliders[1].value).to.equal('1');
    expect(csp.currentValue).to.equal(1);

    csp.sliders[0].value = 0;
    csp.sliders[0].dispatchEvent(initEvent('change'));

    expect(csp.sliders[0].value).to.equal('0');
    expect(csp.sliders[1].value).to.equal('0');
    expect(csp.currentValue).to.equal(0);

    csp.sliders[1].value = 1.1;
    csp.sliders[1].dispatchEvent(initEvent('change'));


    expect(csp.sliders[0].value).to.equal('1');
    expect(csp.sliders[1].value).to.equal('1');
    expect(csp.currentValue).to.equal(1);

    csp.sliders[1].value = -1;
    csp.sliders[1].dispatchEvent(initEvent('change'));

    expect(csp.sliders[0].value).to.equal('0');
    expect(csp.sliders[1].value).to.equal('0');
    expect(csp.currentValue).to.equal(0);
  });

  it('should work without any controls', () => {
    //set up empty plugin
    csp = new ControlSensitivityPlugin();
    csp.preload({ client: new Bellhop() });
    csp.init();
    csp.client.trigger('features', {});
  });

  it('should work with an HTMLElement as parameters', () => {
    //Plugin re-setup
    document.body.innerHTML = '';
    const sliderOne = makeSlider('ssOne');

    document.body.appendChild(sliderOne);

    csp = new ControlSensitivityPlugin(sliderOne);
    csp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'controls-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#controls-plugin-iframe', {plugins: [csp] });
    csp.init();
    csp.client.trigger('features', {
      controlSensitivity: true,
    });

    csp.sliders[0].value = 1;
    csp.sliders[0].dispatchEvent(initEvent('change'));

    expect(csp.sliders[0].value).to.equal('1');
    expect(csp.currentValue).to.equal(1);
  });
});
