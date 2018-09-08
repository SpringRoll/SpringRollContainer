/**
 * The EventDispatcher mirrors the functionality of AS3 and EaselJS's EventDispatcher,
 * but is more robust in terms of inputs for the `on()` and `off()` methods.
 *
 * @class EventDispatcher
 * @constructor
 */
export class EventDispatcher {
  /**
   *Creates an instance of EventDispatcher.
   * @memberof EventDispatcher
   */
  constructor() {
    this._listeners = [];
    this._destroyed = false;
  }

  /**
   *
   *
   * @readonly
   * @memberof EventDispatcher
   */
  get destroyed() {
    return this._destroyed;
  }

  /**
   * Dispatch an event
   * @method trigger
   * @param {String} type The type of event to trigger
   * @param {...*} args Additional parameters for the listener functions.
   */
  trigger(type, ...args) {
    // if destroyed or no listeners of current type
    if (this._destroyed || 'undefined' === typeof this._listeners[type]) {
      return;
    }

    // copy the listeners array
    const listeners = this._listeners[type].slice();

    listeners.forEach(listener => {
      if (listener._eventDispatcherOnce) {
        delete listener._eventDispatcherOnce;
        this.off(type, listener);
      }
      listener.apply(this, args);
    });
  }

  /**
   * Add an event listener but only handle it one time.
   *
   * @method once
   * @param {String|object} name The type of event (can be multiple events separated by spaces),
   *      or a map of events to handlers
   * @param {Function|Array.<*>} callback The callback function when event is fired or an array of callbacks.
   * @param {number} [priority=0] The priority of the event listener. Higher numbers are handled first.
   * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
   */
  once(name, callback, priority) {
    return this.on(name, callback, priority, true);
  }

  /**
   * Add an event listener. The parameters for the listener functions depend on the event.
   *
   * @method on
   * @param {String|object} name The type of event (can be multiple events separated by spaces),
   *      or a map of events to handlers
   * @param {Function|Array.<*>} callback The callback function when event is fired or an array of callbacks.
   * @param {number} [priority=0] The priority of the event listener. Higher numbers are handled first.
   * @param {boolean} [once=false]
   * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
   */
  on(name, callback, priority = 0, once = false) {
    if (this._destroyed) {
      return;
    }

    // Callbacks map
    if ('object' === typeof name) {
      for (const key in name) {
        if (name.hasOwnProperty(key)) {
          this.on(key, name[key], priority, once);
        }
      }
    }
    // Callback
    if ('function' === typeof callback) {
      name.split(' ').forEach(n => {
        if ('undefined' === typeof this._listeners[n]) {
          this._listeners[n] = [];
        }

        const listener = this._listeners[n];

        // @ts-ignore
        callback._eventDispatcherOnce = once;
        // @ts-ignore
        callback._priority = parseInt(priority) || 0;

        if (-1 === listener.indexOf(callback)) {
          listener.push(callback);

          if (1 < listener.length) {
            listener.sort(EventDispatcher.listenerSorter);
          }
        }
      });
    } else if (Array.isArray(callback)) {
      callback.forEach(cb => {
        this.on(name, cb, priority, once);
      });
    }
    return this;
  }

  /**
   *
   *
   * @static
   * @param {*} a
   * @param {*} b
   * @returns
   * @memberof EventDispatcher
   */
  static listenerSorter(a, b) {
    return a._priority - b._priority;
  }

  /**
   * Remove the event listener
   *
   * @method off
   * @param {String|undefined} [name=undefined] The type of event string separated by spaces, if no name is specifed remove all listeners.
   * @param {Function|Array.<*>} callback The listener function or collection of callback functions
   * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
   */
  off(name = undefined, callback) {
    if (this._destroyed) {
      return;
    }

    // remove all
    if ('undefined' === typeof name) {
      this._listeners = [];
    }

    // remove multiple callbacks
    else if (Array.isArray(callback)) {
      callback.forEach(cb => this.off(name, cb));
    } else {
      name.split(' ').forEach(n => {
        const listener = this._listeners[n];
        if (!Array.isArray(listener)) {
          return;
        }

        if ('undefined' === typeof callback) {
          listener.length = 0;
        } else {
          listener.splice(listener.indexOf(callback));
        }
      });

      return this;
    }
  }

  /**
   * Checks if the EventDispatcher has a specific listener or any listener for a given event.
   *
   * @method has
   * @param {String} name The name of the single event type to check for
   * @param {Function} [callback] The listener function to check for. If omitted, checks for any listener.
   * @return {Boolean} If the EventDispatcher has the specified listener.
   */
  has(name, callback) {
    if (!name) {
      return false;
    }

    const listeners = this._listeners[name];
    if (!listeners) {
      return false;
    }
    if (!callback) {
      return listeners.length > 0;
    }
    return listeners.indexOf(callback) >= 0;
  }

  /**
   * Destroy and don't use after this
   * @method destroy
   */
  destroy() {
    this._destroyed = true;
    this._listeners = null;
  }
}
