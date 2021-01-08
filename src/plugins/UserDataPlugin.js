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

    this.onAdd = this.onIDBAdd.bind(this);
    this.onIDBOpen = this.onIDBOpen.bind(this);
    this.onIDBRead = this.onIDBRead.bind(this);
    this.onIDBRead = this.onIDBRead.bind(this);
    this.onIDBRemove = this.onIDBRemove.bind(this);

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

    this.client.on('IDBOpen', this.onIDBOpen);
    this.client.on('IDBRead', this.onIDBRead);
    this.client.on('IDBAdd', this.onIDBAdd);
    this.client.on('IDBRemove', this.onIDBRemove);

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
  onIDBAdd(storeName, record) {
    SavedDataHandler.IDBAdd(storeName, record);
  }

  /**
   * Closes the connection to the database
   */
  onCloseDb() {
    SavedDataHandler.closeDb();
  }

  /**
   * 
   * @param {*} storeName 
   * @param {*} note 
   */
  onIDBRemove({storeName, key}) {
    SavedDataHandler(storeName, key);
  }

  /**
   * 
   * @param {string} dbName The name of your IndexedDB database
   * @param {string} dbVersion The version number of the database
   * @param {JSON} additions Any additions to the structure of the database
   * @param {array} additions.stores Any stores to be added into the database syntax: {storename: '[name]', options: {[optionally add options]}}
   * @param {array} additions.indexes Any Indexes to be added to the database syntax: {storename: '[name]', options: {[optionally add options]}}
   */
  onIDBOpen( {dbName, dbVersion = null, additions = {}, deletions = {}}) {
    SavedDataHandler.IDBOpen( dbName, dbVersion, additions, deletions);
  }

  /**
   * 
   * @param {string} storeName 
   */
  getStoreCursor({storeName, keyRange}) {

    SavedDataHandler.getStoreCursor(storeName, keyRange);

  }

  /**
   * 
   */
  onIDBRead({storeName, key}) {
    SavedDataHandler.IDBRead(storeName, key);

  }
}
