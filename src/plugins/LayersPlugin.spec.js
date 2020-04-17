import { Container, LayersPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('LayersPlugin', () => {
  let lsp;

  before(() => {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'lss';
    document.body.appendChild(slider);

    lsp = new LayersPlugin({
      layersSlider: '#lss'
    });
    lsp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'layers-plugin-iframe';
    document.body.appendChild(iframe);

    expect(lsp.layersSlider.slider).to.be.instanceof(HTMLInputElement);
    new Container({
      iframeSelector: '#layers-plugin-iframe'
    }).client.trigger('features');
  });

  it('.onLayerValueChange()', () => {
    expect(lsp.layersSlider.value).to.equal('0');

    lsp.layersSlider.value = 1;
    lsp.layersSlider.dispatchEvent(initEvent('change'));

    expect(lsp.layersSlider.value).to.equal('1');
    expect(lsp.layerValue).to.equal(1);

    lsp.layersSlider.value = 1.5;
    lsp.layersSlider.dispatchEvent(initEvent('change'));

    expect(lsp.layersSlider.value).to.equal('1');
    expect(lsp.layerValue).to.equal(1);

    lsp.layersSlider.value = 0;
    lsp.layersSlider.dispatchEvent(initEvent('change'));

    expect(lsp.layersSlider.value).to.equal('0');
    expect(lsp.layerValue).to.equal(0);

    lsp.layersSlider.value = -1;
    lsp.layersSlider.dispatchEvent(initEvent('change'));

    expect(lsp.layersSlider.value).to.equal('0');
    expect(lsp.layerValue).to.equal(0);
  });

  it('Plugin should work without any controls', () => {
    //set up empty plugin
    lsp = new LayersPlugin();
    lsp.preload({ client: new Bellhop() });
    lsp.init();
    lsp.client.trigger('features', {
    });
  });
});
