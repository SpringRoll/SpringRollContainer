// Private Variables of SavedData
let WEB_STORAGE_SUPPORT = (() => {
  if ('undefined' === typeof Storage) {
    return false;
  }
  try {
    localStorage.setItem('LS_TEST', 'test');
    localStorage.removeItem('LS_TEST');
    return true;
  } catch (e) {
    return false;
  }
})();

let ERASE_COOKIE = false;

/**
 * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
 *
 * @class SavedData
 */
export class SavedData {
  /**
   * A constant to determine if we can use localStorage and
   * @readonly
   * @static
   * @returns {Boolean}
   * @memberof SavedData
   */
  static get WEB_STORAGE_SUPPORT() {
    return WEB_STORAGE_SUPPORT;
  }

  /**
   * Not recommended. A function to overwrite web storage in the situation you wish to use cookies instead.
   * @static
   * @memberof SavedData
   */
  static disableWebStorage() {
    WEB_STORAGE_SUPPORT = false;
  }

  /**
   * A constant for cookie fallback for `SavedData.clear()`
   * @static
   * @returns {boolean};
   * @memberof SavedData
   */
  static get ERASE_COOKIE() {
    return ERASE_COOKIE;
  }

  /**
   * Sets the cookie fallback for `SavedData.clear()`
   * @param {boolean} flag
   */
  static set ERASE_COOKIE(flag) {
    ERASE_COOKIE = flag;
  }
  /**
   * Remove a saved variable by name.
   * @method remove
   * @static
   * @param {String} name The name of the value to remove
   */
  static remove(name) {
    if (this.WEB_STORAGE_SUPPORT) {
      localStorage.removeItem(name);
      sessionStorage.removeItem(name);
    } else {
      SavedData.write(name, '', this.ERASE_COOKIE);
    }
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
    // if Web Storage is supported
    if (this.WEB_STORAGE_SUPPORT) {
      tempOnly
        ? sessionStorage.setItem(name, JSON.stringify(value))
        : localStorage.setItem(name, JSON.stringify(value));
      return;
    }

    // else use cookies
    const expires = tempOnly
      ? tempOnly !== this.ERASE_COOKIE
        ? ''
        : '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      : '; expires=' + new Date(2147483646000).toUTCString(); //THE END OF (32bit UNIX) TIME!

    document.cookie =
      name + '=' + escape(JSON.stringify(value)) + expires + '; path=/';
  }

  /**
   * Read the value of a saved variable
   * @method read
   * @static
   * @param {String} name The name of the variable
   * @return {*} The value (run through `JSON.parse()`) or null if it doesn't exist
   */
  static read(name) {
    if (!this.WEB_STORAGE_SUPPORT) {
      const nameEQ = `${name}=`;
      const cookie = document.cookie.split(';');

      for (let i = 0, l = cookie.length; i < l; i++) {
        let c = cookie[i];

        while (' ' == c.charAt(0)) {
          c = c.substring(1, c.length);
        }

        if (0 === c.indexOf(nameEQ)) {
          return JSON.parse(unescape(c.substring(nameEQ.length, c.length)));
        }
      }
      return null;
    }
    const value = localStorage.getItem(name) || sessionStorage.getItem(name);

    return JSON.parse(value) || null;
  }
}
