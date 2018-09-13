import { SavedData } from './SavedData';
beforeEach(() => {
  localStorage.clear();
  document.cookie = '';
});
describe('SavedData', () => {
  const test = { foo: 'bar' };
  const arrayTest = [5, 4, 3, 2, 1, 0];

  it('.WEB_STORAGE_SUPPORT() - get', () => {
    expect(SavedData.WEB_STORAGE_SUPPORT).to.be.true;
  });
  it('.ERASE_COOKIE() - get', () => {
    expect(SavedData.ERASE_COOKIE).to.be.false;
  });
  it('.ERASE_COOKIE() - set', () => {
    SavedData.ERASE_COOKIE = true;
    expect(SavedData.ERASE_COOKIE).to.be.true;
  });
  it('.write(), .read(), .remove() - Session Storage', () => {
    SavedData.write('test', test, true);

    expect(SavedData.read('test').foo).to.equal(test.foo);

    SavedData.write('test', 5, true);
    expect(SavedData.read('test')).to.equal(5);

    SavedData.write('test', 'test', true);
    expect(SavedData.read('test')).to.equal('test');

    SavedData.write('test', arrayTest, true);
    const savedArray = SavedData.read('test');
    for (let i = 0, l = arrayTest.length; i < l; i++) {
      expect(savedArray[i]).to.equal(arrayTest[i]);
    }

    SavedData.write('test', '{foo: "bar"}', true);

    expect(SavedData.read('test')).to.be.string;

    SavedData.remove('test');

    expect(SavedData.read('test')).to.be.null;
  });
  it('.write(), .read(), .remove() - Local Storage', () => {
    SavedData.write('test', test, false);

    expect(SavedData.read('test').foo).to.equal(test.foo);

    SavedData.write('test', 5, false);
    expect(SavedData.read('test')).to.equal(5);

    SavedData.write('test', 'test', false);
    expect(SavedData.read('test')).to.equal('test');

    SavedData.write('test', arrayTest, false);
    const savedArray = SavedData.read('test');
    for (let i = 0, l = arrayTest.length; i < l; i++) {
      expect(savedArray[i]).to.equal(arrayTest[i]);
    }

    SavedData.write('test', '{foo: "bar"}', false);

    expect(SavedData.read('test')).to.be.string;

    SavedData.remove('test');

    expect(SavedData.read('test')).to.be.null;
  });

  it('.write(), .read(), .remove() - Cookie Storage', () => {
    SavedData.disableWebStorage();

    expect(SavedData.WEB_STORAGE_SUPPORT).to.be.false;

    SavedData.write('test', test, false);

    expect(SavedData.read('test').foo).to.equal(test.foo);

    SavedData.write('test', 5, false);
    expect(SavedData.read('test')).to.equal(5);

    SavedData.write('test', 'test', false);
    expect(SavedData.read('test')).to.equal('test');

    SavedData.write('test', arrayTest, false);
    const savedArray = SavedData.read('test');
    for (let i = 0, l = arrayTest.length; i < l; i++) {
      expect(savedArray[i]).to.equal(arrayTest[i]);
    }

    SavedData.write('test', '{foo: "bar"}', false);

    expect(SavedData.read('test')).to.be.string;

    SavedData.remove('test');

    expect(SavedData.read('test')).to.be.null;
  });
});
