import { BasePlugin } from './BasePlugin';
import { Container } from '../Container';

/*eslint-disable */
class Plugin extends BasePlugin {
  constructor() {
    super();
    called.constructor = true;
  }
  open() {
    called.open = true;
  }

  opened() {
    called.opened = true;
  }

  close() {
    called.close = true;
  }

  closed() {
    called.closed = true;
  }

  teardown() {
    called.teardown = true;
  }
}
/*eslint-enable */
let called, container;
before(() => {
  Container.clearPlugins();
  Container.uses(Plugin);
  called = {
    constructor: false,
    open: false,
    opened: false,
    close: false,
    closed: false,
    teardown: false
  };
});

describe('Container Plugin Integration', () => {
  it('Should call the instuctor', () => {
    expect(called.constructor).to.be.false;
    container = new Container('#test');
    expect(called.constructor).to.be.true;
  });

  it('Should call open() on open', () => {
    expect(called.open).to.be.false;
    container._internalOpen('/test');
    expect(called.open).to.be.true;
  });

  it('Should call opened() on load done', () => {
    expect(called.opened).to.be.false;
    container.onLoadDone();
    expect(called.opened).to.be.true;
  });

  it('Should call close() on close', () => {
    expect(called.close).to.be.false;
    container.close();
    expect(called.close).to.be.true;
  });

  it('Should call closed() on reset', () => {
    expect(called.closed).to.be.false;
    container.reset();
    expect(called.closed).to.be.true;
  });

  it('Should call teardown() on destroy', () => {
    expect(called.teardown).to.be.false;
    container.destroy();
    expect(called.teardown).to.be.true;
  });

  it('Should have called all functions as part of the test', () => {
    Object.keys(called).forEach(key => {
      expect(called[key]).to.be.true;
    });
  });
});
