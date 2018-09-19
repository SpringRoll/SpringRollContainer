import { UserDataPlugin } from './UserDataPlugin';

describe('UserDataPlugin', () => {
  let udp;

  it('construct', () => {
    udp = new UserDataPlugin();
  });

  it('.open()', () => {
    udp.open();
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
