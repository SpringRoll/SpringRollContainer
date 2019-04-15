import { BasePlugin } from './BasePlugin';
import { Container } from '../Container';
/*eslint-enable */
let container;
/*eslint-disable */
class Plugin extends BasePlugin {
  constructor() {
    super('test-plugin');
    this.initCalled = false;
    this.called = {
      init: false,
      preload: false,
      start: false
    };
  }
  init() {
    this.called.init = true;
  }

  async preload() {
    this.called.preload = true;
  }

  start() {
    this.called.start = true;
  }
}
before(() => {
  const iframe = document.createElement('iframe');
  iframe.id = 'iframe';
  document.body.appendChild(iframe);
  container = new Container('#iframe');
  container.uses(new Plugin());
});

describe('Container Plugin Integration', () => {});
