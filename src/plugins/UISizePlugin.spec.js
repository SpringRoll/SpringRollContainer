import { Container, UISizePlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('UISizePlugin', () => {
  let up;
  const options = {
    pointerSlider: 'ps',
    buttonSlider: 'bs'
  };

  before(() => {
    document.body.innerHTML = '';
    Object.keys(options).forEach(key => {
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.id = options[key];
      options[key] = `#${options[key]}`;
      document.body.appendChild(slider);
    });
    up = new UISizePlugin(options);
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
    up.pointerSlider.value = 1;
    up.pointerSlider.dispatchEvent(initEvent('change'));

    expect(up.pointerSlider.value).to.equal('1');
    expect(up.pointerSize).to.equal(1);

    up.pointerSlider.value = 0.01;
    up.pointerSlider.dispatchEvent(initEvent('change'));

    expect(up.pointerSlider.value).to.equal('0.01');
    expect(up.pointerSize).to.equal(0.01);
  });

  it('.onButtonSizeChange()', () => {
    up.buttonSlider.value = 1;
    up.buttonSlider.dispatchEvent(initEvent('change'));

    expect(up.buttonSlider.value).to.equal('1');
    expect(up.buttonSize).to.equal(1);

    up.buttonSlider.value = 0.1;
    up.buttonSlider.dispatchEvent(initEvent('change'));

    expect(up.buttonSlider.value).to.equal('0.1');
    expect(up.buttonSize).to.equal(0.1);
  });
});
