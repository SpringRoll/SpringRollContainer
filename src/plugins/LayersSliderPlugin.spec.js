import { Container, LayersSliderPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('LayersSliderPlugin', () => {
  let lsp;

  before(() => {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'lss';
    document.body.appendChild(slider);

    lsp = new LayersSliderPlugin({
      layerSlider: '#lss',
      num: 3
    });
    lsp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'layers-slider-plugin-iframe';
    document.body.appendChild(iframe);

    expect(lsp.layerSlider.slider).to.be.instanceof(HTMLInputElement);
    new Container('#layers-slider-plugin-iframe').client.trigger('features');
  });

  it('.onLayerValueChange()', () => {
    expect(lsp.layerSlider.value).to.equal('0');

    lsp.layerSlider.value = 1;
    lsp.layerSlider.dispatchEvent(initEvent('change'));

    expect(lsp.layerSlider.value).to.equal('0.3');
    expect(lsp.layerValue).to.equal(0.3);

    lsp.layerSlider.value = 0.1;
    lsp.layerSlider.dispatchEvent(initEvent('change'));

    expect(lsp.layerSlider.value).to.equal('0.1');
    expect(lsp.layerValue).to.equal(0.1);
  });
});
