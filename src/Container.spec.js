import sinon from 'sinon';
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

  describe('.openRemote()', () => {
    const API = 'http://localhost:3000';
    let stubbedFetch;

    beforeEach(() => {
      stubbedFetch = sinon.stub(window, 'fetch');
    });

    afterEach(() => {
      stubbedFetch.reset();
    });

    const setFetchResponse = (code, value) => {
      // from https://gist.github.com/coder36/a5c6f37623a066e50bbe52dd258b77f0
      const promise = Promise.resolve(new window.Response(JSON.stringify(value), {
        status: code,
        headers: { 'Content-type': 'application/json' }
      }));

      stubbedFetch.returns(promise);
    };

    it('should reject with the raw response if the server fails to respond', async () => {
      setFetchResponse(500, { success: false, error: '500' }); 

      const response = await container.openRemote(`${API}`);
      expect(response.status).to.equal(500);
    });

    /*
    it('should reject with the raw response if there is a client error', async () => {
      const response = await container.openRemote(`${API}/400`);
      expect(response.status).to.equal(400);
    });
    
    it('should reject with the raw response if the release does not exist', async () => {
      const response = await container.openRemote(`${API}/404`);
      expect(response.status).to.equal(404);
    });
   */
  });

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
