/**
 * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
 *
 * @class SavedData
 */
export class SavedData {
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
      ? sessionStorage.setItem(name, JSON.stringify(value))
      : localStorage.setItem(name, JSON.stringify(value));
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
}
