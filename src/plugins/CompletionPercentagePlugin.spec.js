import { Container, CompletionPercentagePlugin } from '../index';
import { makeSlider } from '../../TestingUtils';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('CompletionPercentagePlugin', () => {
  let cpp;

  before(() => {
    document.body.innerHTML = '';
    const sliderOne = makeSlider('completion-percentage-one');
    const sliderTwo = makeSlider('completion-percentage-two');

    document.body.append(sliderOne, sliderTwo);

    cpp = new CompletionPercentagePlugin('#completion-percentage-one, #completion-percentage-two');
    cpp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#difficulty-plugin-iframe', {plugins: [cpp]}).client.trigger(
      'features'
    );
  });

  it('.onCompletionPercentageChange()', () => {
    cpp.sliders[0].value = 1;
    cpp.sliders[0].dispatchEvent(initEvent('change'));

    expect(cpp.sliders[0].value).to.equal('1');
    expect(cpp.sliders[1].value).to.equal('1');
    expect(cpp.currentValue).to.equal(1);

    cpp.sliders[0].value = 0;
    cpp.sliders[0].dispatchEvent(initEvent('change'));

    expect(cpp.sliders[0].value).to.equal('0');
    expect(cpp.sliders[1].value).to.equal('0');
    expect(cpp.currentValue).to.equal(0);

    cpp.sliders[1].value = 1.1;
    cpp.sliders[1].dispatchEvent(initEvent('change'));

    expect(cpp.sliders[0].value).to.equal('1');
    expect(cpp.sliders[1].value).to.equal('1');
    expect(cpp.currentValue).to.equal(1);

    cpp.sliders[1].value = -1;
    cpp.sliders[1].dispatchEvent(initEvent('change'));

    expect(cpp.sliders[0].value).to.equal('0');
    expect(cpp.sliders[1].value).to.equal('0');
    expect(cpp.currentValue).to.equal(0);
  });


  it('Plugin should work without any controls', () => {
    //set up empty plugin
    cpp = new CompletionPercentagePlugin();
    cpp.preload({ client: new Bellhop() });
    cpp.init();
    cpp.client.trigger('features', {});
  });
});
