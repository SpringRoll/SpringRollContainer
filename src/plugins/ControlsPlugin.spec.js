import { Container, ControlsPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('ControlsPlugin', () => {
  let cp;

  before(() => {
    document.body.innerHTML = '';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'ss';

    const keyContainer = document.createElement('div');
    keyContainer.id = 'keyContainer';

    document.body.appendChild(slider);
    document.body.appendChild(keyContainer);

    cp = new ControlsPlugin({
      sensitivitySlider: '#ss',
      keyContainer: '#keyContainer'
    });
    cp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'controls-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({ iframeSelector: '#controls-plugin-iframe', plugins: [cp] });
    cp.init();
    cp.client.trigger('features', {
      controlSensitivity: true,
      keyBinding: true
    });
    cp.client.trigger('keyBindings', [
      { actionName: 'Up', defaultKey: 'w' },
      { actionName: 'Down', defaultKey: 's' }
    ]);

    expect(cp.buttons.length).to.equal(2);
  });

  it('.onControlSensitivityChange()', () => {
    cp.sensitivitySlider.value = 1;
    cp.sensitivitySlider.dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySlider.value).to.equal('1');
    expect(cp.controlSensitivity).to.equal(1);

    cp.sensitivitySlider.value = 0;
    cp.sensitivitySlider.dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySlider.value).to.equal('0');
    expect(cp.controlSensitivity).to.equal(0);

    cp.sensitivitySlider.value = 1.1;
    cp.sensitivitySlider.dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySlider.value).to.equal('1');
    expect(cp.controlSensitivity).to.equal(1);

    cp.sensitivitySlider.value = -1;
    cp.sensitivitySlider.dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySlider.value).to.equal('0');
    expect(cp.controlSensitivity).to.equal(0);
  });

  it('.onKeyButtonClick()', () => {
    const event = document.createEvent('Event');
    event.key = 'a';
    event.initEvent('keyup');

    expect(cp.keyBindings.Up.currentKey).to.equal('w');
    cp.buttons[0].click();
    document.dispatchEvent(event);
    expect(cp.keyBindings.Up.currentKey).to.equal('a');

    expect(cp.keyBindings.Down.currentKey).to.equal('s');
    cp.buttons[1].click();
    event.key = 'h';
    document.dispatchEvent(event);
    expect(cp.keyBindings.Down.currentKey).to.equal('h');
  });

  it('Plugin should work without any controls', () => {
    //set up empty plugin
    cp = new ControlsPlugin();
    cp.preload({ client: new Bellhop() });
    cp.init();
    cp.client.trigger('features', {});
  });
});
