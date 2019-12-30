import sinon from 'sinon';

import { Features } from './Features';

describe('Features', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('webgl', () => {
    it('should return false if the canvas element is not supported', () => {
      const stubbedCall = sinon.stub(document, 'createElement');
      stubbedCall.returns(null);

      expect(Features.webgl).to.equal(false);
    });

    it('should return true if getContext(webgl) returns something', () => {
      const stubbedCall = sinon.stub(document, 'createElement');
      const getContextStub = sinon.stub();
      getContextStub.withArgs('webgl').returns({});
      getContextStub.withArgs('experimental-webgl').returns(null);
      stubbedCall.returns({ getContext: getContextStub });

      expect(Features.webgl).to.equal(true);
    });

    it('should return true if getContext(experimental-webgl) returns something', () => {
      const stubbedCall = sinon.stub(document, 'createElement');
      const getContextStub = sinon.stub();
      getContextStub.withArgs('webgl').returns(null);
      getContextStub.withArgs('experimental-webgl').returns({});
      stubbedCall.returns({ getContext: getContextStub });

      expect(Features.webgl).to.equal(true);
    });

    it('should return false if getContext(webl) and getContext(experimental-webgl) dont return anything', () => {
      const stubbedCall = sinon.stub(document, 'createElement');
      const getContextStub = sinon.stub();
      getContextStub.withArgs('webgl').returns(null);
      getContextStub.withArgs('experimental-webgl').returns(null);
      stubbedCall.returns({ getContext: getContextStub });

      expect(Features.webgl).to.equal(false);
    });
  });

  describe('canvas', () => {
    it('should return false if the canvas element is not supported', () => {
      const stubbedCall = sinon.stub(document, 'createElement');
      stubbedCall.returns(null);

      expect(Features.canvas).to.equal(false);
    });

    it('should return false if the getContext(2d) is not supported', () => {
      const stubbedCall = sinon.stub(document, 'createElement');
      const getContextStub = sinon.stub();
      getContextStub.withArgs('2d').returns(null);
      stubbedCall.returns({ getContext: getContextStub });

      expect(Features.canvas).to.equal(false);
    });

    it('should return true if getContext(2d) returns something', () => {
      const stubbedCall = sinon.stub(document, 'createElement');
      const getContextStub = sinon.stub();
      getContextStub.withArgs('2d').returns({});
      stubbedCall.returns({ getContext: getContextStub });

      expect(Features.canvas).to.equal(true);
    });
  });

  it('.webAudio()', () => {
    expect(Features.webaudio).to.be.a('boolean');
  });

  it('.webSockets()', () => {
    expect(Features.websockets).to.be.a('boolean');
  });

  it('.geolocation()', () => {
    expect(Features.geolocation).to.be.a('boolean');
  });

  it('.webWorkers()', () => {
    expect(Features.webworkers).to.be.a('boolean');
  });

  it('.touch()', () => {
    expect(Features.touch).to.be.a('boolean');
  });

  it('.basic()', () => {
    Features.basic();
  });

  describe('test', () => {
    const defaultCapabilities = {
      features: {},
      ui: {
        touch: true
      },
      sizes: {
        xsmall: true,
        small: true,
        medium: true,
        large: true,
        xlarge: true
      }
    };

    it('should run properly', () => {
      const testData = Object.assign({}, defaultCapabilities);
      Features.test(testData);
    });

    it('should return an error if basic compatibility is not supported', () => {
      sinon.stub(Features, 'basic').returns('oops');
      expect(Features.test({})).to.equal('oops');
    });

    describe('features', () => {
      it('should return an error if a capability is required that is not supported', () => {
        const capabilities = Object.assign({}, defaultCapabilities, {
          features: {
            websockets: true
          }
        });

        sinon.stub(Features, 'websockets').get(() => false);

        expect(Features.test(capabilities)).to.equal('Browser does not support websockets');
      });

      it('should not return an error if an unsupported capability is not required', () => {
        const capabilities = Object.assign({}, defaultCapabilities, {
          features: {
            websockets: false
          }
        });

        sinon.stub(Features, 'websockets').get(() => false);

        expect(Features.test(capabilities)).to.equal(null);
      });
    });

    describe('ui', () => {
      describe('touch', () => {
        it('should return an error if the browser supports touch but the game does not support it', () => {
          sinon.stub(Features, 'touch').get(() => true);
          
          const capabilities = {
            features: {},
            ui: {},
            size: {}
          };

          expect(Features.test(capabilities)).to.equal('Game does not support touch input');
        });

        it('should not return an error if the game supports touch but the browser does not', () => {
          sinon.stub(Features, 'touch').get(() => false);

          const capabilities = Object.assign({}, defaultCapabilities, {
            ui: {
              touch: true
            }
          });

          expect(Features.test(capabilities)).to.equal(null);
        });
      });
    });
  });

  it('.info()', () => {
    expect(Features.info).to.be.string;
  });
});
