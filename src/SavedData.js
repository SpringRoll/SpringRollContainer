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
   *  
   */
  onIDBAdd(storeName, record) {
    if ( !this.db && this.dbName != '') {
      this.onOpenDb(this.dbName);
    }

    const tx = this.db.transaction(storeName, 'readwrite');
    tx.onerror = e => alert( ` Error! ${e.target.error}  `);
    const store = tx.objectStore();
    store.add(record);
  }

  /**
   * Closes the connection to the database
   */
  closeDb() {
    if ( this.db ) {
      this.db.close();
    } 
  }

  /**
   * 
   * @param {*} storeName 
   * @param {*} note 
   */
  onDeleteRecord(storeName, key) {
    if ( !this.db && this.dbName != '') {
      this.onOpenDb(this.dbName);
    }

    const tx = this.db.transaction(storeName, 'readwrite');
    tx.onerror = e => alert( ` Error! ${e.target.error}  `);
    const store = tx.objectStore();
    store.delete(key);
  }

  /**
   * 
   * @param {string} dbName The name of your IndexedDB database
   * @param {string} dbVersion The version number of the database
   * @param {JSON} additions Any additions to the structure of the database
   * @param {array} additions.stores Any stores to be added into the database syntax: {storename: '[name]', options: {[optionally add options]}}
   * @param {array} additions.indexes Any Indexes to be added to the database syntax: {storename: '[name]', options: {[optionally add options]}}
   */
  onOpenDb( dbName, dbVersion = null, additions = {}, deletions = {}) {
    const request = dbVersion ? indexedDB.open(dbName,dbVersion): indexedDB.open(dbName);

    request.onsuccess = e => {
      this.db = e.target.result;
      console.log(this.db);
    };

    //on upgrade needed
    request.onupgradeneeded = e => {
      this.db = e.target.result;

      if (additions.stores) {
        // console.log(additions.stores);
        additions.stores.forEach(e => {
          // console.log(e.keyPath);
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


    request.onerror = e => {
      console.log(e);
      throw (e);
    };
  }

  /**
   * 
   * @param {string} storeName 
   */
  getStoreCursor(storeName, keyRange = null) {

    const tx = this.db.transaction(storeName,'readonly');
    const pNotes = tx.objectStore(storeName);

    
    const request = keyRange == null ? pNotes.openCursor(): pNotes.openCursor(keyRange);
    request.onsuccess = e => {
      const cursor = e.target.result;

      if (cursor) {
        this.client.send('IDBCursorRead', {key: cursor.key, value: cursor.value.text});
        cursor.continue();
      }
    };

  }

  /**
   * 
   */
  onIDBRead(storeName, key) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    const readRequest = store.get(key);

    readRequest.onsuccess = (e) => {
      // receive the event and dispatch custom event with information
      this.client.send('IDBRead', {e});
    };

  }
}
