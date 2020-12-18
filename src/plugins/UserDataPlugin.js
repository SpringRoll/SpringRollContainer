import { SavedDataHandler } from '../SavedDataHandler';
import { BasePlugin } from '../base-plugins';

/**
 * @export
 * @class UserDataPlugin
 * @extends {BasePlugin}
 */
export class UserDataPlugin extends BasePlugin {
  /**
   *Creates an instance of UserDataPlugin.
   * @memberof UserDataPlugin
   */
  constructor() {
    super('UserData-Plugin');
    this.onUserDataRemove = this.onUserDataRemove.bind(this);
    this.onUserDataRead = this.onUserDataRead.bind(this);
    this.onUserDataWrite = this.onUserDataWrite.bind(this);

    this.onAdd = this. onAdd.bind(this);
    this.onOpenDb = this.onOpenDb.bind(this);

    this.db = null;
  }

  /**
   *
   *
   * @memberof UserDataPlugin
   */
  init() {
    this.client.on('userDataRemove', this.onUserDataRemove);
    this.client.on('userDataRead', this.onUserDataRead);
    this.client.on('userDataWrite', this.onUserDataWrite);

    this.client.on('addNote', this.onAddNote);
    this.client.on('penDb', this.onOpenDb);
  }

  /**
   * Handler for the userDataRemove event
   * @method onUserDataRemove
   * @private
   */
  onUserDataRemove({ data, type }) {
    SavedDataHandler.remove(data, () => {
      this.client.send(type);
    });
  }

  /**
   * Handler for the userDataRead event
   * @method onUserDataRead
   * @private
   */
  onUserDataRead({ data, type }) {
    SavedDataHandler.read(data, value => this.client.send(type, value));
  }

  /**
   * Handler for the userDataWrite event
   * @method onUserDataWrite
   * @private
   */
  onUserDataWrite({ type, data: { name, value } }) {
    SavedDataHandler.write(name, value, () => this.client.send(type));
  }

  /**
   *  
   */
  onAdd(storeName, record) {
    const tx = this.db.transaction(storeName, 'readwrite');
    tx.onerror = e => alert( ` Error! ${e.target.error}  `);
    const store = tx.objectStore();
    store.add(record);
  }

  /**
   * Closes the connection to the database
   */
  closeDb() {
    this.db.close();
  }

  /**
   * 
   * @param {*} storeName 
   * @param {*} note 
   */
  onDelete(storeName, key) {
    const tx = this.db.transaction(storeName, 'readwrite');
    tx.onerror = e => alert( ` Error! ${e.target.error}  `);
    const store = tx.objectStore();
    store.delete(key);
  }

  /**
   * 
   * @param {string} dbName The name of your IndexedDB database
   * @param {string} dbVersion The version number of the database
   * @param {string} additions Any 
   */
  onOpenDb( dbName, dbVersion = null, additions = {}) {
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
          store.createIndex(e.indexName, e.keyPath, e.optionalParameters);
        });
      }
      // const store = this.db.createObjectStore('personal_notes', {keyPath: 'title'});

      // alert(`upgrade is called database name: ${this.db.name} version : ${this.db.version}`);
    };


    request.onerror = e => {
      console.log(e);
    };


    
  }


  


  /**
   * 
   * @param {string} storeName 
   */
  getStoreCursor(storeName) {

    const tx = this.db.transaction(storeName,'readonly');
    const pNotes = tx.objectStore(storeName);
    const request = pNotes.openCursor();
    request.onsuccess = e => {

      const cursor = e.target.result;

      // const respond = async () {
        
      // }



      if (cursor) {
        alert(`Title: ${cursor.key} Text: ${cursor.value.text} `);

        // await this.client.send('IDBReadResponce', {key: cursor.key, value: cursor.value.text})
        //do something with the cursor
        cursor.continue();
      }
    };

  }

  /**
   * 
   */
  getRecord(storeName, key) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    store.get(key);

    let result;

    store.onsuccess = (e) => {
      result = e.result;
    };

    return result;
  }
}
