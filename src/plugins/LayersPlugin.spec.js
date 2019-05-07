import { Container, LayersPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('LayersPlugin', () => {
  let lp;
  const options = {
    layersCheckBoxes: 'lcb'
  };

  before(() => {
    document.body.innerHTML = '';
    Object.keys(options).forEach(key => {
      const form = document.createElement('form');
      form.id = options[key];
      const cb1 = document.createElement('input');
      cb1.type = 'checkbox';
      cb1.name = 'layer';
      cb1.value = 'layer1';
      cb1.id = 'layer1';
      const cb2 = document.createElement('input');
      cb2.type = 'checkbox';
      cb2.name = 'layer';
      cb2.value = 'layer2';
      cb2.id = 'layer2';

      form.appendChild(cb1);
      form.appendChild(cb2);

      options[key] = `#${options[key]}`;
      document.body.appendChild(form);
    });
    lp = new LayersPlugin(options);
    lp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'layers-plugin-iframe';
    document.body.appendChild(iframe);
    expect(lp.layersCheckBoxes).to.be.instanceof(HTMLFormElement);
    new Container('#layers-plugin-iframe').client.trigger('features');
  });

  it('.onLayerToggle()', () => {
    lp.layersCheckBoxes.elements['layer1'].dispatchEvent(initEvent('click'));

    expect(lp.layersCheckBoxes['layer1'].checked).to.be.true;
    expect(lp.layersToggleState['layer1']).to.be.true;

    lp.layersCheckBoxes.elements['layer1'].dispatchEvent(initEvent('click'));

    expect(lp.layersCheckBoxes['layer1'].checked).to.be.false;
    expect(lp.layersToggleState['layer1']).to.be.false;
  });

  it('.onLayerToggle()', () => {
    lp.layersCheckBoxes.elements['layer2'].dispatchEvent(initEvent('click'));

    expect(lp.layersCheckBoxes['layer2'].checked).to.be.true;
    expect(lp.layersToggleState['layer2']).to.be.true;

    lp.layersCheckBoxes.elements['layer2'].dispatchEvent(initEvent('click'));

    expect(lp.layersCheckBoxes['layer2'].checked).to.be.false;
    expect(lp.layersToggleState['layer2']).to.be.false;
  });
});
