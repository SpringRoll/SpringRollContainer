import sinon from 'sinon';
import { Container, Features } from './index';
import { BasePlugin } from './base-plugins';

const sleep = (millis) => {
  return new Promise((resolve) => setTimeout(resolve, millis));
};

const defaultContext = {
  build_info: {
    commit: '#abcd123'
  },
  game_commit: '#123abcd'
};

document.body.innerHTML = '';
const iframe = document.createElement('iframe');
iframe.id = 'test';
document.body.appendChild(iframe);
const container = new Container('#test', { context: defaultContext });

describe('Container', () => {
  it('Should Construct', () => {
    expect(container).to.be.instanceof(Container);
  });

  describe('container.context', () => {
    beforeEach(() => {
      container.context = defaultContext;
    });

    it('should set context object to the passed in default', () => {
      expect(container.context.build_info.commit).to.equal(defaultContext.build_info.commit);
      expect(container.context.game_commit).to.equal(defaultContext.game_commit);
    });

    it('should allow for updating the entire context object', () => {

      const newContext = {
        test: 'hello'
      };

      expect(container.context.build_info.commit).to.equal(defaultContext.build_info.commit);
      expect(container.context.game_commit).to.equal(defaultContext.game_commit);

      container.context = newContext;

      expect(container.context.test).to.equal(newContext.test);
    });

    it('should allow adding a single field to the context', () => {
      expect(container.context.build_info.commit).to.equal(defaultContext.build_info.commit);
      expect(container.context.game_commit).to.equal(defaultContext.game_commit);

      container.context.newField = 'test';

      expect(container.context.build_info.commit).to.equal(defaultContext.build_info.commit);
      expect(container.context.game_commit).to.equal(defaultContext.game_commit);
      expect(container.context.newField).to.equal('test');
    });

    it('should not update context if the provided paramater is not an object', () => {
      const badContext = 'it was rigged from the start';

      expect(container.context.build_info.commit).to.equal(defaultContext.build_info.commit);
      expect(container.context.game_commit).to.equal(defaultContext.game_commit);

      container.context = badContext;

      expect(container.context.build_info.commit).to.equal(defaultContext.build_info.commit);
      expect(container.context.game_commit).to.equal(defaultContext.game_commit);
    });
  });

  it('should contruct with a Iframe DOM element', () => {
    new Container(iframe);
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
      sinon.restore();
    });

    const setFetchResponse = (code, value) => {
      // from https://gist.github.com/coder36/a5c6f37623a066e50bbe52dd258b77f0
      stubbedFetch.resolves(new window.Response(JSON.stringify(value), {
        status: code,
        headers: { 'Content-type': 'application/json' }
      }));
    };

    it('should reject with the raw response if the server fails to respond', async () => {
      setFetchResponse(500, { success: false, error: 'some message' });

      try {
        await container.openRemote(`${API}`);
        throw new Error('This test should throw');
      } catch (e) {
        expect(e.message).to.equal('some message');
      }
    });

    it('should reject with the raw response if there is a client error', async () => {
      setFetchResponse(400, { success: false, error: 'a message' });

      try {
        await container.openRemote(`${API}`);
        throw new Error('This test should throw');
      } catch (e) {
        expect(e.message).to.equal('a message');
      }
    });

    it('should reject with the raw response if the release does not exist', async () => {
      setFetchResponse(404, { success: false, error: 'not found' });

      try {
        await container.openRemote(`${API}`);
        throw new Error('This test should throw');
      } catch (e) {
        expect(e.message).to.equal('not found');
      }
    });

    describe('feature detection', () => {
      let featuresStub;

      beforeEach(() => {
        featuresStub = sinon.stub(Features, 'test');
      });

      afterEach(() => {
        sinon.restore();
      });

      it('should reject if there was an error testing features', async () => {
        setFetchResponse(200, {
          success: true,
          data: {
            features: {}
          }
        });

        featuresStub.returns('oops');

        try {
          await container.openRemote(`${API}`);
          throw new Error('This should throw');
        } catch (e) {
          expect(e.message).to.equal('oops');
        }
      });

      it('should open the iframe appropriately if the api call succeeded and every feature was detected', async () => {
        setFetchResponse(200, {
          success: true,
          data: {
            features: {},
            url: 'https://example.com/'
          }
        });

        featuresStub.returns('');

        container.iframe = document.createElement('iframe');

        await container.openRemote(`${API}`);

        expect(container.iframe.src).to.equal('https://example.com/');
      });
    });
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

  it('Should still construct with a plugin that fails its preload', async () => {

    /*eslint-disable */
    class PreloadFailPlugin extends BasePlugin {
      constructor() {
        super('preload-fail-plugin');
      }
      async preload() {
        throw 'It was rigged from the start';
      }
    }
    /*eslint-enable */

    const container2 = new Container('#iframe', {
      plugins: [
        new PreloadFailPlugin(),
        new BasePlugin('base plugin')
      ]
    });

    await sleep(100);

    // Preload should fail on one and it should be filtered out
    expect(container2.plugins.length).to.equal(1);


  });

  it('should properly skip plugins without preload functions', async () => {
    /*eslint-disable */
    class PreloadMissingPlugin {
      constructor() { }
    }
    /*eslint-enable */
    const container = new Container('#iframe', {
      plugins: [
        new PreloadMissingPlugin(),
        new BasePlugin('base plugin')
      ]
    });

    await sleep(100);

    // Both plugins should still be valid
    expect(container.plugins.length).to.equal(2);

    //The BasePlugin client should be not null. This proves that the preload function ran properly
    expect(container.plugins[1].client).to.not.be.null;

  });
});
