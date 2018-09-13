import { FeaturesPlugin } from './FeaturesPlugin';
import { Bellhop } from 'bellhop-iframe';

describe('FeaturesPlugin', () => {
  let fp;
  it('construct', () => {
    fp = new FeaturesPlugin({ client: new Bellhop() });
  });

  it('.open()', () => {
    fp.open();
  });

  it('.close()', () => {
    fp.close();
  });

  it('.onFeatures()', done => {
    fp.client.on('features', () => {
      done();
    });

    fp.onFeatures();
  });
});
