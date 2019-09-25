import { Container, ColorVisionPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('ColorVisionPlugin', () => {
  let cvp;

  before(() => {
    document.body.innerHTML = '';
    const dropdown = document.createElement('select');
    dropdown.id = 'dp';

    document.body.appendChild(dropdown);

    cvp = new ColorVisionPlugin({
      colorSelect: '#dp'
    });
    cvp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'color-filter-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({
      iframeSelector: '#color-filter-plugin-iframe',
      plugins: [cvp]
    });
    cvp.init();
    cvp.client.trigger('features', {
      colorVision: true
    });
    cvp.client.trigger('colorFilters', [
      'None',
      'Deuteranopia',
      'Tritanopia',
      'invalid'
    ]);

    expect(cvp.colorDropdown.options.length).to.equal(3); //discard the 'invalid'
  });

  it('.onColorChange()', () => {
    expect(cvp.colorDropdown.value).to.equal('none');

    cvp.colorDropdown.value = 'tritanopia';
    cvp.colorDropdown.dispatchEvent(initEvent('change'));

    expect(cvp.colorDropdown.value).to.equal('tritanopia');
  });
});
