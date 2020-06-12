import { PageVisibility } from './PageVisibility';

//IE 11 work around for testing
const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('PageVisibility', () => {
  let pv;
  let wasCalled = false;
  /*eslint-disable */
  const onEvent = function($event) {
    wasCalled = true;
  };
  beforeEach(() => {
    wasCalled = false;
    pv = new PageVisibility(onEvent, onEvent);
  });
  it('constructor', () => {
    expect(typeof pv.onBlur).to.equal('function');
    expect(typeof pv.onFocus).to.equal('function');
    expect(pv._enabled).to.be.true;
  });

  it('.enabled() - set', () => {
    pv.enabled = false;
    pv.enabled = true;
    expect(pv.enabled).to.equal(pv._enabled);
  });

  it('on document.visibilitychange', () => {
    expect(wasCalled).to.be.false;
    document.dispatchEvent(initEvent('visibilitychange'));
    expect(wasCalled).to.be.true;
  });
  it('on document.blur', () => {
    expect(wasCalled).to.be.false;
    document.dispatchEvent(initEvent('blur'));
    expect(wasCalled).to.be.true;
  });
  it('on document.focus', () => {
    expect(wasCalled).to.be.false;
    document.dispatchEvent(initEvent('focus'));
    expect(wasCalled).to.be.true;
  });
  it('on window.pageHide', () => {
    expect(wasCalled).to.be.false;
    window.dispatchEvent(initEvent('pagehide'));
    expect(wasCalled).to.be.true;
  });
  it('on window.pageshow', () => {
    expect(wasCalled).to.be.false;
    window.dispatchEvent(initEvent('pageshow'));
    expect(wasCalled).to.be.true;
  });
  it('on window.visibilitychange', () => {
    expect(wasCalled).to.be.false;
    window.dispatchEvent(initEvent('visibilitychange'));
    expect(wasCalled).to.be.true;
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
