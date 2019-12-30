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

      const canvas = document.createElement('canvas');
      console.log('getContext(webgl)', canvas.getContext('webgl'));

      expect(Features.webgl).to.equal(true);
    });

    it('should return true if getContext(experimental-webgl) returns something');

    it('should return false if getContext(webl) and getContext(experimental-webgl) dont return anything');
  });

  it('.canvas()', () => {
    expect(Features.canvas).to.be.a('boolean');
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

  it('.test()', () => {
    const testData = {
      features: {
        geolocation: 'geolocation',
        webWorkers: 'webworkers',
        webSockets: 'websockets'
      },
      sizes: {
        xsmall: true,
        small: true,
        medium: true,
        large: true,
        xlarge: true
      },
      ui: {
        touch: true,
        mouse: true
      }
    };

    Features.test(testData);
  });

  it('.info()', () => {
    expect(Features.info).to.be.string;
  });
});
