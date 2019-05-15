import { Slider } from './Slider';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('Slider', () => {
  let sl;

  before(() => {
    document.body.innerHTML = '';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'slider';
    document.body.appendChild(slider);

    sl = new Slider({
      slider: document.querySelector('#slider'),
      control: 'slider'
    });
  });

  it('construct', () => {
    expect(sl.value).to.equal('1');
    expect(sl.slider).to.be.instanceof(HTMLInputElement);
    expect(sl).to.be.instanceof(Slider);
  });

  it('.sliderRange()', () => {
    expect(sl.sliderRange(0.5)).to.equal(0.5);
    expect(sl.sliderRange(1.1)).to.equal(1);
    expect(sl.sliderRange(-1.1)).to.equal(0);
    expect(sl.sliderRange(0.1)).to.equal(0.1);
    expect(sl.sliderRange(1)).to.equal(1);
  });

  it('.enableSliderEvents()', done => {
    sl.enableSliderEvents(() => {
      done();
    });

    sl.slider.dispatchEvent(initEvent('change'));
    sl.slider.dispatchEvent(initEvent('input'));
  });

  it('.disableSliderEvents()', done => {
    sl.enableSliderEvents(() => {
      done();
    });

    sl.disableSliderEvents(() => {
      done();
    });
    expect(sl.slider.dispatchEvent(initEvent('input'))).to.throw(Error);
    expect(sl.slider.dispatchEvent(initEvent('change'))).to.throw(Error);
  });
});
