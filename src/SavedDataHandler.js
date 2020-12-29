import { SavedData } from './SavedData';
/**
 * Default user data handler for the {{#crossLink "springroll.Container"}}Container{{/crossLink}} to save data using
 * the {{#crossLink "springroll.SavedData"}}SavedData{{/crossLink}} class.
 * @class SavedDataHandler
 */
export class SavedDataHandler {
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

  /**
   *  
   */
  IDBAdd(storeName, record) {
    SavedData.IDBAdd(storeName, record);
  }

  /**
   * Closes the connection to the database
   */
  closeDb() {
    SavedData.closeDb();
  }

  /**
   * 
   * @param {*} storeName 
   * @param {*} note 
   */
  deleteRecord(storeName, key) {
    SavedData(storeName, key);
  }

  /**
   * 
   * @param {string} dbName The name of your IndexedDB database
   * @param {string} dbVersion The version number of the database
   * @param {JSON} additions Any additions to the structure of the database
   * @param {array} additions.stores Any stores to be added into the database syntax: {storename: '[name]', options: {[optionally add options]}}
   * @param {array} additions.indexes Any Indexes to be added to the database syntax: {storename: '[name]', options: {[optionally add options]}}
   */
  openDb( dbName, dbVersion = null, additions = {}, deletions = {}) {
    SavedData.openDb( dbName, dbVersion, additions, deletions);
  }

}
