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
    const sliderOne = document.createElement('input');
    sliderOne.type = 'range';
    sliderOne.id = 'lssOne';
    document.body.appendChild(sliderOne);

    const sliderTwo = document.createElement('input');
    sliderTwo.type = 'range';
    sliderTwo.id = 'lssTwo';
    document.body.appendChild(sliderTwo);

    lsp = new LayersPlugin({
      layersSliders: '#lssOne, #lssTwo'
    });
    lsp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'layers-plugin-iframe';
    document.body.appendChild(iframe);

    new Container({
      iframeSelector: '#layers-plugin-iframe'
    }).client.trigger('features');

    expect(lsp.layersSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(lsp.layersSliders[1].slider).to.be.instanceof(HTMLInputElement);
  });

  it('.onLayerValueChange()', () => {
    expect(lsp.layersSliders[0].value).to.equal('0');
    expect(lsp.layersSliders[1].value).to.equal('0');

    lsp.layersSliders[0].value = 1;
    lsp.layersSliders[0].dispatchEvent(initEvent('change'));

    expect(lsp.layersSliders[0].value).to.equal('1');
    expect(lsp.layersSliders[1].value).to.equal('1');
    expect(lsp.layerValue).to.equal(1);

    lsp.layersSliders[0].value = 1.5;
    lsp.layersSliders[0].dispatchEvent(initEvent('change'));

    expect(lsp.layersSliders[0].value).to.equal('1');
    expect(lsp.layersSliders[1].value).to.equal('1');
    expect(lsp.layerValue).to.equal(1);

    lsp.layersSliders[1].value = 0;
    lsp.layersSliders[1].dispatchEvent(initEvent('change'));

    expect(lsp.layersSliders[0].value).to.equal('0');
    expect(lsp.layersSliders[1].value).to.equal('0');
    expect(lsp.layerValue).to.equal(0);

    lsp.layersSliders[1].value = -1;
    lsp.layersSliders[1].dispatchEvent(initEvent('change'));

    expect(lsp.layersSliders[0].value).to.equal('0');
    expect(lsp.layersSliders[1].value).to.equal('0');
    expect(lsp.layerValue).to.equal(0);
  });

  it('should work without any controls', () => {
    //set up empty plugin
    lsp = new LayersPlugin();
    lsp.preload({ client: new Bellhop() });
    lsp.init();
    lsp.client.trigger('features', {});
  });

  it('should work with an HTMLElement as parameter', () => {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'lssTwo';
    document.body.appendChild(slider);

    lsp = new LayersPlugin({
      layersSliders: slider
    });
    lsp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'layers-plugin-iframe';
    document.body.appendChild(iframe);

    new Container({
      iframeSelector: '#layers-plugin-iframe'
    }).client.trigger('features');

    expect(lsp.layersSliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(lsp.layersSliders[0].value).to.equal('0');

    lsp.layersSliders[0].value = 1;
    lsp.layersSliders[0].dispatchEvent(initEvent('change'));

    expect(lsp.layersSliders[0].value).to.equal('1');
  });

});
