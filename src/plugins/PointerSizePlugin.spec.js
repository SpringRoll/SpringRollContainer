import { Container, PointerSizePlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';
import { makeSlider } from '../../TestingUtils';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('PointerSizePlugin', () => {
  let psp;

  before(() => {
    document.body.innerHTML = '';

    const pointerSliderOne = makeSlider('psOne');
    const pointerSliderTwo = makeSlider('psTwo');

    document.body.append(pointerSliderOne, pointerSliderTwo);

    psp = new PointerSizePlugin('#psOne, #psTwo');
    psp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'uisize-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({ iframeSelector: '#uisize-plugin-iframe' }).client.trigger(
      'features'
    );
  });

  it('.onPointerSizeChange()', () => {
    psp.sliders[0].value = 1;
    psp.sliders[0].dispatchEvent(initEvent('change'));

    expect(psp.sliders[0].value).to.equal('1');
    expect(psp.sliders[1].value).to.equal('1');
    expect(psp.currentValue).to.equal(1);

    psp.sliders[0].value = 0;
    psp.sliders[0].dispatchEvent(initEvent('change'));

    expect(psp.sliders[0].value).to.equal('0');
    expect(psp.sliders[1].value).to.equal('0');
    expect(psp.currentValue).to.equal(0);

    psp.sliders[1].value = 1.1;
    psp.sliders[1].dispatchEvent(initEvent('change'));

    expect(psp.sliders[0].value).to.equal('1');
    expect(psp.sliders[1].value).to.equal('1');
    expect(psp.currentValue).to.equal(1);

    psp.sliders[1].value = -1;
    psp.sliders[1].dispatchEvent(initEvent('change'));

    expect(psp.sliders[0].value).to.equal('0');
    expect(psp.sliders[1].value).to.equal('0');
    expect(psp.currentValue).to.equal(0);
  });

  it('should work with HTML Elements as paramters', () => {

    //plugin set psp
    document.body.innerHTML = '';
    const pointerSliderOne = makeSlider('psOne');
    document.body.appendChild(pointerSliderOne);

    psp = new PointerSizePlugin(pointerSliderOne);

    psp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'pointersize-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({ iframeSelector: '#pointersize-plugin-iframe' }).client.trigger(
      'features'
    );

    //pointer sliders
    expect(psp.sliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(psp.sliders[0].value).to.equal('0.5');

    psp.sliders[0].value = 1;
    psp.sliders[0].dispatchEvent(initEvent('change'));

    expect(psp.sliders[0].value).to.equal('1');
  });
});
