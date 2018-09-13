import { FocusPlugin } from './FocusPlugin';

describe('FocusPlugin', () => {
  before(() => {
    const div = document.createElement('div');
    div.classList.add('pause-on-focus');
    document.body.appendChild(div);
  });
  let fp;
  it('construct', () => {
    fp = new FocusPlugin();
  });
  it('.onPauseFocus()', () => {});
  it('.focus()', () => {});
  it('.blur()', () => {});
  it('.manageFocus()', () => {});
  it('.onDocClick()', () => {});
  it('.onKeepFocus()', () => {});
  it('.onFocus()', () => {});
  it('.onContainerFocus()', () => {});
});
