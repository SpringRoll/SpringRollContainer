import { Container, BasePlugin } from './index';

document.body.innerHTML = '';
const iframe = document.createElement('iframe');
iframe.id = 'test';
document.body.appendChild(iframe);
const container = new Container({ iframeSelector: '#test' });

describe('Container', () => {
  it('Should Construct', () => {
    expect(container).to.be.instanceof(Container);
  });

  it('.onLoadDone()', () => {
    container.onLoadDone();
    expect(container.loading).to.be.false;
    expect(container.loaded).to.be.true;
    expect(container.iframe.classList.contains('loading')).to.be.false;
  });

  it('.initClient()', () => {
    container.initClient();
    expect(container.client.connecting).to.be.true;
  });

  it('._internalOpen', () => {
    container._internalOpen('test');
    expect(container.iframe.src).to.contain('http://localhost:9876/');
  });

  it('.openPath', () => {
    container.openPath('test');
    expect(container.iframe.src).to.contain('http://localhost:9876/');
  });

  it('.reset(), .onEndGame(), _onCloseFailed()', () => {
    container.reset();
    expect(container.loaded).to.be.false;
    expect(container.loading).to.be.false;
    expect(container.iframe.src).to.contain('http://localhost:9876/');
  });

  // it('.openRemote()', done => {
  //   container.openRemote('127.0.0.1').catch(err => {
  //     //TODO: Add test endpoint to improve this test?
  //     expect(err instanceof Response).to.be.true;
  //     done();
  //   });
  // });

  it('.destroy()', () => {
    container.destroy();
    expect(container.iframe).to.be.null;
    expect(container.options).to.be.null;
  });

  it('Container.version() - get', () => {
    expect(Container.version).to.be.a('string');
  });

  it('container.uses()', () => {
    /*eslint-disable */
    class barFoo extends BasePlugin {
      constructor() {
        super('bar-foo');
      }
    }
    /*eslint-enable */

    const length = container.plugins.length;
    container.uses(new barFoo());

    expect(container.plugins.length).to.not.equal(length);
  });
});
