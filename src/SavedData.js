/**
 * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
 *
 * @class SavedData
 */
export class SavedData {

  /**
   * 
   */
  constructor(dbName = '') {
    this.db = null;
    this.dbName = dbName;

  }
  /**
   * Remove a saved variable by name.
   * @method remove
   * @static
   * @param {String} name The name of the value to remove
   */
  static remove(name) {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  }

  /**
   * Save a variable.
   * @method write
   * @static
   * @param {String} name The name of the value to save
   * @param {*} value The value to save. This will be run through JSON.stringify().
   * @param {Boolean} [tempOnly=false] If the value should be saved only in the current browser session.
   */
  static write(name, value, tempOnly = false) {

    return tempOnly
      ? sessionStorage.setItem(
        name,
        JSON.stringify('function' === typeof value ? value() : value)
      )
      : localStorage.setItem(
        name,
        JSON.stringify('function' === typeof value ? value() : value)
      );
  }

  /**
   * Read the value of a saved variable
   * @method read
   * @static
   * @param {String} name The name of the variable
   * @return {*} The value (run through `JSON.parse()`) or null if it doesn't exist
   */
  static read(name) { 
    const value = localStorage.getItem(name) || sessionStorage.getItem(name);

    if ('string' === typeof value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return value;
      }
    } else {
      return value;
    }
  }

  /**
   * Add a record to a given store
   * 
   * @param {string} storeName 
   * @param {*} record the object to be stored
   */
  IDBAdd(storeName, record) {
    if ( !this.db && this.dbName != '') {
      this.IDBOpen(this.dbName);
    }

    const tx = this.db.transaction(storeName, 'readwrite');
    tx.onerror = e => alert( ` Error! ${e.target.error}  `);
    const store = tx.objectStore();
    store.add(record);
  }

  /**
   * Closes the connection to the database if open
   */
  closeDb() {
    if ( this.db ) {
      this.db.close();
    } 
  }

  /**
   * Delete a given record within a given store
   * 
   * @param {*} storeName 
   * @param {*} key 
   */
  IDBDeleteRecord(storeName, key) {
    if ( !this.db && this.dbName != '') {
      this.IDBOpen(this.dbName);
    }

    const tx = this.db.transaction(storeName, 'readwrite');
    tx.onerror = e => alert( ` Error! ${e.target.error}  `);
    const store = tx.objectStore();
    store.delete(key);

    this.client.send('IDBDelete', {result:'success'});
  }

  /**
   * Open a connection with the IDB Database and optionally add or delete
   * Indexes and stores
   * 
   * @param {string} dbName The name of your IndexedDB database
   * @param {string} dbVersion The version number of the database. Additions and deletions will be ignored if lower than current version number
   * @param {JSON} additions Any additions to the structure of the database
   * @param {array} additions.stores Any stores to be added into the database syntax: {storename: '[name]', options: {[optionally add options]}}
   * @param {array} additions.indexes Any Indexes to be added to the database syntax: {storename: '[name]', options: {[optionally add options]}}
   */
  IDBOpen( dbName, dbVersion = null, additions = {}, deletions = {}) {

    const request = dbVersion ? indexedDB.open(dbName,dbVersion): indexedDB.open(dbName);

    request.onsuccess = e => {
      this.db = e.target.result;
    };

    //on upgrade needed fires only if the dbVersion is higher than the vurrent version number
    request.onupgradeneeded = e => {
      this.db = e.target.result;

      if (additions.stores) {
        additions.stores.forEach(e => {
          this.db.createObjectStore(e.storeName, e.options);
          
        });
      }
      if (additions.indexes) {
        additions.indexes.forEach(e => {
          // Open a transaction with the target store returning a store object
          const store = request.transaction.objectStore(e.storeName);
          
          console.log(e);
          store.createIndex(e.indexName, e.keyPath, e.optoins);
        });
      }

      if (deletions.stores) {
        deletions.stores.forEach((storeName) => {
          this.db.deleteObjectStore(storeName);
        });
      }
      if (deletions.indexes) {
        deletions.stores.forEach((indexName) => {
          this.db.deleteObjectStore(indexName);
        });
      }
      // const store = this.db.createObjectStore('personal_notes', {keyPath: 'title'});

      // alert(`upgrade is called database name: ${this.db.name} version : ${this.db.version}`);
    };

    this.client.send('IDBOpen', {result: 'success'});


    request.onerror = e => {
      this.client.send('IDBOpen', {result: 'failure', error: e});

    };
  }

  /**
   * 
   * @param {string} storeName 
   * @param {string} key The key for the record in the given store 
   */
  IDBRead(storeName, key) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    const readRequest = store.get(key);

    readRequest.onsuccess = (e) => {
      // receive the event and dispatch custom event with information
      this.client.send('IDBRead', {e});
    };

  }

  /**
   * Update a record in a given store
   * @param {string} storeName 
   * @param {string | object} newObject The altered object to be updated from the given store
   */
  IDBUpdate (storeName, newObject) {
    const tx = this.db.transaction(storeName, 'readWrite');
    const store = tx.objectStore(storeName);
    
    const updateRequest = store.put(newObject);

    updateRequest.onsuccess = (e) => {
      // receive the event and dispatch custom event with information
      this.client.send('IDBUpdate', {result : e.result});
    };
  }

  /**
   * Get all keys with given index
   * @param {string} query 
   * @param {string} count 
   */
  IDBGetIndexKeys (storeName, indexName, query = null, count = null) {

    const tx = this.db.transaction(storeName, 'readWrite');
    const store = tx.objectStore(storeName);

    let index;

    if (query && count) {
      index = store.index(indexName, query, count);
    } else if (query) {
      index = store.index(indexName, query);
    } else {
      index = store.index(indexName);
    }

    const getAllKeysRequest = index.getAllKeys();


    getAllKeysRequest.onsuccess = function(e) {
      this.client.send('idbKeys', {result : e.result});
    };
  }

  
}
