import { Container, DifficultyPlugin } from '../index';
import { Bellhop } from 'bellhop-iframe';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('DifficultyPlugin', () => {
  let dp;

  before(() => {
    document.body.innerHTML = '';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'ss';
    document.body.appendChild(slider);
    dp = new DifficultyPlugin({ difficultySlider: '#ss' });
    dp.preload({ client: new Bellhop() });
  });

  it('construct', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'difficulty-plugin-iframe';
    document.body.appendChild(iframe);
    new Container({
      iframeSelector: '#difficulty-plugin-iframe'
    }).client.trigger('features');
  });

  it('.onControldifficultyChange()', () => {
    dp.difficultySlider.value = 1;

    dp.difficultySlider.dispatchEvent(initEvent('change'));

    expect(dp.difficultySlider.value).to.equal('1');
    expect(dp.difficulty).to.equal(1);

    dp.difficultySlider.value = 0.1;

    dp.difficultySlider.dispatchEvent(initEvent('change'));

    expect(dp.difficultySlider.value).to.equal('0.1');
    expect(dp.difficulty).to.equal(0.1);
  });
});
