import { FocusPlugin } from './FocusPlugin';
import { Bellhop } from 'bellhop-iframe';
import platform from 'platform';
//Karma firefox work around due to known bug => https://github.com/karma-runner/karma-firefox-launcher/issues/56
const isFirefox = () => 'Firefox' === platform.name;

describe('FocusPlugin', () => {
  let focusPlugin;
  beforeEach(() => {
    const dom = document.createElement('iframe');
    dom.src = 'data:text/html;base64,R0lG';
    dom.classList.add('pause-on-focus');
    document.body.appendChild(dom);

    focusPlugin = new FocusPlugin({
      dom,
      client: new Bellhop()
    });
  });

  it('.focus(), .onDocClick()', () => {
    focusPlugin.focus();
  });
  it('.blur()', () => {
    focusPlugin.blur();
  });
  it('.manageFocus()', () => {
    focusPlugin.manageFocus();
  });
  it('.onKeepFocus()', () => {
    focusPlugin.onKeepFocus({ data: true });
    expect(focusPlugin._keepFocus).to.be.true;
  });
  it('.onContainerFocus()', () => {
    focusPlugin.onContainerBlur();
    expect(focusPlugin._containerBlurred).to.be.true;
  });
  it('.onFocus()', () => {
    focusPlugin.onContainerFocus();
    expect(focusPlugin._containerBlurred).to.be.false;
  });
  it('.onPauseFocus() - focus', () => {
    if (isFirefox) {
      return;
    }
    window.focus();
    document.body.focus();
    focusPlugin.paused = false;
    focusPlugin.pauseFocus.focus();
    expect(focusPlugin.paused).to.be.true;
  });
  it('.onPauseFocus() - blur', () => {
    if (isFirefox) {
      return;
    }
    focusPlugin.paused = true;
    focusPlugin.pauseFocus.blur();
    expect(focusPlugin.paused).to.be.false;
  });
  it('.open()', () => {
    focusPlugin.open();
  });
  it('.opened()', () => {
    focusPlugin.opened();
  });
  it('.close()', () => {
    focusPlugin.close();
  });
  it('.teardown()', () => {
    focusPlugin.teardown();
  });
});
