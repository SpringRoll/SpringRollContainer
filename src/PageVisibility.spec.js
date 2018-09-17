import { PageVisibility } from './PageVisibility';

let pv;
const event = {
  visibilitychange: false,
  blur: false,
  focus: false,
  pagehide: false,
  pageshow: false
};

/*eslint-disable */
const onEvent = function($event) {
  event[$event.type] = true;
};

/*eslint-enable */
describe('PageVisibility', () => {
  it('constructor', () => {
    pv = new PageVisibility(onEvent, onEvent);
    expect(typeof pv.onBlur).to.equal('function');
    expect(typeof pv.onFocus).to.equal('function');
    expect(pv._enabled).to.be.true;
  });

  it('.enabled()', () => {
    expect(pv.enabled).to.equal(pv._enabled);
  });

  it('on document.visibilitychange', () => {
    expect(event.visibilitychange).to.be.false;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(event.visibilitychange).to.be.true;
    event.visibilitychange = false;
  });
  it('on window.blur', () => {
    expect(event.blur).to.be.false;
    window.dispatchEvent(new Event('blur'));
    expect(event.blur).to.be.true;
  });
  it('on window.focus', () => {
    expect(event.focus).to.be.false;
    window.dispatchEvent(new Event('focus'));
    expect(event.focus).to.be.true;
  });
  it('on window.pageHide', () => {
    expect(event.pagehide).to.be.false;
    window.dispatchEvent(new Event('pagehide'));
    expect(event.pagehide).to.be.true;
  });
  it('on window.pageshow', () => {
    expect(event.pageshow).to.be.false;
    window.dispatchEvent(new Event('pageshow'));
    expect(event.pageshow).to.be.true;
  });
  it('on window.visibilitychange', () => {
    expect(event.visibilitychange).to.be.false;
    window.dispatchEvent(new Event('visibilitychange'));
    expect(event.visibilitychange).to.be.true;
  });

  it('.destroy()', () => {
    expect(pv.enabled).to.be.true;
    expect(typeof pv.onToggle).to.equal('function');
    expect(typeof pv.onBlur).to.equal('function');
    expect(typeof pv.onFocus).to.equal('function');

    pv.destroy();

    expect(pv.enabled).to.be.false;
    expect(pv.onToggle).to.be.null;
    expect(pv.onBlur).to.be.null;
    expect(pv.onFocus).to.be.null;
  });
});
