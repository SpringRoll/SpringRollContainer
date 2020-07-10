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
    const dropdownOne = document.createElement('select');
    dropdownOne.id = 'ddOne';
    const dropdownTwo = document.createElement('select');
    dropdownTwo.id = 'ddTwo';

    document.body.appendChild(dropdownOne);
    document.body.appendChild(dropdownTwo);

    cvp = new ColorVisionPlugin({
      colorSelects: '#ddOne, #ddTwo'
    });
    cvp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'color-filter-plugin-iframe';
    document.body.appendChild(iframe);
    new Container('#color-filter-plugin-iframe', {
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

    expect(cvp.colorDropdowns[0].options.length).to.equal(3); //discard the 'invalid'
  });

  it('.onColorChange()', () => {
    expect(cvp.colorDropdowns[0].value).to.equal('none');
    expect(cvp.colorDropdowns[1].value).to.equal('none');

    cvp.colorDropdowns[0].value = 'tritanopia';
    cvp.colorDropdowns[0].dispatchEvent(initEvent('change'));

    expect(cvp.colorDropdowns[0].value).to.equal('tritanopia');
    expect(cvp.colorDropdowns[1].value).to.equal('tritanopia');

    cvp.colorDropdowns[1].value = 'deuteranopia';
    cvp.colorDropdowns[1].dispatchEvent(initEvent('change'));

    expect(cvp.colorDropdowns[0].value).to.equal('deuteranopia');
    expect(cvp.colorDropdowns[1].value).to.equal('deuteranopia');
  });

  it('should work without any controls', () => {
    //set up empty plugin
    cvp = new ColorVisionPlugin();
    cvp.preload({ client: new Bellhop() });
    new Container('#color-filter-plugin-iframe', {
      plugins: [cvp]
    });
    cvp.init();
    cvp.client.trigger('features', {});
  });


  it('should work with HTMLElement as parameter', () => {

    //Plugin re-setup
    const dropdownOne = document.createElement('select');
    dropdownOne.id = 'ddOne';
    document.body.appendChild(dropdownOne);

    cvp = new ColorVisionPlugin({colorSelects: dropdownOne});
    cvp.preload({ client: new Bellhop() });

    const iframe = document.createElement('iframe');
    iframe.id = 'color-filter-plugin-iframe';
    document.body.appendChild(iframe);

    new Container('#color-filter-plugin-iframe', {
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
    ]);

    //Actual tests
    expect(cvp.colorDropdowns[0].value).to.equal('none');

    cvp.colorDropdowns[0].value = 'tritanopia';
    cvp.colorDropdowns[0].dispatchEvent(initEvent('change'));

    expect(cvp.colorDropdowns[0].value).to.equal('tritanopia');
  });
});
