import { Container, DragThresholdScalePlugin } from '../index';
import { makeSlider } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('DragThresholdScalePlugin', () => {
  let dths;

  before(() => {
    document.body.innerHTML = '';
    const sliderOne = makeSlider('drag-threshold-one');
    const sliderTwo = makeSlider('drag-threshold-two');

    document.body.append(sliderOne, sliderTwo);

    dths = new DragThresholdScalePlugin('#drag-threshold-one, #drag-threshold-two');
    dths.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#difficulty-plugin-iframe', {plugins: [dths]}).client.trigger(
      'features'
    );
  });

  it('.onDragThresholdScaleChange()', () => {
    dths.sliders[0].value = 1;
    dths.sliders[0].dispatchEvent(initEvent('change'));

    expect(dths.sliders[0].value).to.equal('1');
    expect(dths.sliders[1].value).to.equal('1');
    expect(dths.currentValue).to.equal(1);

    dths.sliders[0].value = 0;
    dths.sliders[0].dispatchEvent(initEvent('change'));

    expect(dths.sliders[0].value).to.equal('0');
    expect(dths.sliders[1].value).to.equal('0');
    expect(dths.currentValue).to.equal(0);

    dths.sliders[1].value = 1.1;
    dths.sliders[1].dispatchEvent(initEvent('change'));

    expect(dths.sliders[0].value).to.equal('1');
    expect(dths.sliders[1].value).to.equal('1');
    expect(dths.currentValue).to.equal(1);

    dths.sliders[1].value = -1;
    dths.sliders[1].dispatchEvent(initEvent('change'));

    expect(dths.sliders[0].value).to.equal('0');
    expect(dths.sliders[1].value).to.equal('0');
    expect(dths.currentValue).to.equal(0);
  });


  it('Plugin should work without any controls', () => {
    //set up empty plugin
    dths = new DragThresholdScalePlugin();
    dths.preload({ client: new Bellhop() });
    dths.init();
    dths.client.trigger('features', {});
  });
});
