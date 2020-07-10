import { Container, SliderPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';
import { makeSlider } from '../../TestingUtils';


describe('SliderPlugin', () => {
  let sp;

  before(() => {
    document.body.innerHTML = '';

    const sliderOne = makeSlider('slider-one');
    const sliderTwo = makeSlider('slider-two');

    document.body.append(sliderOne, sliderTwo);

    sp = new SliderPlugin('#slider-one, #slider-two', 'slider-plugin', {featureName: 'sliderPlugin' });
    sp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'radio-group-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#radio-group-plugin-iframe').client.trigger(
      'features'
    );

    expect(sp.slidersLength).to.equal(2);
    expect(sp.currentValue).to.equal('0.5');
  });

  it('set currentValue', () => {
    sp.currentValue = '0.7';
    expect(sp.currentValue).to.equal(0.7);
    expect(sp.sliders[0].value).to.equal('0.7');
    expect(sp.sliders[1].value).to.equal('0.7');

    sp.currentValue = '0.1';
    expect(sp.currentValue).to.equal(0.1);
    expect(sp.sliders[0].value).to.equal('0.1');
    expect(sp.sliders[1].value).to.equal('0.1');
  });

});
