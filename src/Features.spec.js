import { Features } from './Features';

describe('Features', () => {
  it('.flash()', () => {
    expect(Features.flash).to.be.false;
  });
  it('.webgl()', () => {
    expect(Features.webgl).to.be.false;
  });

  it('.canvas()', () => {
    expect(Features.canvas).to.be.true;
  });

  it('.webAudio()', () => {
    expect(Features.webAudio).to.be.true;
  });

  it('.webSockets()', () => {
    expect(Features.webSockets).to.be.true;
  });

  it('.geolocation()', () => {
    expect(Features.geolocation).to.be.true;
  });

  it('.webWorkers()', () => {
    expect(Features.webWorkers).to.be.true;
  });

  it('.touch()', () => {
    expect(Features.touch).to.be.false;
  });

  it('.basic()', () => {
    expect(Features.basic()).to.be.null;
  });

  it('.test()', () => {
    const testData = {
      features: {
        webgl: 'webgl',
        geolocation: 'geolocation',
        webWorkers: 'webworkers',
        webAudio: 'webaudio',
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
    expect(Features.test(testData)).to.equal('Browser does not support webgl');
    delete testData.features.webgl;

    expect(Features.test(testData)).to.be.null;
  });

  it('.info()', () => {
    expect(Features.info).to.be.string;
  });
});
