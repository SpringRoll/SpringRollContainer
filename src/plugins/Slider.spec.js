import { Slider } from './Slider';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('Slider', () => {
  let s;

  before(() => {
    document.body.innerHTML = '';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'slider';
    document.body.appendChild(slider);

    s = new Slider(document.querySelector('#slider'), 'slider', 0, 1, 0.1);
  });

  it('construct', () => {
    expect(s.slider).to.be.instanceof(HTMLInputElement);
    expect(s).to.be.instanceof(Slider);
  });

  it('.sliderRange()', () => {
    expect(s.sliderRange(0.5)).to.equal(0.5);
    expect(s.sliderRange(1.1)).to.equal(1);
    expect(s.sliderRange(-1.1)).to.equal(0);
    expect(s.sliderRange(0.1)).to.equal(0.1);
    expect(s.sliderRange(1)).to.equal(1);
  });

  it('.enableSliderEvents()', done => {
    s.enableSliderEvents(() => {
      done();
    });

    s.slider.dispatchEvent(initEvent('change'));
    s.slider.dispatchEvent(initEvent('input'));
  });

  it('.disableSliderEvents()', done => {
    s.enableSliderEvents(() => {
      done();
    });

    s.disableSliderEvents(() => {
      done();
    });
    expect(s.slider.dispatchEvent(initEvent('input'))).to.throw(Error);
    expect(s.slider.dispatchEvent(initEvent('change'))).to.throw(Error);
  });
});
