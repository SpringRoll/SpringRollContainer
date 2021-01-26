import { SavedData } from './SavedData';
beforeEach(() => {
  localStorage.clear();
  document.cookie = '';
});

const sleep = (millis) => {
  return new Promise((resolve) => setTimeout(resolve, millis));
};

describe('SavedData', () => {
  const test = { foo: 'bar' };
  const arrayTest = [5, 4, 3, 2, 1, 0];

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

  it('Database should create a database, connect to it, and close without issue', async () => {
    const savedData = new SavedData('testingDB1');
    let result = undefined;
    savedData.IDBOpen('testingDB1', 1, null, null, (val) => {
      if (val.success) {
        result = val.success;
      }
    }
    );

    await sleep(600);

    expect(result).to.be.true;

    result = undefined;
    savedData.IDBClose((val) => {
      if (val.success) {
        result = val.success;
      }
    }
    );

    await sleep(900);
    expect(result).to.be.true;

    savedData.IDBDeleteDB('testingDB1', null, (val) => {
      result = val.success;
    });

    await sleep(600);
    


  }).timeout(10000);
  it('The database should be able to close and re-open as well as delete stores and indexes', async () => {

    const savedData = new SavedData('testing');
    let result = undefined;
    savedData.IDBOpen('testing2', 2, {
      stores : [{storeName : 'newStore'}],
      indexes : [{storeName : 'newStore',indexName : 'newIndex'}]
    }, null, (val) => {
      if (val.success) {
        result = val.success;
      }
    }
    );

    await sleep(600);
    expect(result).to.be.true;

    result = undefined;
    savedData.IDBClose( (val) => {
      if (val.success) {
        result = val.success;
      }
    }
    );

    await sleep(600);
    expect(result).to.be.true;

    result = undefined;
    savedData.IDBOpen('testing2', 3, null, {
      stores : [{storeName : 'newStore', key : 'key'}],
      indexes : [{storeName : 'newStore', indexName : 'newIndex'}]
    }, (val) => {
      result = val.success;
    }
    );

    await sleep(600);
    expect(result).to.be.true;

    result = undefined;
    
    savedData.IDBClose( (val) => {
      if (val.success) {
        result = val.success;
      }
    }
    );

    await sleep(600);
    expect(result).to.be.true;

    savedData.IDBDeleteDB('testing2', null, (val) => {
      result = val.success;
    });

  }).timeout(10000);

  it('The database should be able to create a store and an index then create a record then read it, update it, and delete it',  async() => {

    const savedData = new SavedData('testingDB3');

    let result = undefined;
    savedData.IDBOpen('testingDB3', 1, {
      stores : [{storeName : 'storeOne'}]
    }, null, (val) => {
      if (val.success) {
        result = val.success;
      }
    }
    );

    await sleep(900);

    expect(result).to.be.true;

    result = false;

    savedData.IDBAdd('storeOne', 'valuable', 'key', (val) => {
      result = val.success;
    });

    await sleep(600);

    expect(result).to.be.true;

    result = false;
    
    await savedData.IDBUpdate('storeOne', 'key', 'valueless', (val) => {
      result = val.success;
    });

    await sleep(600);

    expect(result).to.be.true;

    result = false;
    
    savedData.IDBRead('storeOne', 'key', (val) => {
      result = val.result;
    });
    await sleep(600);

    expect(result).to.equal('valueless');

    result = false;



    savedData.IDBRemove('storeOne', 'key', (val) => {
      result = val.success;
    });

    await sleep(900);

    expect(result).to.be.true;

    result = false;


    savedData.IDBClose((val) => {
      result = val.success;
    });
    savedData.IDBDeleteDB('testingDB', null, (val) => {
      result = val.success;
    });

    await sleep(900);

    expect(result).to.be.true;



  }).timeout(10000);

});
