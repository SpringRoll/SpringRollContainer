import { Container, LayersPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';
import { makeSlider } from '../../TestingUtils';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('LayersPlugin', () => {
  let lsp;

  before(() => {
    const sliderOne = makeSlider('lssOne');
    const sliderTwo = makeSlider('lssTwo');

    document.body.append(sliderOne, sliderTwo);

    lsp = new LayersPlugin('#lssOne, #lssTwo');
    lsp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'layers-plugin-iframe';
    document.body.appendChild(iframe);

    new Container('#layers-plugin-iframe').client.trigger('features');

    expect(lsp.sliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(lsp.sliders[1].slider).to.be.instanceof(HTMLInputElement);
  });

  it('.onLayerValueChange()', () => {
    expect(lsp.sliders[0].value).to.equal('0');
    expect(lsp.sliders[1].value).to.equal('0');

    lsp.sliders[0].value = 1;
    lsp.sliders[0].dispatchEvent(initEvent('change'));

    expect(lsp.sliders[0].value).to.equal('1');
    expect(lsp.sliders[1].value).to.equal('1');
    expect(lsp.currentValue).to.equal(1);

    lsp.sliders[0].value = 1.5;
    lsp.sliders[0].dispatchEvent(initEvent('change'));

    expect(lsp.sliders[0].value).to.equal('1');
    expect(lsp.sliders[1].value).to.equal('1');
    expect(lsp.currentValue).to.equal(1);

    lsp.sliders[1].value = 0;
    lsp.sliders[1].dispatchEvent(initEvent('change'));

    expect(lsp.sliders[0].value).to.equal('0');
    expect(lsp.sliders[1].value).to.equal('0');
    expect(lsp.currentValue).to.equal(0);

    lsp.sliders[1].value = -1;
    lsp.sliders[1].dispatchEvent(initEvent('change'));

    expect(lsp.sliders[0].value).to.equal('0');
    expect(lsp.sliders[1].value).to.equal('0');
    expect(lsp.currentValue).to.equal(0);
  });

  it('should work without any controls', () => {
    //set up empty plugin
    lsp = new LayersPlugin();
    lsp.preload({ client: new Bellhop() });
    lsp.init();
    lsp.client.trigger('features', {});
  });

  it('should work with an HTMLElement as parameter', () => {
    const slider = makeSlider('lssTwo');
    document.body.appendChild(slider);

    lsp = new LayersPlugin(slider);
    lsp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'layers-plugin-iframe';
    document.body.appendChild(iframe);

    new Container('#layers-plugin-iframe').client.trigger('features');

    expect(lsp.sliders[0].slider).to.be.instanceof(HTMLInputElement);
    expect(lsp.sliders[0].value).to.equal('0');

    lsp.sliders[0].value = 1;
    lsp.sliders[0].dispatchEvent(initEvent('change'));

    expect(lsp.sliders[0].value).to.equal('1');
  });

});
