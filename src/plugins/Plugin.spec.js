import { BasePlugin } from './BasePlugin';
import { Container } from '../Container';
import { Bellhop } from 'bellhop-iframe';
/*eslint-enable */
let container;
before(() => {
  Container.clearPlugins();
  Container.uses(Plugin);
  Container.client = new Bellhop();
});

/*eslint-disable */
class Plugin extends BasePlugin {
  constructor() {
    super();
    this.called = {
      constructor: false,
      open: false,
      opened: false,
      close: false,
      closed: false,
      teardown: false
    };
    this.called.constructor = true;
  }
  open() {
    this.called.open = true;
  }

  opened() {
    this.called.opened = true;
  }

  close() {
    this.called.close = true;
  }

  closed() {
    this.called.closed = true;
  }

  teardown() {
    this.called.teardown = true;
  }
}

describe('Container Plugin Integration', () => {
  it('Should call the instuctor', () => {
    container = new Container('#test');
    expect(container.plugins[0].called.constructor).to.be.true;
  });

  it('Should call open() on open', () => {
    expect(container.plugins[0].called.open).to.be.false;
    container._internalOpen('/test');
    expect(container.plugins[0].called.open).to.be.true;
  });

  it('Should call opened() on load done', () => {
    expect(container.plugins[0].called.opened).to.be.false;
    container.onLoadDone();
    expect(container.plugins[0].called.opened).to.be.true;
  });

  it('Should call close() on close', () => {
    expect(container.plugins[0].called.close).to.be.false;
    container.close();
    expect(container.plugins[0].called.close).to.be.true;
  });

  it('Should call closed() on reset', () => {
    expect(container.plugins[0].called.closed).to.be.false;
    container.reset();
    expect(container.plugins[0].called.closed).to.be.true;
  });

  it('Should call teardown() on destroy', () => {
    expect(container.plugins[0].called.teardown).to.be.false;
    container.destroy();
    expect(container.plugins[0].called.teardown).to.be.true;
  });

  it('Should have called all functions as part of the test', () => {
    Object.keys(container.plugins[0].called).forEach(key => {
      expect(container.plugins[0].called[key]).to.be.true;
    });
  });
});
