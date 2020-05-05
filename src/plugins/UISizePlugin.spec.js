import { Container, UISizePlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('UISizePlugin', () => {
  let up;

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

    const buttonSliderOne = document.createElement('input');
    buttonSliderOne.type = 'range';
    buttonSliderOne.id = 'bsOne';
    document.body.appendChild(buttonSliderOne);
    const buttonSliderTwo = document.createElement('input');
    buttonSliderTwo.type = 'range';
    buttonSliderTwo.id = 'bsTwo';
    document.body.appendChild(buttonSliderTwo);

    up = new UISizePlugin({
      pointerSliders: '#psOne, #psTwo',
      buttonSliders: '#bsOne, #bsTwo' //worlds worst console name
    });
    up.preload({ client: new Bellhop() });
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
    up.pointerSliders[0].value = 1;
    up.pointerSliders[0].dispatchEvent(initEvent('change'));

    expect(up.pointerSliders[0].value).to.equal('1');
    expect(up.pointerSliders[1].value).to.equal('1');
    expect(up.pointerSize).to.equal(1);

    up.pointerSliders[0].value = 0;
    up.pointerSliders[0].dispatchEvent(initEvent('change'));

    expect(up.pointerSliders[0].value).to.equal('0');
    expect(up.pointerSliders[1].value).to.equal('0');
    expect(up.pointerSize).to.equal(0);

    up.pointerSliders[1].value = 1.1;
    up.pointerSliders[1].dispatchEvent(initEvent('change'));

    expect(up.pointerSliders[0].value).to.equal('1');
    expect(up.pointerSliders[1].value).to.equal('1');
    expect(up.pointerSize).to.equal(1);

    up.pointerSliders[1].value = -1;
    up.pointerSliders[1].dispatchEvent(initEvent('change'));

    expect(up.pointerSliders[0].value).to.equal('0');
    expect(up.pointerSliders[1].value).to.equal('0');
    expect(up.pointerSize).to.equal(0);
  });

  it('.onButtonSizeChange()', () => {
    up.buttonSliders[0].value = 1;
    up.buttonSliders[0].dispatchEvent(initEvent('change'));

    expect(up.buttonSliders[0].value).to.equal('1');
    expect(up.buttonSliders[1].value).to.equal('1');
    expect(up.buttonSize).to.equal(1);

    up.buttonSliders[0].value = 0;
    up.buttonSliders[0].dispatchEvent(initEvent('change'));

    expect(up.buttonSliders[0].value).to.equal('0');
    expect(up.buttonSliders[1].value).to.equal('0');
    expect(up.buttonSize).to.equal(0);

    up.buttonSliders[1].value = 1.1;
    up.buttonSliders[1].dispatchEvent(initEvent('change'));

    expect(up.buttonSliders[0].value).to.equal('1');
    expect(up.buttonSliders[1].value).to.equal('1');
    expect(up.buttonSize).to.equal(1);

    up.buttonSliders[1].value = -1;
    up.buttonSliders[1].dispatchEvent(initEvent('change'));

    expect(up.buttonSliders[0].value).to.equal('0');
    expect(up.buttonSliders[1].value).to.equal('0');
    expect(up.buttonSize).to.equal(0);
  });

  it('should work without any controls', () => {
    //set up empty plugin
    up = new UISizePlugin();
    up.preload({ client: new Bellhop() });
    up.init();
    up.client.trigger('features', {});
  });

  it('should work with HTML Elements as paramters', () => {

    //plugin set up
    document.body.innerHTML = '';
    const pointerSliderOne = document.createElement('input');
    pointerSliderOne.type = 'range';
    pointerSliderOne.id = 'psOne';
    document.body.appendChild(pointerSliderOne);

    const buttonSliderOne = document.createElement('input');
    buttonSliderOne.type = 'range';
    buttonSliderOne.id = 'bsOne';
    document.body.appendChild(buttonSliderOne);

    up = new UISizePlugin({
      pointerSliders: pointerSliderOne,
      buttonSliders: buttonSliderOne //worlds worst console name
    });
    up.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'uisize-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({ iframeSelector: '#uisize-plugin-iframe' }).client.trigger(
      'features'
    );

    //pointer sliders
    expect(up.pointerSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(up.pointerSliders[0].value).to.equal('0.5');

    up.pointerSliders[0].value = 1;
    up.pointerSliders[0].dispatchEvent(initEvent('change'));

    expect(up.pointerSliders[0].value).to.equal('1');

    //button sliders
    expect(up.buttonSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(up.buttonSliders[0].value).to.equal('0.5');

    up.buttonSliders[0].value = 1;
    up.buttonSliders[0].dispatchEvent(initEvent('change'));

    expect(up.buttonSliders[0].value).to.equal('1');
  });
});
