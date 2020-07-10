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
    const sliderOne = document.createElement('input');
    sliderOne.type = 'range';
    sliderOne.id = 'ssOne';

    const sliderTwo = document.createElement('input');
    sliderTwo.type = 'range';
    sliderTwo.id = 'ssTwo';

    const keyContainerOne = document.createElement('div');
    keyContainerOne.id = 'keyContainerOne';
    const keyContainerTwo = document.createElement('div');
    keyContainerTwo.id = 'keyContainerTwo';

    document.body.appendChild(sliderOne);
    document.body.appendChild(sliderTwo);
    document.body.appendChild(keyContainerOne);
    document.body.appendChild(keyContainerTwo);

    cp = new ControlsPlugin({
      sensitivitySliders: '#ssOne, #ssTwo',
      keyContainers: '#keyContainerOne, #keyContainerTwo'
    });
    cp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'controls-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#controls-plugin-iframe', { plugins: [cp] });
    cp.init();
    cp.client.trigger('features', {
      controlSensitivity: true,
      keyBinding: true
    });
    cp.client.trigger('keyBindings', [
      { actionName: 'Up', defaultKey: 'w' },
      { actionName: 'Down', defaultKey: 's' }
    ]);


    expect(cp.buttons[0].length).to.equal(2);
    expect(cp.buttons[1].length).to.equal(2);
  });

  it('.onControlSensitivityChange()', () => {
    cp.sensitivitySliders[0].value = 1;
    cp.sensitivitySliders[0].dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySliders[0].value).to.equal('1');
    expect(cp.sensitivitySliders[1].value).to.equal('1');
    expect(cp.controlSensitivity).to.equal(1);

    cp.sensitivitySliders[0].value = 0;
    cp.sensitivitySliders[0].dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySliders[0].value).to.equal('0');
    expect(cp.sensitivitySliders[1].value).to.equal('0');
    expect(cp.controlSensitivity).to.equal(0);

    cp.sensitivitySliders[1].value = 1.1;
    cp.sensitivitySliders[1].dispatchEvent(initEvent('change'));


    expect(cp.sensitivitySliders[0].value).to.equal('1');
    expect(cp.sensitivitySliders[1].value).to.equal('1');
    expect(cp.controlSensitivity).to.equal(1);

    cp.sensitivitySliders[1].value = -1;
    cp.sensitivitySliders[1].dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySliders[0].value).to.equal('0');
    expect(cp.sensitivitySliders[1].value).to.equal('0');
    expect(cp.controlSensitivity).to.equal(0);
  });

  it('.onKeyButtonClick()', () => {
    const event = document.createEvent('Event');
    event.key = 'a';
    event.initEvent('keyup');

    expect(cp.keyBindings.Up.currentKey).to.equal('w');
    cp.buttons[0][0].click();
    document.dispatchEvent(event);
    expect(cp.keyBindings.Up.currentKey).to.equal('a');

    expect(cp.keyBindings.Down.currentKey).to.equal('s');
    cp.buttons[1][1].click();
    event.key = 'h';
    document.dispatchEvent(event);
    expect(cp.keyBindings.Down.currentKey).to.equal('h');

    expect(cp.buttons[0][0].textContent).to.equal('a');
    expect(cp.buttons[1][0].textContent).to.equal('a');
    expect(cp.buttons[0][1].textContent).to.equal('h');
    expect(cp.buttons[1][1].textContent).to.equal('h');
  });

  it('should work without any controls', () => {
    //set up empty plugin
    cp = new ControlsPlugin();
    cp.preload({ client: new Bellhop() });
    cp.init();
    cp.client.trigger('features', {});
  });

  it('should work with an HTMLElement as parameters', () => {
    //Plugin re-setup
    document.body.innerHTML = '';
    const sliderOne = document.createElement('input');
    sliderOne.type = 'range';
    sliderOne.id = 'ssOne';

    const keyContainerOne = document.createElement('div');
    keyContainerOne.id = 'keyContainerOne';

    document.body.appendChild(sliderOne);
    document.body.appendChild(keyContainerOne);

    cp = new ControlsPlugin({
      sensitivitySliders: sliderOne,
      keyContainers: keyContainerOne
    });
    cp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'controls-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#controls-plugin-iframe', {plugins: [cp] });
    cp.init();
    cp.client.trigger('features', {
      controlSensitivity: true,
      keyBinding: true
    });
    cp.client.trigger('keyBindings', [
      { actionName: 'Up', defaultKey: 'w' },
      { actionName: 'Down', defaultKey: 's' }
    ]);

    const event = document.createEvent('Event');
    event.key = 'a';
    event.initEvent('keyup');

    expect(cp.keyBindings.Up.currentKey).to.equal('w');
    cp.buttons[0][0].click();
    document.dispatchEvent(event);
    expect(cp.keyBindings.Up.currentKey).to.equal('a');


    cp.sensitivitySliders[0].value = 1;
    cp.sensitivitySliders[0].dispatchEvent(initEvent('change'));

    expect(cp.sensitivitySliders[0].value).to.equal('1');
    expect(cp.controlSensitivity).to.equal(1);
  });
});
