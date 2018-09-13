import { RemotePlugin } from './RemotePlugin';
import { Bellhop } from 'bellhop-iframe';

describe('RemotePlugin', () => {
  let rp;
  it('construct', () => {
    rp = new RemotePlugin({ client: new Bellhop() });
    expect(rp.client).to.be.instanceof(Bellhop);
  });

  it('.openRemote()', () => {
    rp.openRemote('http://127.0.0.1');
  });

  it('.teardown()', () => {
    rp.teardown();
  });
});
