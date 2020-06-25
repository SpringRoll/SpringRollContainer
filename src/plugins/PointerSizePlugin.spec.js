import { Container, PointerSizePlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('PointerSizePlugin', () => {
  let psp;

  before(() => {
    document.body.innerHTML = '';

    const pointerSliderOne = document.createElement('input');
    pointerSliderOne.type = 'range';
    pointerSliderOne.id = 'psOne';
    document.body.appendChild(pointerSliderOne);
    const pointerSliderTwo = document.createElement('input');
    pointerSliderTwo.type = 'range';
    pointerSliderTwo.id = 'psTwo';
    document.body.appendChild(pointerSliderTwo);

    psp = new PointerSizePlugin({
      pointerSliders: '#psOne, #psTwo',
    });
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
    psp.pointerSliders[0].value = 1;
    psp.pointerSliders[0].dispatchEvent(initEvent('change'));

    expect(psp.pointerSliders[0].value).to.equal('1');
    expect(psp.pointerSliders[1].value).to.equal('1');
    expect(psp.pointerSize).to.equal(1);

    psp.pointerSliders[0].value = 0;
    psp.pointerSliders[0].dispatchEvent(initEvent('change'));

    expect(psp.pointerSliders[0].value).to.equal('0');
    expect(psp.pointerSliders[1].value).to.equal('0');
    expect(psp.pointerSize).to.equal(0);

    psp.pointerSliders[1].value = 1.1;
    psp.pointerSliders[1].dispatchEvent(initEvent('change'));

    expect(psp.pointerSliders[0].value).to.equal('1');
    expect(psp.pointerSliders[1].value).to.equal('1');
    expect(psp.pointerSize).to.equal(1);

    psp.pointerSliders[1].value = -1;
    psp.pointerSliders[1].dispatchEvent(initEvent('change'));

    expect(psp.pointerSliders[0].value).to.equal('0');
    expect(psp.pointerSliders[1].value).to.equal('0');
    expect(psp.pointerSize).to.equal(0);
  });

  it('should work with HTML Elements as paramters', () => {

    //plugin set psp
    document.body.innerHTML = '';
    const pointerSliderOne = document.createElement('input');
    pointerSliderOne.type = 'range';
    pointerSliderOne.id = 'psOne';
    document.body.appendChild(pointerSliderOne);


    psp = new PointerSizePlugin({
      pointerSliders: pointerSliderOne,
    });

    psp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'pointersize-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({ iframeSelector: '#pointersize-plugin-iframe' }).client.trigger(
      'features'
    );

    //pointer sliders
    expect(psp.pointerSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(psp.pointerSliders[0].value).to.equal('0.5');

    psp.pointerSliders[0].value = 1;
    psp.pointerSliders[0].dispatchEvent(initEvent('change'));

    expect(psp.pointerSliders[0].value).to.equal('1');
  });
});
