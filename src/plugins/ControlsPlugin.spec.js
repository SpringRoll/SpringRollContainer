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
      if (/Button/.test(key)) {
        const button = document.createElement('button');
        button.id = options[key];
        options[key] = `#${options[key]}`;
        document.body.appendChild(button);
      } else {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = options[key];
        options[key] = `#${options[key]}`;
        document.body.appendChild(slider);
      }
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
    cp.sensitivitySlider.value = 1;
    cp.sensitivitySlider.dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySlider.value).to.equal('1');

    cp.sensitivitySlider.value = 0.1;
    cp.sensitivitySlider.dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySlider.value).to.equal('0.1');
  });
});
