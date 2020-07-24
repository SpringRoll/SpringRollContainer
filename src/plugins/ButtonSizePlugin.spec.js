import { Container, ButtonSizePlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';
import { makeSlider } from '../../TestingUtils';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('ButtonSizePlugin', () => {
  let bsp;

  before(() => {
    document.body.innerHTML = '';

    const buttonSliderOne = makeSlider('bsOne');
    const buttonSliderTwo = makeSlider('bsTwo');

    document.body.append(buttonSliderOne, buttonSliderTwo);

    bsp = new ButtonSizePlugin('#bsOne, #bsTwo');
    bsp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'buttonsize-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#buttonsize-plugin-iframe').client.trigger(
      'features'
    );
  });

  it('.onButtonSizeChange()', () => {

    expect(bsp.sliders[0].value).to.equal('0.5');
    expect(bsp.sliders[1].value).to.equal('0.5');

    bsp.sliders[0].value = 1;
    bsp.sliders[0].dispatchEvent(initEvent('change'));

    expect(bsp.sliders[0].value).to.equal('1');
    expect(bsp.sliders[1].value).to.equal('1');
    expect(bsp.currentValue).to.equal(1);

    bsp.sliders[0].value = 0;
    bsp.sliders[0].dispatchEvent(initEvent('change'));

    expect(bsp.sliders[0].value).to.equal('0');
    expect(bsp.sliders[1].value).to.equal('0');
    expect(bsp.currentValue).to.equal(0);

    bsp.sliders[1].value = 1.1;
    bsp.sliders[1].dispatchEvent(initEvent('change'));

    expect(bsp.sliders[0].value).to.equal('1');
    expect(bsp.sliders[1].value).to.equal('1');
    expect(bsp.currentValue).to.equal(1);

    bsp.sliders[1].value = -1;
    bsp.sliders[1].dispatchEvent(initEvent('change'));

    expect(bsp.sliders[0].value).to.equal('0');
    expect(bsp.sliders[1].value).to.equal('0');
    expect(bsp.currentValue).to.equal(0);
  });

  it('should work without any controls', () => {
    //set bsp empty plugin
    bsp = new ButtonSizePlugin();
    bsp.preload({ client: new Bellhop() });
    bsp.init();
    bsp.client.trigger('features', {});
  });

  it('should work with HTML Elements as paramters', () => {

    //plugin set up
    const buttonSliderOne = makeSlider('bsOneOneOne');
    document.body.appendChild(buttonSliderOne);

    bsp = new ButtonSizePlugin(buttonSliderOne);
    bsp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'buttonsize-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#buttonsize-plugin-iframe').client.trigger(
      'features'
    );

    expect(bsp.sliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(bsp.sliders[0].value).to.equal('0.5');

    bsp.sliders[0].value = 1;
    bsp.sliders[0].dispatchEvent(initEvent('change'));

    expect(bsp.sliders[0].value).to.equal('1');
  });
});
