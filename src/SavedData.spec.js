import { SavedData } from './SavedData';
beforeEach(() => {
  localStorage.clear();
  document.cookie = '';
});

/**
 * 
 */
async function indexed() {
  const request = window.indexedDB.open('testing123');

  request.onsuccess = e => {

    // this.db = e.target.result;

    console.log('Here: \n\n\n\n\n\n\n\n');

    console.log(e.target.result);

    console.log('there: \n\n\n\n\n\n\n\n');
    
  };

  request.onerror = () => {

  };
}

onReturn(METHOD, data, attempts = 3) {
  return new Promise((resolve, reject) => {
    let success = false;
    let count = 0;

    const onReturn = event => {
      BellhopSingleton.off(METHOD, onReturn);
      success = true;
      resolve(event);
    };
    BellhopSingleton.on(METHOD, onReturn);

    BellhopSingleton.send(METHOD, data);

    const interval = setInterval(() => {
      if (success) {
        clearInterval(interval);
        return;
      }

      if (count >= attempts) {
        clearInterval(interval);
        BellhopSingleton.off(METHOD, onReturn);
        reject('No Response');
      }
      count++;
    }, 100);
  });
}

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
    const savedData = new SavedData();

    await savedData.IDBOpen('newDataBase');

    await savedData.IDBClose();

  });
  it('The database should be able to close and re-open as well as delete stores and indexes', async () => {

    const savedData = new SavedData('dbName');
    await savedData.IDBOpen('testing', 11, {
      stores: [{storeName: 'storeOne'}],
      indexes: [{storeName: 'storeOne', indexName: 'indexName'}]
    });

    savedData.IDBClose();

    await savedData.IDBOpen('testing', 11, null, {
      stores: [{storeName: 'storeOne'}],
      indexes: [{storeName: 'storeOne', indexName: 'indexName'}]
    }
    );

  });

  it('The database should be able to create a store and an index then create a record then read it, update it, and delete it', async () => {
    
    // window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    // console.log(await indexed());

    // console.log('\n\n\n\n\n\n\n\n\n');
    // console.log(request.version);
    // console.log('\n\n\n\n\n\n\n\n\n');

    const savedData = new SavedData('dbName');
    // const version = await savedData.IDBGetVersion('testing');
    // const userData = new UserData('dbName');
    const openResult = await savedData.IDBOpen('testing', 19, null, null, async (val) => {
      console.log('Inside Callback');
      return new Promise((resolve) =>{
        // console.log('Here: \n\n\n\n\n\n\n\n');
        console.log(val);

        // console.log(val);
        resolve(val);
      });
    }
    );

    console.log('Here: \n\n\n\n\n\n\n\n');
    console.log(openResult);
    console.log('There \n\n\n\n\n\n\n\n');

    // indexed();

    // console.log('There: \n\n\n\n\n\n\n\n\n');
    
    // console.log(returnOpen);

    // console.log('\n\n\n\n\n\n\n\n\n');

    // await savedData.IDBAdd('storeOne', 'valuable', 'key' + Math.random().toString(36).substring(7));
    
    // await savedData.IDBUpdate('storeOne', 'key', 'valueless');
    
    // const data = await savedData.IDBRead('storeOne', 'key');

    // expect(data.data.result.value).to.equal('valueless');

    // await savedData.IDBRemove('storeOne', 'key');

    // await savedData.IDBClose();

  });

});
