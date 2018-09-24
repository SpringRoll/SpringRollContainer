import { FeaturesPlugin } from './FeaturesPlugin';

describe('FeaturesPlugin', () => {
  let fp;
  it('construct', () => {
    fp = new FeaturesPlugin();
  });

  it('.open()', () => {
    fp.open();
  });

  it('.close()', () => {
    fp.close();
  });
});
