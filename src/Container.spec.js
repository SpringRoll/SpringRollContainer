import { Container, BasePlugin } from './index';

let iframe, container;
before(() => {
  document.body.innerHTML = '';
  iframe = document.createElement('iframe');
  iframe.id = 'test';
  document.body.appendChild(iframe);
  container = new Container('#test');
});
describe('Container', () => {
  it('Should Construct', () => {
    expect(container).to.be.instanceof(Container);
  });

  it('.onLoadDone()', () => {
    container.onLoadDone();
    expect(container.loading).to.be.false;
    expect(container.loaded).to.be.true;
    expect(container.main.classList.contains('loading')).to.be.false;
  });

  it('.initClient()', () => {
    container.initClient();
    expect(container.client.connecting).to.be.true;
  });

  it('._internalOpen', () => {
    container._internalOpen('test');
    expect(container.main.src).to.contain('http://localhost:9876/');
  });

  it('.openPath', () => {
    container.openPath('test');
    expect(container.main.src).to.contain('http://localhost:9876/');
  });

  it('.reset(), .onEndGame(), _onCloseFailed()', () => {
    container.reset();
    expect(container.client).to.be.null;
    expect(container.loaded).to.be.false;
    expect(container.loading).to.be.false;
    expect(container.main.src).to.contain('http://localhost:9876/');
  });

  it('.destroyClient()', () => {
    container.destroyClient();
    expect(container.client).to.be.null;
  });

  it('.openRemote()', () => {
    container.openRemote('http://127.0.0.1');
  });

  it('.destroy()', () => {
    container.destroy();
    expect(container.main).to.be.null;
    expect(container.options).to.be.null;
    expect(container.dom).to.be.null;
  });

  it('Container.version() - get', () => {
    expect(Container.version).to.be.a('string');
  });

  it('Container.uses()', () => {
    /*eslint-disable */
    class fooBar {
      constructor() {}

      setup() {}
    }

    class barFoo extends BasePlugin {
      constructor() {
        super({ name: 'bar-foo' });
      }
    }

    /*eslint-enable */

    expect(Container.plugins.length).to.equal(0);
    Container.uses(new fooBar());
    Container.uses(new barFoo());
    expect(Container.plugins.length).to.equal(1);
  });
});
