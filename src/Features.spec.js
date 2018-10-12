import { Features } from './Features';

describe('Features', () => {
  it('.webgl()', () => {
    expect(Features.webgl).to.be.a('boolean');
  });

  it('.canvas()', () => {
    expect(Features.canvas).to.be.a('boolean');
  });

  it('.webAudio()', () => {
    expect(Features.webAudio).to.be.a('boolean');
  });

  it('.webSockets()', () => {
    expect(Features.webSockets).to.be.a('boolean');
  });

  it('.geolocation()', () => {
    expect(Features.geolocation).to.be.a('boolean');
  });

  it('.webWorkers()', () => {
    expect(Features.webWorkers).to.be.a('boolean');
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
