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
}
