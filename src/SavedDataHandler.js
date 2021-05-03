import { SavedData } from './SavedData';
/**
 * Default user data handler for the {{#crossLink "springroll.Container"}}Container{{/crossLink}} to save data using
 * the {{#crossLink "springroll.SavedData"}}SavedData{{/crossLink}} class.
 * @class SavedDataHandler
 */
export class SavedDataHandler {

  /**
   * 
   */
  constructor() {
    this.dbName;
    this.savedData;
  }
  
  /**
   * Remove a data setting
   * @method  remove
   * @static
   * @param  {String}   name  The name of the property
   * @param  {Function} [callback] Callback when remove is complete
   */
  static remove(name, callback) {
    SavedData.remove(name);
    callback();
  }

  /**
   * Write a custom setting
   * @method  write
   * @static
   * @param  {String}  name  The name of the property
   * @param {*} value The value to set the property to
   * @param  {Function} [callback] Callback when write is complete
   */
  static write(name, value, callback) {
    SavedData.write(name, value);
    callback();
  }

  /**
   * Read a custom setting
   * @method  read
   * @static
   * @param  {String}  name  The name of the property
   * @param  {Function} callback Callback when read is complete, returns the value
   */
  static read(name, callback) {
    callback(SavedData.read(name));
  }

  // ----------------------------------------------------------------
  //                      IndexedDB Manipulation        
  // ----------------------------------------------------------------

  /**
   * Open a connection with the database
   * @param {string} dbName The name of your IndexedDB database
   * @param {string} dbVersion The version number of the database
   * @param {JSON} additions Any additions to the structure of the database
   * @param {array} additions.stores Any stores to be added into the database syntax: 
   * {storeName: '[name]', options: {[optionally add options]}}
   * @param {array} additions.indexes Any Indexes to be added to the database syntax: 
   * {storeName: '[name]', options: {[optionally add options]}}
   */
  IDBOpen( dbName, dbVersion = null, additions = {}, deletions = {}, callback = null) {
    // persisting the savedData object to keep the connection open
    this.savedData = new SavedData();
    this.savedData.IDBOpen( dbName, dbVersion, additions, deletions, callback);
  }

  /**
   * Add a record to a given store
   * @param {string} storeName The name of the store from which the record will be updated
   * @param {string} key the key of the record to be updated 
   * @param {*} value The value for the record with the given key to be updated
   * @param {function} callback The method to call on success or failure. A single value will be passed in
   */
  IDBAdd(storeName, record, key, callback) {
    this.savedData.IDBAdd(storeName, record, key, callback);
  }
  
  /**
   * Update a record from a given store
   * @param {string} storeName The name of the store from which the record will be updated
   * @param {string} key the key of the record to be updated 
   * @param {*} value The value for the record with the given key to be updated
   * @param {function} callback The method to call on success or failure. A single value will be passed in
   */
  IDBUpdate(storeName, key, value, callback) {
    this.savedData.IDBUpdate(storeName, key, value, callback);
  }

  /**
   * Remove a record from a store
   * @param {*} storeName The name of the store from which the record will be removed
   * @param {*} key the key of the record to be removed 
   * @param {function} callback The method to call on success or failure. A single value will be passed in
   */
  IDBRemove(storeName, key, callback) {
    this.savedData.IDBRemove(storeName, key, callback);
  }

  /**
   * Return a record from a given store with a given key
   * @param {string} storeName The name of the store to read from
   * @param {string} key The key for the record in the given store 
   * @param {function} callback The method to call on success or failure. A single value will be passed in
   */
  IDBRead(storeName, key, callback) {
    this.savedData.IDBRead(storeName, key, callback);
  }

  /**
   * Get all records from a store
   * @param {string} storeName The store to get all records from
   * @param {integer} count Optionally the count of records to return
   * @param {function} callback The method to call on success or failure. A single value will be passed in
   */
  IDBReadAll(storeName, count, callback) {
    this.savedData.IDBReadAll(storeName, count, callback);
  }

  /**
   * Get the version of a given database
   * @param {string} dbName The name of the database to return the version of
   * @param {function} callback The method to call on success or failure. A single value will be passed in
   */
  IDBGetVersion(dbName, callback) {
    const sd = new SavedData(dbName);

    sd.IDBGetVersion(dbName, callback);
  }

  /**
   * Closes the connection to the database
   * @param {function} callback The method to call on success or failure. A single value will be passed in
   */
  IDBClose(callback) {
    this.savedData.IDBClose(callback);
  }
  /**
   * Closes the connection to the database
   * @param {function} callback The method to call on success or failure. A single value will be passed in
   */
  IDBDeleteDB(dbName, options, callback) {
    const sd = new SavedData(dbName);
    sd.IDBDeleteDB(dbName, options, callback);
  }

}
