import { PageVisibility } from './PageVisibility';

describe('PageVisibility', () => {
  let pv;
  let wasCalled = false;
  /*eslint-disable */
  const onEvent = function($event) {
    wasCalled = true;

    // event[$event.type] = true;
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
    document.dispatchEvent(new Event('visibilitychange'));
    expect(wasCalled).to.be.true;
  });
  it('on window.blur', () => {
    expect(wasCalled).to.be.false;
    window.dispatchEvent(new Event('blur'));
    expect(wasCalled).to.be.true;
  });
  it('on window.focus', () => {
    expect(wasCalled).to.be.false;
    window.dispatchEvent(new Event('focus'));
    expect(wasCalled).to.be.true;
  });
  it('on window.pageHide', () => {
    expect(wasCalled).to.be.false;
    window.dispatchEvent(new Event('pagehide'));
    expect(wasCalled).to.be.true;
  });
  it('on window.pageshow', () => {
    expect(wasCalled).to.be.false;
    window.dispatchEvent(new Event('pageshow'));
    expect(wasCalled).to.be.true;
  });
  it('on window.visibilitychange', () => {
    expect(wasCalled).to.be.false;
    window.dispatchEvent(new Event('visibilitychange'));
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
