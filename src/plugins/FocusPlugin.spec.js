import { FocusPlugin } from './FocusPlugin';
import { Bellhop } from 'bellhop-iframe';
describe('FocusPlugin', () => {
  before(() => {
    const div = document.createElement('iframe');
    div.classList.add('pause-on-focus');
    document.body.appendChild(div);
  });
  let fp;
  it('construct', () => {
    const dom = document.createElement('iframe');
    document.body.appendChild(dom);
    fp = new FocusPlugin({
      dom,
      client: new Bellhop()
    });
  });
  it('.focus(), .onDocClick()', () => {
    fp.focus();
  });
  it('.blur()', () => {
    fp.blur();
  });
  it('.manageFocus()', () => {
    fp.manageFocus();
  });
  it('.onKeepFocus()', () => {
    fp.onKeepFocus({ data: true });
    expect(fp._keepFocus).to.be.true;
  });
  it('.onContainerFocus()', () => {
    fp.onContainerBlur();
    expect(fp._containerBlurred).to.be.true;
  });
  it('.onFocus()', () => {
    fp.onContainerFocus();
    expect(fp._containerBlurred).to.be.false;
  });
  //TODO: Figure out why onPauseFocus() is not working on Firefox
  it('.onPauseFocus() - focus', () => {
    fp.paused = false;
    fp.pauseFocus.focus();
    expect(fp.paused).to.be.true;
  });
  it('.onPauseFocus() - blur', () => {
    fp.paused = true;
    fp.pauseFocus.blur();
    expect(fp.paused).to.be.false;
  });
  it('.open()', () => {
    fp.open();
  });
  it('.opened()', () => {
    fp.opened();
  });
  it('.close()', () => {
    fp.close();
  });
  it('.teardown()', () => {
    fp.teardown();
  });
});
