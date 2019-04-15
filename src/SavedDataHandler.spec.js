import { SavedDataHandler } from './SavedDataHandler';

describe('SavedDataHandler', () => {
  it('.write()', done => {
    SavedDataHandler.write('SDH-Test', true, () => {
      done();
    });
  });
  it('.read()', done => {
    SavedDataHandler.write('SDH-Test', true, () => {
      done();
    });
    SavedDataHandler.read('SDH-Test', value => {
      expect(value).to.be.true;
      done();
    });
  });
  it('.remove()', done => {
    SavedDataHandler.remove('SDH-Test', () => {
      done();
    });
  });
});
