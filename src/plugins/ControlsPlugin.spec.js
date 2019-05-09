import { Container, ControlsPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('ControlsPlugin', () => {
  let cp;
  const options = {
    sensitivitySlider: 'ss'
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
    cp = new ControlsPlugin(options);
    cp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'controls-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#controls-plugin-iframe').client.trigger('features');
  });

  it('.onControlSensitivityChange()', () => {
    cp.sensitivitySlider.slider.value = 1;

    cp.sensitivitySlider.slider.dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySlider.slider.value).to.equal('1');
    expect(cp.controlSensitivity).to.equal(1);

    cp.sensitivitySlider.slider.value = 0.1;

    cp.sensitivitySlider.slider.dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySlider.slider.value).to.equal('0.1');
    expect(cp.controlSensitivity).to.equal(0.1);
  });
});
