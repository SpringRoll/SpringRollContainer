import { UserDataPlugin } from './UserDataPlugin';
import { Bellhop } from 'bellhop-iframe';
describe('UserDataPlugin', () => {
  let udp;

  it('construct', () => {
    udp = new UserDataPlugin();
    udp.preload({ client: new Bellhop() });
  });

  it('.onUserDataRemove()', () => {
    udp.onUserDataRemove({ data: { foo: 'bar' }, type: 'test-data' });
  });
  it('.onUserDataRead()', () => {
    udp.onUserDataRead({ data: { foo: 'bar' }, type: 'test-data' });
  });
  it('.onUserDataWrite()', () => {
    udp.onUserDataWrite({
      data: { name: 't', value: true, type: 'test-data' }
    });
  });
});
