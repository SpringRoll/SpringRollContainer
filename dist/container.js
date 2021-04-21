/*! SpringRoll Container 1.1.2 */
/**
 * @module Core
 * @namespace window
 */
(function(Object, support, undefined)
{

	/**
	 * Add methods to Object
	 * @class Object
	 */

	/**
	 * Merges two (or more) objects, giving the last one precedence
	 * @method merge
	 * @example
		var obj1 = { id : 'foo', name : 'Hello!', value : 100 };
		var obj2 = { id : 'bar', value : 200 };
		Object.merge({}, obj1, obj2); // Returns: { id : 'bar', name : 'Hello!', value : 200 }
	 * @static
	 * @param {Object} target The target object
	 * @param {Object} source* Additional objects to add
	 */
	Object.merge = function(target, source)
	{
		if (!target || typeof target !== 'object')
		{
			target = {};
		}

		for (var property in source)
		{
			if (source.hasOwnProperty(property))
			{
				var sourceProperty = source[property];

				if (typeof sourceProperty === 'object' && Object.isPlain(sourceProperty))
				{
					target[property] = Object.merge(target[property], sourceProperty);
					continue;
				}
				target[property] = sourceProperty;
			}
		}

		for (var i = 2, l = arguments.length; i < l; i++)
		{
			Object.merge(target, arguments[i]);
		}
		return target;
	};

	/**
	 * Check to see if an object is a plain object definition
	 * @method isPlain
	 * @static
	 * @param {Object} target The target object
	 * @return {Boolean} If the object is plain
	 */
	Object.isPlain = function(obj)
	{
		var key;
		var hasOwn = support.hasOwnProperty;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if (!obj || typeof obj !== "object" || obj.nodeType || obj === window)
		{
			return false;
		}

		try
		{
			// Not own constructor property must be Object
			if (obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf"))
			{
				return false;
			}
		}
		catch (e)
		{
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if (support.ownLast)
		{
			for (key in obj)
			{
				return hasOwn.call(obj, key);
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for (key in obj)
		{}

		return key === undefined || hasOwn.call(obj, key);
	};

	/**
	 * Creates a shallow copy of the object.
	 * @method clone
	 * @return {Object} The shallow copy.
	 */
	if (!Object.prototype.clone)
	{
		Object.defineProperty(Object.prototype, 'clone',
		{
			enumerable: false,
			writable: true,
			value: function()
			{
				var rtn = {};
				var thisObj = this;
				for (var key in thisObj)
				{
					rtn[key] = thisObj[key];
				}
				return rtn;
			}
		});
	}

}(Object,
{}));
/**
 * @module Core
 * @namespace window
 */
/**
 * Use to do class inheritence
 * @class extend
 * @static
 */
(function(window)
{

	// The extend function already exists
	if ("extend" in window) return;

	/**
	 * Extend prototype
	 *
	 * @example
		var p = extend(MyClass, ParentClass);
	 *
	 * @constructor
	 * @method extend
	 * @param {function} child The reference to the child class
	 * @param {function|String} [parent] The parent class reference or full classname
	 * @return {object} Reference to the child class's prototype
	 */
	window.extend = function(child, parent)
	{
		if (parent)
		{
			if (typeof parent == "string")
			{
				parent = window.include(parent);
			}
			var p = parent.prototype;
			child.prototype = Object.create(p);
			child.prototype.__parent = p;
		}
		// Add the constructor
		child.prototype.constructor = child;

		// Add extend to each class to easily extend
		// by calling MyClass.extend(SubClass)
		child.extend = function(subClass)
		{
			return window.extend(subClass, child);
		};
		return child.prototype;
	};

}(window));
/**
 * @module Core
 * @namespace window
 */
/**
 * Used to include required classes by name
 * @class include
 * @static
 */
(function(window, undefined)
{

	// The include function already exists
	if ("include" in window) return;

	/**
	 * Import a class
	 *
	 * @example
		var Application = include('springroll.Application');
	 *
	 * @constructor
	 * @method include
	 * @param {string} namespaceString Name space, for instance 'springroll.Application'
	 * @param {Boolean} [required=true] If the class we're trying to include is required.
	 * 		For classes that aren't found and are required, an error is thrown.
	 * @return {object|function} The object attached at the given namespace
	 */
	var include = function(namespaceString, required)
	{
		var parts = namespaceString.split('.'),
			parent = window,
			currentPart = '';

		required = required !== undefined ? !!required : true;

		for (var i = 0, length = parts.length; i < length; i++)
		{
			currentPart = parts[i];
			if (!parent[currentPart])
			{
				if (!required)
				{
					return null;
				}
				if (true)
				{
					throw "Unable to include '" + namespaceString + "' because the code is not included or the class needs to loaded sooner.";
				}
				else
				{
					throw "Unable to include '" + namespaceString + "'";
				}
			}
			parent = parent[currentPart];
		}
		return parent;
	};

	// Assign to the window namespace
	window.include = include;

}(window));
/**
 * @module Core
 * @namespace window
 */
/**
 * Static class for mixing in functionality into objects.
 * @class mixin
 * @static
 */
(function(window, Object)
{
	// The mixin function already exists
	if ("mixin" in window) return;

	/**
	 * Mixin functionality to an object
	 *
	 * @example
		mixin(instance, MyClass);
	 *
	 * @constructor
	 * @method mixin
	 * @param {*} target The instance object to add functionality to
	 * @param {function|String} superClass The parent reference or full classname
	 * @param {*} [args] Any additional arguments to pass to the constructor of the superClass
	 * @return {*} Return reference to target
	 */
	var mixin = function(target, superClass)
	{
		if (true && !superClass)
		{
			throw 'Did not supply a valid mixin class';
		}

		// Include using string
		if (typeof superClass === "string")
		{
			superClass = window.include(superClass);
		}

		// Check for existence of prototype
		if (!superClass.prototype)
		{
			if (true)
			{
				throw 'The mixin class does not have a valid protoype';
			}
			else
			{
				throw 'no mixin prototype';
			}
		}
		//loop over mixin prototype to add functions
		var p = superClass.prototype;

		for (var prop in p)
		{
			// For things that we set using Object.defineProperty
			// very important that enumerable:true for the 
			// defineProperty options
			var propDesc = Object.getOwnPropertyDescriptor(p, prop);
			if (propDesc)
			{
				Object.defineProperty(target, prop, propDesc);
			}
			else
			{
				// Should cover all other prototype methods/properties
				target[prop] = p[prop];
			}
		}
		// call mixin on target and apply any arguments
		superClass.apply(target, Array.prototype.slice.call(arguments, 2));
		return target;
	};

	// Assign to the window namespace
	window.mixin = mixin;

}(window, Object));
/**
 * @module Core
 * @namespace window
 */
/**
 * Static class for namespacing objects and adding
 * classes to it.
 * @class namespace
 * @static
 */
(function(window)
{

	// The namespace function already exists
	if ("namespace" in window) return;

	/**
	 * Create the namespace and assing to the window
	 *
	 * @example
		var SpriteUtils = function(){};
		namespace('springroll').SpriteUtils = SpriteUtils;
	 *
	 * @constructor
	 * @method namespace
	 * @param {string} namespaceString Name space, for instance 'springroll.utils'
	 * @return {object} The namespace object attached to the current window
	 */
	var namespace = function(namespaceString)
	{
		var parts = namespaceString.split('.'),
			parent = window,
			currentPart = '';

		for (var i = 0, length = parts.length; i < length; i++)
		{
			currentPart = parts[i];
			parent[currentPart] = parent[currentPart] ||
			{};
			parent = parent[currentPart];
		}
		return parent;
	};

	// Assign to the window namespace
	window.namespace = namespace;

}(window));
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{

	/**
	 * The EventDispatcher mirrors the functionality of AS3 and EaselJS's EventDispatcher,
	 * but is more robust in terms of inputs for the `on()` and `off()` methods.
	 *
	 * @class EventDispatcher
	 * @constructor
	 */
	var EventDispatcher = function()
	{
		/**
		 * The collection of listeners
		 * @property {Array} _listeners
		 * @private
		 */
		this._listeners = [];

		/**
		 * If the dispatcher is destroyed
		 * @property {Boolean} _destroyed
		 * @protected
		 */
		this._destroyed = false;
	};

	// Reference to the prototype
	var p = extend(EventDispatcher);

	/**
	 * If the dispatcher is destroyed
	 * @property {Boolean} destroyed
	 */
	Object.defineProperty(p, 'destroyed',
	{
		enumerable: true,
		get: function()
		{
			return this._destroyed;
		}
	});

	/**
	 * Dispatch an event
	 * @method trigger
	 * @param {String} type The type of event to trigger
	 * @param {*} arguments Additional parameters for the listener functions.
	 */
	p.trigger = function(type)
	{
		if (this._destroyed) return;

		if (this._listeners[type] !== undefined)
		{
			// copy the listeners array
			var listeners = this._listeners[type].slice();

			var args;

			if (arguments.length > 1)
			{
				args = Array.prototype.slice.call(arguments, 1);
			}

			for (var i = listeners.length - 1; i >= 0; --i)
			{
				var listener = listeners[i];
				if (listener._eventDispatcherOnce)
				{
					delete listener._eventDispatcherOnce;
					this.off(type, listener);
				}
				listener.apply(this, args);
			}
		}
	};

	/**
	 * Add an event listener but only handle it one time.
	 *
	 * @method once
	 * @param {String|object} name The type of event (can be multiple events separated by spaces),
	 *      or a map of events to handlers
	 * @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
	 * @param {int} [priority=0] The priority of the event listener. Higher numbers are handled first.
	 * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	 */
	p.once = function(name, callback, priority)
	{
		return this.on(name, callback, priority, true);
	};

	/**
	 * Add an event listener. The parameters for the listener functions depend on the event.
	 *
	 * @method on
	 * @param {String|object} name The type of event (can be multiple events separated by spaces),
	 *      or a map of events to handlers
	 * @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
	 * @param {int} [priority=0] The priority of the event listener. Higher numbers are handled first.
	 * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	 */
	p.on = function(name, callback, priority, once)
	{
		if (this._destroyed) return;

		// Callbacks map
		if (type(name) === 'object')
		{
			for (var key in name)
			{
				if (name.hasOwnProperty(key))
				{
					this.on(key, name[key], priority, once);
				}
			}
		}
		// Callback
		else if (type(callback) === 'function')
		{
			var names = name.split(' '),
				n = null;

			var listener;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				listener = this._listeners[n];
				if (!listener)
					listener = this._listeners[n] = [];

				if (once)
				{
					callback._eventDispatcherOnce = true;
				}
				callback._priority = parseInt(priority) || 0;

				if (listener.indexOf(callback) === -1)
				{
					listener.push(callback);
					if (listener.length > 1)
						listener.sort(listenerSorter);
				}
			}
		}
		// Callbacks array
		else if (Array.isArray(callback))
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.on(name, callback[f], priority, once);
			}
		}
		return this;
	};

	function listenerSorter(a, b)
	{
		return a._priority - b._priority;
	}

	/**
	 * Remove the event listener
	 *
	 * @method off
	 * @param {String*} name The type of event string separated by spaces, if no name is specifed remove all listeners.
	 * @param {Function|Array*} callback The listener function or collection of callback functions
	 * @return {EventDispatcher} Return this EventDispatcher for chaining calls.
	 */
	p.off = function(name, callback)
	{
		if (this._destroyed) return;

		// remove all
		if (name === undefined)
		{
			this._listeners = [];
		}
		// remove multiple callbacks
		else if (Array.isArray(callback))
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.off(name, callback[f]);
			}
		}
		else
		{
			var names = name.split(' ');
			var n = null;
			var listener;
			var index;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				listener = this._listeners[n];
				if (listener)
				{
					// remove all listeners for that event
					if (callback === undefined)
					{
						listener.length = 0;
					}
					else
					{
						//remove single listener
						index = listener.indexOf(callback);
						if (index !== -1)
						{
							listener.splice(index, 1);
						}
					}
				}
			}
		}
		return this;
	};

	/**
	 * Checks if the EventDispatcher has a specific listener or any listener for a given event.
	 *
	 * @method has
	 * @param {String} name The name of the single event type to check for
	 * @param {Function} [callback] The listener function to check for. If omitted, checks for any listener.
	 * @return {Boolean} If the EventDispatcher has the specified listener.
	 */
	p.has = function(name, callback)
	{
		if (!name) return false;

		var listeners = this._listeners[name];
		if (!listeners) return false;
		if (!callback)
			return listeners.length > 0;
		return listeners.indexOf(callback) >= 0;
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._destroyed = true;
		this._listeners = null;
	};

	/**
	 * Return type of the value.
	 *
	 * @private
	 * @method type
	 * @param  {*} value
	 * @return {String} The type
	 */
	function type(value)
	{
		if (value === null)
		{
			return 'null';
		}
		var typeOfValue = typeof value;
		if (typeOfValue === 'object' || typeOfValue === 'function')
		{
			return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
		}
		return typeOfValue;
	}

	// Assign to name space
	namespace('springroll').EventDispatcher = EventDispatcher;

}());
/**
 * @module Core
 * @namespace springroll
 */
(function(global, doc, undefined)
{

	/**
	 * Handle the page visiblity change, if supported. Application uses one of these to
	 * monitor page visibility. It is suggested that you listen to `pause`, `paused`,
	 * or `resumed` events on the Application instead of using one of these yourself.
	 *
	 * @class PageVisibility
	 * @constructor
	 * @param {Function} onFocus Callback when the page becomes visible
	 * @param {Function} onBlur Callback when the page loses visibility
	 */
	var PageVisibility = function(onFocus, onBlur)
	{
		/**
		 * Callback when the page becomes visible
		 * @property {Function} _onFocus
		 * @private
		 */
		this._onFocus = onFocus;

		/**
		 * Callback when the page loses visibility
		 * @property {Function} _onBlur
		 * @private
		 */
		this._onBlur = onBlur;

		/**
		 * If this object is enabled.
		 * @property {Function} _enabled
		 * @private
		 */
		this._enabled = false;

		// If this browser doesn't support visibility
		if (!_visibilityChange && doc.onfocusin === undefined) return;

		/**
		 * The visibility toggle listener function
		 * @property {Function} _onToggle
		 * @private
		 */
		this._onToggle = function()
		{
			if (doc.hidden || doc.webkitHidden || doc.msHidden || doc.mozHidden)
				this._onBlur();
			else
				this._onFocus();
		}.bind(this);

		this.enabled = true;
	};

	// Reference to the prototype
	var p = extend(PageVisibility);

	/**
	 * The name of the visibility change event for the browser
	 *
	 * @property {String} _visibilityChange
	 * @private
	 */
	var _visibilityChange = null;

	// Select the visiblity change event name
	if (doc.hidden !== undefined)
	{
		_visibilityChange = "visibilitychange";
	}
	else if (doc.mozHidden !== undefined)
	{
		_visibilityChange = "mozvisibilitychange";
	}
	else if (doc.msHidden !== undefined)
	{
		_visibilityChange = "msvisibilitychange";
	}
	else if (doc.webkitHidden !== undefined)
	{
		_visibilityChange = "webkitvisibilitychange";
	}

	var isIE9 = !_visibilityChange && doc.onfocusin !== undefined;

	/**
	 * If this object is enabled.
	 * @property {Function} enabled
	 * @private
	 */
	Object.defineProperty(p, "enabled",
	{
		get: function()
		{
			return this._enabled;
		},
		set: function(value)
		{
			value = !!value;
			if (this._enabled == value) return;
			this._enabled = value;

			global.removeEventListener("pagehide", this._onBlur);
			global.removeEventListener("pageshow", this._onFocus);
			global.removeEventListener("blur", this._onBlur);
			global.removeEventListener("focus", this._onFocus);
			global.removeEventListener("visibilitychange", this._onToggle);
			doc.removeEventListener(_visibilityChange, this._onToggle, false);
			if (isIE9)
			{
				doc.removeEventListener("focusin", this._onFocus);
				doc.removeEventListener("focusout", this._onBlur);
			}

			if (value)
			{
				// Listen to visibility change
				// see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
				doc.addEventListener(_visibilityChange, this._onToggle, false);
				// Listen for page events (when clicking the home button on iOS)
				global.addEventListener("pagehide", this._onBlur);
				global.addEventListener("pageshow", this._onFocus);
				global.addEventListener("blur", this._onBlur);
				global.addEventListener("focus", this._onFocus);
				global.addEventListener("visibilitychange", this._onToggle, false);
				//IE9 is old and uses its own events
				if (isIE9)
				{
					doc.addEventListener("focusin", this._onFocus);
					doc.addEventListener("focusout", this._onBlur);
				}
			}
		}
	});

	/**
	 * Disable the detection
	 * @method destroy
	 */
	p.destroy = function()
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange || !this._onToggle) return;

		this.enabled = false;
		this._onToggle = null;
		this._onFocus = null;
		this._onBlur = null;
	};

	// Assign to the global space
	namespace('springroll').PageVisibility = PageVisibility;

}(window, document));
/**
 * @module Core
 * @namespace springroll
 */
(function(undefined)
{

	/**
	 * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
	 *
	 * @class SavedData
	 */
	var SavedData = {};

	/** 
	 * A constant to determine if we can use localStorage and 
	 * sessionStorage 
	 * @static
	 * @property {Boolean} WEB_STORAGE_SUPPORT
	 * @private
	 * @readOnly
	 */
	var WEB_STORAGE_SUPPORT = window.Storage !== undefined;

	/**
	 * A constant for cookie fallback for `SavedData.clear()` 
	 * @static
	 * @property {int} ERASE_COOKIE
	 * @private
	 * @readOnly
	 * @default -1
	 */
	var ERASE_COOKIE = -1;

	//in iOS, if the user is in Private Browsing, writing to localStorage throws an error.
	if (WEB_STORAGE_SUPPORT)
	{
		try
		{
			localStorage.setItem("LS_TEST", "test");
			localStorage.removeItem("LS_TEST");
		}
		catch (e)
		{
			WEB_STORAGE_SUPPORT = false;
		}
	}

	/**
	 * Remove a saved variable by name.
	 * @method remove
	 * @static
	 * @param {String} name The name of the value to remove
	 */
	SavedData.remove = function(name)
	{
		if (WEB_STORAGE_SUPPORT)
		{
			localStorage.removeItem(name);
			sessionStorage.removeItem(name);
		}
		else
			SavedData.write(name, "", ERASE_COOKIE);
	};

	/**
	 * Save a variable.
	 * @method write
	 * @static
	 * @param {String} name The name of the value to save
	 * @param {mixed} value The value to save. This will be run through JSON.stringify().
	 * @param {Boolean} [tempOnly=false] If the value should be saved only in the current browser session.
	 */
	SavedData.write = function(name, value, tempOnly)
	{
		if (WEB_STORAGE_SUPPORT)
		{
			if (tempOnly)
				sessionStorage.setItem(name, JSON.stringify(value));
			else
				localStorage.setItem(name, JSON.stringify(value));
		}
		else
		{
			var expires;
			if (tempOnly)
			{
				if (tempOnly !== ERASE_COOKIE)
					expires = ""; //remove when browser is closed
				else
					expires = "; expires=Thu, 01 Jan 1970 00:00:00 GMT"; //save cookie in the past for immediate removal
			}
			else
				expires = "; expires=" + new Date(2147483646000).toGMTString(); //THE END OF (32bit UNIX) TIME!

			document.cookie = name + "=" + escape(JSON.stringify(value)) + expires + "; path=/";
		}
	};

	/**
	 * Read the value of a saved variable
	 * @method read
	 * @static
	 * @param {String} name The name of the variable
	 * @return {mixed} The value (run through `JSON.parse()`) or null if it doesn't exist
	 */
	SavedData.read = function(name)
	{
		if (WEB_STORAGE_SUPPORT)
		{
			var value = localStorage.getItem(name) || sessionStorage.getItem(name);
			if (value)
				return JSON.parse(value, SavedData.reviver);
			else
				return null;
		}
		else
		{
			var nameEQ = name + "=",
				ca = document.cookie.split(';'),
				i = 0,
				c, len;

			for (i = 0, len = ca.length; i < len; i++)
			{
				c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) === 0) return JSON.parse(unescape(c.substring(nameEQ.length, c.length)), SavedData.reviver);
			}
			return null;
		}
	};

	/**
	 * When restoring from JSON via `JSON.parse`, we may pass a reviver function.
	 * In our case, this will check if the object has a specially-named property (`__classname`).
	 * If it does, we will attempt to construct a new instance of that class, rather than using a
	 * plain old Object. Note that this recurses through the object.
	 * @method reviver
	 * @static
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
	 * @param  {String} key   each key name
	 * @param  {Object} value Object that we wish to restore
	 * @return {Object}       The object that was parsed - either cast to a class, or not
	 */
	SavedData.reviver = function(key, value)
	{
		if (value && typeof value.__classname == "string")
		{
			var _class = include(value.__classname, false);
			if (_class)
			{
				var rtn = new _class();
				//if we may call fromJSON, do so
				if (rtn.fromJSON)
				{
					rtn.fromJSON(value);
					//return the cast Object
					return rtn;
				}
			}
		}
		//return the object we were passed in
		return value;
	};

	// Assign to the global space
	namespace('springroll').SavedData = SavedData;

}());
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	// Include class
	var SavedData = include('springroll.SavedData');

	/**
	 * Default user data handler for the {{#crossLink "springroll.Container"}}Container{{/crossLink}} to save data using
	 * the {{#crossLink "springroll.SavedData"}}SavedData{{/crossLink}} class.
	 * @class SavedDataHandler
	 */
	var SavedDataHandler = function() {};

	// Reference to prototype
	var p = extend(SavedDataHandler);

	/**
	 * Remove a data setting
	 * @method  remove
	 * @static
	 * @param  {String}   name  The name of the property
	 * @param  {Function} [callback] Callback when remove is complete
	 */
	p.remove = function(name, callback)
	{
		SavedData.remove(name);
		callback();
	};

	/**
	 * Write a custom setting
	 * @method  write
	 * @static
	 * @param  {String}  name  The name of the property
	 * @param {*} value The value to set the property to
	 * @param  {Function} [callback] Callback when write is complete
	 */
	p.write = function(name, value, callback)
	{
		SavedData.write(name, value);
		callback();
	};

	/**
	 * Read a custom setting
	 * @method  read
	 * @static
	 * @param  {String}  name  The name of the property
	 * @param  {Function} callback Callback when read is complete, returns the value
	 */
	p.read = function(name, callback)
	{
		callback(SavedData.read(name));
	};


	// Assign to namespace
	namespace('springroll').SavedDataHandler = SavedDataHandler;

}());
/**
 * @module Container
 * @namespace springroll
 */
(function(undefined)
{
	var Debug = include('springroll.Debug', false);

	/**
	 * Provide feature detection
	 * @class Features
	 */
	var Features = {};

	/**
	 * If the browser has flash
	 * @property {boolean} flash
	 */
	Features.flash = function()
	{
		var hasFlash = false;
		try
		{
			var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			if (fo)
			{
				hasFlash = true;
			}
		}
		catch (e)
		{
			if (navigator.mimeTypes &&
				navigator.mimeTypes['application/x-shockwave-flash'] !== undefined &&
				navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin)
			{
				hasFlash = true;
			}
		}
		return hasFlash;
	}();

	/**
	 * If the browser has WebGL support
	 * @property {boolean} webgl
	 */
	Features.webgl = function()
	{
		var canvas = document.createElement('canvas');
		if ('supportsContext' in canvas)
		{
			return canvas.supportsContext('webgl') ||
				canvas.supportsContext('experimental-webgl');
		}
		return !!window.WebGLRenderingContext;
	}();

	/**
	 * If the browser has Canvas support
	 * @property {boolean} canvas
	 */
	Features.canvas = function()
	{
		var elem = document.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));
	}();

	/**
	 * If the browser has WebAudio API support
	 * @property {boolean} webaudio
	 */
	Features.webaudio = function()
	{
		return 'webkitAudioContext' in window || 'AudioContext' in window;
	}();

	/**
	 * If the browser has Web Sockets API
	 * @property {boolean} websockets
	 */
	Features.websockets = function()
	{
		return 'WebSocket' in window || 'MozWebSocket' in window;
	}();

	/**
	 * If the browser has Geolocation API
	 * @property {boolean} geolocation
	 */
	Features.geolocation = function()
	{
		return 'geolocation' in navigator;
	}();

	/**
	 * If the browser has Web Workers API
	 * @property {boolean} webworkers
	 */
	Features.webworkers = function()
	{
		return !!window.Worker;
	}();

	/**
	 * If the browser has touch
	 * @property {boolean} touch
	 */
	Features.touch = function()
	{
		return !!(('ontouchstart' in window) || // iOS & Android
			(navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0) || // IE10
			(navigator.pointerEnabled && navigator.maxTouchPoints > 0)); // IE11+
	}();

	/**
	 * Test for basic browser compatiliblity 
	 * @method basic
	 * @static
	 * @return {String} The error message, if fails
	 */
	Features.basic = function()
	{
		if (!Features.canvas)
		{
			return 'Browser does not support canvas';
		}
		else if (!Features.webaudio && !Features.flash)
		{
			return 'Browser does not support WebAudio or Flash audio';
		}
		return null;
	};

	/**
	 * See if the current bowser has the correct features
	 * @method test
	 * @static
	 * @param {object} capabilities The capabilities
	 * @param {object} capabilities.features The features
	 * @param {object} capabilities.features.webgl WebGL required
	 * @param {object} capabilities.features.geolocation Geolocation required
	 * @param {object} capabilities.features.webworkers Web Workers API required
	 * @param {object} capabilities.features.webaudio WebAudio API required
	 * @param {object} capabilities.features.websockets WebSockets required
	 * @param {object} capabilities.sizes The sizes
	 * @param {Boolean} capabilities.sizes.xsmall Screens < 480
	 * @param {Boolean} capabilities.sizes.small Screens < 768
	 * @param {Boolean} capabilities.sizes.medium Screens < 992
	 * @param {Boolean} capabilities.sizes.large Screens < 1200
	 * @param {Boolean} capabilities.sizes.xlarge Screens >= 1200
	 * @param {object} capabilities.ui The ui
	 * @param {Boolean} capabilities.ui.touch Touch capable
	 * @param {Boolean} capabilities.ui.mouse Mouse capable
	 * @return {String|null} The error, or else returns null
	 */
	Features.test = function(capabilities)
	{
		// check for basic compatibility
		var err = Features.basic();
		if (err)
		{
			return err;
		}
		var features = capabilities.features;
		var ui = capabilities.ui;
		var sizes = capabilities.sizes;

		for (var name in features)
		{
			if (Features[name] !== undefined)
			{
				// Failed built-in feature check
				if (features[name] && !Features[name])
				{
					return "Browser does not support " + name;
				}
				else
				{
					if (true && Debug)
						Debug.log("Browser has " + name);
				}
			}
			else
			{
				if (true && Debug)
					Debug.warn("The feature " + name + " is not supported");
			}
		}

		// Failed negative touch requirement
		if (!ui.touch && Features.touch)
		{
			return "Game does not support touch input";
		}

		// Failed mouse requirement
		if (!ui.mouse && !Features.touch)
		{
			return "Game does not support mouse input";
		}

		// Check the sizes
		var size = Math.max(window.screen.width, window.screen.height);

		if (!sizes.xsmall && size < 480)
		{
			return "Game doesn't support extra small screens";
		}
		if (!sizes.small && size < 768)
		{
			return "Game doesn't support small screens";
		}
		if (!sizes.medium && size < 992)
		{
			return "Game doesn't support medium screens";
		}
		if (!sizes.large && size < 1200)
		{
			return "Game doesn't support large screens";
		}
		if (!sizes.xlarge && size >= 1200)
		{
			return "Game doesn't support extra large screens";
		}
		return null;
	};

	if (true && Debug)
	{
		Debug.info("Browser Feature Detection" +
			("\n\tFlash support " + (Features.flash ? "\u2713" : "\u00D7")) +
			("\n\tCanvas support " + (Features.canvas ? "\u2713" : "\u00D7")) +
			("\n\tWebGL support " + (Features.webgl ? "\u2713" : "\u00D7")) +
			("\n\tWebAudio support " + (Features.webaudio ? "\u2713" : "\u00D7"))
		);
	}

	//Leak Features namespace
	namespace('springroll').Features = Features;

})();
/**
 * @module Container
 * @namespace springroll
 */
(function(document, undefined)
{
	//Import classes
	var EventDispatcher = include('springroll.EventDispatcher'),
		Features = include('springroll.Features'),
		Bellhop = include('Bellhop');
	/**
	 * The application container
	 * @class Container
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {string} iframeSelector selector for application iframe container
	 * @param {object} [options] Optional parameteres
	 * @param {string} [options.helpButton] selector for help button
	 * @param {string} [options.captionsButton] selector for captions button
	 * @param {string} [options.soundButton] selector for captions button
	 * @param {string} [options.voButton] selector for vo button
	 * @param {string} [options.sfxButton] selector for sounf effects button
	 * @param {string} [options.musicButton] selector for music button
	 * @param {string} [options.pauseButton] selector for pause button
	 * @param {string} [options.pauseFocusSelector='.pause-on-focus'] The class to pause
	 *        the application when focused on. This is useful for form elements which
	 *        require focus and play better with Application's keepFocus option.
	 */
	var Container = function(iframeSelector, options)
	{
		EventDispatcher.call(this);

		/**
		 * The options
		 * @property {Object} options
		 * @readOnly
		 */
		this.options = options ||
		{};

		/**
		 * The name of this class
		 * @property {string} name
		 */
		this.name = 'springroll.Container';

		/**
		 * The current iframe object
		 * @property {HTMLElement} main
		 */
		this.main = document.querySelector(iframeSelector);

		if (null === this.main)
		{
			throw new Error('No iframe was found with the provided selector');
		}

		/**
		 * The DOM object for the iframe
		 * @property {Element} dom
		 */
		this.dom = this.main;

		/**
		 * Communication layer between the container and application
		 * @property {Bellhop} client
		 */
		this.client = null;

		/**
		 * The current release data
		 * @property {Object} release
		 */
		this.release = null;

		/**
		 * Check to see if a application is loaded
		 * @property {Boolean} loaded
		 * @readOnly
		 */
		this.loaded = false;

		/**
		 * Check to see if a application is loading
		 * @property {Boolean} loading
		 * @readOnly
		 */
		this.loading = false;

		// Bind close failed handler
		this._onCloseFailed = this._onCloseFailed.bind(this);

		// Setup plugins
		var plugins = Container._plugins;
		for (var i = 0; i < plugins.length; i++)
		{
			plugins[i].setup.call(this);
		}
	};

	/**
	 * The current version of the library
	 * @property {String} version
	 * @static
	 * @readOnly
	 * @default "1.1.2"
	 */
	Container.version = "1.1.2";

	//Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = EventDispatcher.extend(Container);

	/**
	 * The collection of Container plugins
	 * @property {Array} _plugins
	 * @static
	 * @private
	 */
	Container._plugins = [];

	/**
	 * Open a application or path
	 * @method _internalOpen
	 * @protected
	 * @param {string} path The full path to the application to load
	 * @param {Object} [options] The open options
	 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
	 * @param {Object} [options.playOptions=null] The optional play options
	 */
	p._internalOpen = function(path, options)
	{
		options = Object.merge(
			{
				singlePlay: false,
				playOptions: null
			},
			options
		);

		this.reset();

		// Dispatch event for unsupported browsers
		// and then bail, don't continue with loading the application
		var err = Features.basic();
		if (err)
		{
			/**
			 * Fired when the application is unsupported
			 * @event unsupported
			 * @param {String} err The error message
			 */
			return this.trigger('unsupported', err);
		}

		this.loading = true;

		this.initClient();

		// Open plugins
		var plugins = Container._plugins;
		for (var i = 0; i < plugins.length; i++)
		{
			plugins[i].open.call(this);
		}

		// append a query parameter to pass play options
		if (options.playOptions !== null)
		{
			var playOptionsQueryString = 'playOptions=' + window.encodeURIComponent(JSON.stringify(options.playOptions));

			// if there isn't a query string yet, add the question mark
			if (path.indexOf('?') === -1)
			{
				path += '?' + playOptionsQueryString;
			}

			// otherwise, there already is a query string, so preserve it by appending a new variable
			else
			{
				path += '&' + playOptionsQueryString;
			}
		}

		//Open the application in the iframe
		this.main.classList.add('loading');
		this.main.setAttribute('src', path);

		// Respond with data when we're ready
		this.client.respond('singlePlay', options.singlePlay);
		this.client.respond('playOptions', options.playOptions);

		/**
		 * Event when request to open an application has begin either by
		 * calling `openPath` or `openRemote`
		 * @event open
		 */
		this.trigger('open');
	};

	/**
	 * Open a application or path
	 * @method openPath
	 * @param {string} path The full path to the application to load
	 * @param {Object} [options] The open options
	 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
	 * @param {Object} [options.playOptions=null] The optional play options
	 */
	p.openPath = function(path, options, playOptions)
	{
		options = options ||
		{};

		// This should be deprecated, support for old function signature
		if (typeof options === 'boolean')
		{
			options = {
				singlePlay: singlePlay,
				playOptions: playOptions
			};
		}
		this._internalOpen(path, options);
	};

	/**
	 * Set up communication layer between site and application.
	 * May be called from subclasses if they create/destroy Bellhop instances.
	 * @protected
	 * @method initClient
	 */
	p.initClient = function()
	{
		//Setup communication layer between site and application
		this.client = new Bellhop();
		this.client.connect(this.dom);

		//Handle bellhop events coming from the application
		this.client.on('loading', onLoading.bind(this));
		this.client.on('progress', onProgress.bind(this));
		this.client.on('loaded', onLoadDone.bind(this));
		this.client.on('endGame', onEndGame.bind(this));
		this.client.on('localError', onLocalError.bind(this));
	};

	/**
	 * Removes the Bellhop communication layer altogether.
	 * @protected
	 * @method destroyClient
	 */
	p.destroyClient = function()
	{
		if (this.client)
		{
			this.client.destroy();
			this.client = null;
		}
	};

	/**
	 * Handle the local errors
	 * @method onLocalError
	 * @private
	 * @param  {Event} event Bellhop event
	 */
	var onLocalError = function(event)
	{
		this.trigger(event.type, event.data);
	};

	/**
	 * The game is starting to load
	 * @method onLoading
	 * @private
	 */
	var onLoading = function()
	{
		/**
		 * Event when a application start loading, first event received
		 * from the Application.
		 * @event opening
		 */
		this.trigger('opening');
	};

	/**
	 * The game preload is progressing
	 * @method onProgress
	 * @private
	 * @param  {Event} event Bellhop event
	 */
	var onProgress = function(event)
	{
		/**
		 * Event listing how many assets have loaded as the application loads.
		 * @event progress
		 * @param {Number} percentage The amount loaded from 0 to 1
		 */
		this.trigger('progress', event.data);
	};

	/**
	 * Reset the mutes for audio and captions
	 * @method onLoadDone
	 * @private
	 */
	var onLoadDone = function()
	{
		this.loading = false;
		this.loaded = true;
		this.main.classList.remove('loading');

		var plugins = Container._plugins;
		for (var i = 0; i < plugins.length; i++)
		{
			plugins[i].opened.call(this);
		}

		/**
		 * Event when the application gives the load done signal
		 * @event opened
		 */
		this.trigger('opened');
	};

	/**
	 * The application ended and destroyed itself
	 * @method onEndGame
	 * @private
	 */
	var onEndGame = function()
	{
		this.reset();
	};

	/**
	 * Reset all the buttons back to their original setting
	 * and clear the iframe.
	 * @method reset
	 */
	p.reset = function()
	{
		var wasLoaded = this.loaded || this.loading;

		// Destroy in the reverse priority order
		if (wasLoaded)
		{
			var plugins = Container._plugins;
			for (var i = plugins.length - 1; i >= 0; i--)
			{
				plugins[i].closed.call(this);
			}
		}

		// Remove bellhop instance
		this.destroyClient();

		// Reset state
		this.loaded = false;
		this.loading = false;

		// Clear the iframe src location
		this.main.setAttribute('src', '');
		this.main.classList.remove('loading');

		if (wasLoaded)
		{
			this.off('localError', this._onCloseFailed);

			/**
			 * Event when a application closes
			 * @event closed
			 */
			this.trigger('closed');
		}
	};

	/**
	 * Tell the application to start closing
	 * @method close
	 */
	p.close = function()
	{
		if (this.loading || this.loaded)
		{
			var plugins = Container._plugins;
			for (var i = plugins.length - 1; i >= 0; i--)
			{
				plugins[i].close.call(this);
			}

			/**
			 * Event when a application starts closing
			 * @event close
			 */
			this.trigger('close');

			/**
			 * There was an uncaught iframe error destroying the game on closing
			 * @event localError
			 * @param {Error} error The error triggered
			 */
			this.once('localError', this._onCloseFailed);

			// Start the close
			this.client.send('close');
		}
		else
		{
			this.reset();
		}
	};

	/**
	 * If there was an error when closing, reset the container
	 * @method _onCloseFailed
	 * @private
	 */
	p._onCloseFailed = function()
	{
		this.reset(); // force close the app
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.reset();

		s.destroy.call(this);

		// Destroy in the reverse priority order
		var plugins = Container._plugins;
		for (var i = plugins.length - 1; i >= 0; i--)
		{
			plugins[i].teardown.call(this);
		}

		this.main = null;
		this.options = null;
		this.dom = null;
	};

	namespace('springroll').Container = Container;
})(document);
/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Container;

	/**
	 * Responsible for creating properties, methods to 
	 * the SpringRoll Container when it's created.
	 *
	 *	var plugin = new ContainerPlugin();
	 *	plugin.setup = function()
	 *	{
	 *		// Do setup here
	 *	};
	 *
	 * @class ContainerPlugin
	 * @constructor
	 * @param {int} [priority=0] The priority, higher priority
	 *        plugins are setup, preloaded and destroyed first.
	 */
	var ContainerPlugin = function(priority)
	{
		if (!Container)
		{
			Container = include('springroll.Container');
		}

		/**
		 * The priority of the plugin. Higher numbers handled first. This should be set
		 * in the constructor of the extending ContainerPlugin.
		 * @property {int} priority
		 * @default 0
		 * @private
		 */
		this.priority = priority || 0;

		/**
		 * When the Container is being initialized. This function 
		 * is bound to the Container. This should be overridden.
		 * @method setup
		 */
		this.setup = function() {};

		/**
		 * Called when an application is opening and before the 
		 * app has completely finished loading.
		 * @method open 
		 */
		this.open = function() {};

		/**
		 * Called when an application is opening and before the 
		 * app has completely finished loading.
		 * @method opened 
		 */
		this.opened = function() {};

		/**
		 * Called when an application has begun to be closed.
		 * @method close 
		 */
		this.close = function() {};

		/**
		 * Called when an application is closed completely.
		 * @method closed
		 */
		this.closed = function() {};

		/**
		 * When the Container is being destroyed. This function 
		 * is bound to the Container. This should be overridden.
		 * @method teardown
		 */
		this.teardown = function() {};

		// Add the plugin to Container
		Container._plugins.push(this);
		Container._plugins.sort(function(a, b)
		{
			return b.priority - a.priority;
		});
	};

	// Assign to namespace
	namespace('springroll').ContainerPlugin = ContainerPlugin;

}());
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var SavedData = springroll.SavedData;

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(100);

	plugin.setup = function()
	{
		/**
		 * Should we send bellhop messages for the mute (etc) buttons?
		 * @property {Boolean} sendMutes
		 * @default true
		 */
		this.sendMutes = true;

		/**
		 * Abstract method to handle the muting
		 * @method _setMuteProp
		 * @protected
		 * @param {string} prop The name of the property to save
		 * @param {HTMLElement} button Reference to the button
		 * @param {boolean} muted  If the button is muted
		 */
		this._setMuteProp = function(prop, button, muted)
		{
			function removeListeners(button)
			{
				if (button === null)
				{
					return;
				}

				button.classList.remove('unmuted');
				button.classList.remove('muted');
				button.classList.add(muted ? 'muted' : 'unmuted');
			}
			if (Array.isArray(button))
			{
				for (var i = 0, length = button.length; i < length; i++)
				{
					removeListeners(button[i]);
				}
			}
			else
			{
				removeListeners(button);
			}

			SavedData.write(prop, muted);
			if (this.client && this.sendMutes)
			{
				this.client.send(prop, muted);
			}
		};

		/**
		 * Disable a button
		 * @method disableButton
		 * @private
		 * @param {HTMLElement} button The button to disable
		 */
		this._disableButton = function(button)
		{
			if (button === null)
			{
				return;
			}

			button.classList.remove('enabled');
			button.classList.add('disabled');
		};
	};

	plugin.teardown = function()
	{
		delete this._disableButton;
		delete this._setMuteProp;
		delete this.sendMutes;
	};
})();
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var SavedData = include('springroll.SavedData');

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(70);

	/**
	 * The name of the saved property for the captions styles
	 * @property {string} CAPTIONS_STYLES
	 * @static
	 * @private
	 * @final
	 */
	var CAPTIONS_STYLES = 'captionsStyles';

	/**
	 * The map of the default caption style settings
	 * @property {object} DEFAULT_CAPTIONS_STYLES
	 * @static
	 * @private
	 * @final
	 */
	var DEFAULT_CAPTIONS_STYLES = {
		size: 'md',
		background: 'black-semi',
		color: 'white',
		edge: 'none',
		font: 'arial',
		align: 'top'
	};

	/**
	 * The name of the saved property if the captions are muted or not
	 * @property {string} CAPTIONS_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var CAPTIONS_MUTED = 'captionsMuted';

	plugin.setup = function()
	{
		/**
		 * The collection of captions styles
		 * @property {string} _captionsStyles
		 * @private
		 */
		this._captionsStyles = Object.merge(
			{},
			DEFAULT_CAPTIONS_STYLES,
			SavedData.read(CAPTIONS_STYLES) ||
			{}
		);

		/**
		 * Reference to the captions button
		 * @property {HTMLElement} captionsButton
		 */
		this.captionsButton = document.querySelector(this.options.captionsButton);

		if (null === this.captionsButton)
		{
			return;
		}

		this.captionsButtonClick = function()
		{
			this.captionsMuted = !this.captionsMuted;
		}.bind(this);

		this.captionsButton.addEventListener('click', this.captionsButtonClick);

		/**
		 * Set the captions are enabled or not
		 * @property {boolean} captionsMuted
		 * @default true
		 */
		Object.defineProperty(this, CAPTIONS_MUTED,
		{
			set: function(muted)
			{
				this._captionsMuted = muted;
				this._setMuteProp(CAPTIONS_MUTED, this.captionsButton, muted);
			},
			get: function()
			{
				return this._captionsMuted;
			}
		});

		/**
		 * Set the captions styles
		 * @method setCaptionsStyles
		 * @param {object|String} [styles] The style options or the name of the
		 * property (e.g., "color", "edge", "font", "background", "size")
		 * @param {string} [styles.color='white'] The text color, the default is white
		 * @param {string} [styles.edge='none'] The edge style, default is none
		 * @param {string} [styles.font='arial'] The font style, default is arial
		 * @param {string} [styles.background='black-semi'] The background style, black semi-transparent
		 * @param {string} [styles.size='md'] The font style default is medium
		 * @param {string} [styles.align='top'] The align style default is top of the window
		 * @param {string} [value] If setting styles parameter as a string, this is the value of the property.
		 */
		this.setCaptionsStyles = function(styles, value)
		{
			if (typeof styles === 'object')
			{
				Object.merge(this._captionsStyles, styles ||
				{});
			}
			else if (typeof styles === 'string')
			{
				this._captionsStyles[styles] = value;
			}

			styles = this._captionsStyles;

			// Do some validation on the style settings
			if (true)
			{
				var colorReg = /^(black|white|red|yellow|pink|blue)(-semi)?$/;
				var backgroundReg = /^none|((black|white|red|yellow|pink|blue)(-semi)?)$/;
				var sizeReg = /^(xs|sm|md|lg|xl)$/;
				var edgeReg = /^(raise|depress|uniform|drop|none)$/;
				var fontReg = /^(georgia|palatino|times|arial|arial-black|comic-sans|impact|lucida|tahoma|trebuchet|verdana|courier|console)$/;
				var alignReg = /^(top|bottom)$/;

				if (!styles.color || !colorReg.test(styles.color))
				{
					throw 'Setting captions color style is invalid value : ' +
						styles.color;
				}
				if (!styles.background || !backgroundReg.test(styles.background))
				{
					throw 'Setting captions background style is invalid value : ' +
						styles.background;
				}
				if (!styles.size || !sizeReg.test(styles.size))
				{
					throw 'Setting captions size style is invalid value : ' + styles.size;
				}
				if (!styles.edge || !edgeReg.test(styles.edge))
				{
					throw 'Setting captions edge style is invalid value : ' + styles.edge;
				}
				if (!styles.font || !fontReg.test(styles.font))
				{
					throw 'Setting captions font style is invalid value : ' + styles.font;
				}
				if (!styles.align || !alignReg.test(styles.align))
				{
					throw 'Setting captions align style is invalid value : ' +
						styles.align;
				}
			}

			SavedData.write(CAPTIONS_STYLES, styles);
			if (this.client)
			{
				this.client.send(CAPTIONS_STYLES, styles);
			}
		};

		/**
		 * Get the captions styles
		 * @method getCaptionsStyles
		 * @param {string} [prop] The optional property, values are "size", "edge", "font", "background", "color"
		 * @return {object} The collection of styles, see setCaptionsStyles for more info.
		 */
		this.getCaptionsStyles = function(prop)
		{
			var styles = this._captionsStyles;
			return prop ? styles[prop] : styles;
		};

		/**
		 * Reset the captions styles
		 * @method clearCaptionsStyles
		 */
		this.clearCaptionsStyles = function()
		{
			this._captionsStyles = Object.merge(
			{}, DEFAULT_CAPTIONS_STYLES);
			this.setCaptionsStyles();
		};

		// Handle the features request
		this.on('features', function(features)
		{
			this.captionsButton.style.display = 'none';
			if (features.captions) this.captionsButton.style.display = 'inline-block';
		});

		//Set the defaults if we have none for the controls
		if (SavedData.read(CAPTIONS_MUTED) === null)
		{
			this.captionsMuted = true;
		}
	};

	plugin.opened = function()
	{
		if (null === this.captionsButton)
		{
			return;
		}

		this.captionsButton.classList.remove('disabled');
		this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
		this.setCaptionsStyles(SavedData.read(CAPTIONS_STYLES));
	};

	plugin.close = function()
	{
		if (null === this.captionsButton)
		{
			return;
		}

		this._disableButton(this.captionsButton);
	};

	plugin.teardown = function()
	{
		if (null === this.captionsButton)
		{
			return;
		}

		this.captionsButton.removeEventListener('click', this.captionsButtonClick);
		delete this.captionsButton;
		delete this._captionsStyles;
		delete this.getCaptionsStyles;
		delete this.setCaptionsStyles;
		delete this.clearCaptionsStyles;
		delete this._captionsMuted;
	};
})();
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(90);

	plugin.open = function()
	{
		this._onFeatures = onFeatures.bind(this);
		this.client.on('features', this._onFeatures);
	};

	plugin.close = function()
	{
		this.client.off('features', this._onFeatures);
		delete this._onFeatures;
	};

	var onFeatures = function(event)
	{
		/**
		 * The features supported by the application
		 * @event features
		 * @param {Boolean} data.vo If VO vo context is supported
		 * @param {Boolean} data.music If music context is supported
		 * @param {Boolean} data.sound If Sound is supported
		 * @param {Boolean} data.sfx If SFX context is supported
		 * @param {Boolean} data.captions If captions is supported
		 * @param {Boolean} data.hints If hinting is supported
		 * @param {Boolean} data.disablePause If pause is disabled for debugging
		 */
		this.trigger('features', event.data);
	};

}());
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var PageVisibility = include('springroll.PageVisibility');

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(90);

	plugin.setup = function()
	{
		// Add the default option for pauseFocusSelector
		this.options = Object.merge(
			{
				pauseFocusSelector: '.pause-on-focus'
			},
			this.options
		);

		/**
		 * Handle the page visiblity change events, like opening a new tab
		 * or blurring the current page.
		 * @property {springroll.PageVisibility} _pageVisibility
		 * @private
		 */
		this._pageVisibility = new PageVisibility(
			onContainerFocus.bind(this),
			onContainerBlur.bind(this)
		);

		/**
		 * Whether the Game is currently "blurred" (not focused) - for pausing/unpausing
		 * @property {Boolean} _appBlurred
		 * @private
		 * @default  false
		 */
		this._appBlurred = false;

		/**
		 * Always keep the focus on the application iframe
		 * @property {Boolean} _keepFocus
		 * @private
		 * @default  false
		 */
		this._keepFocus = false;

		/**
		 * Whether the Container is currently "blurred" (not focused) - for pausing/unpausing
		 * @property {Boolean} _containerBlurred
		 * @private
		 * @default  false
		 */
		this._containerBlurred = false;

		/**
		 * Delays pausing of application to mitigate issues with asynchronous communication
		 * between Game and Container
		 * @property {int} _focusTimer
		 */
		this._focusTimer = null;

		// Focus on the window on focusing on anything else
		// without the .pause-on-focus class
		this._onDocClick = onDocClick.bind(this);
		document.addEventListener('focus', this._onDocClick);
		document.addEventListener('click', this._onDocClick);

		/**
		 * Focus on the iframe's contentWindow
		 * @method focus
		 */
		this.focus = function()
		{
			this.dom.contentWindow.focus();
		};

		/**
		 * Unfocus on the iframe's contentWindow
		 * @method blur
		 */
		this.blur = function()
		{
			this.dom.contentWindow.blur();
		};

		/**
		 * Manage the focus change events sent from window and iFrame
		 * @method manageFocus
		 * @protected
		 */
		this.manageFocus = function()
		{
			// Unfocus on the iframe
			if (this._keepFocus)
			{
				this.blur();
			}

			// we only need one delayed call, at the end of any
			// sequence of rapidly-fired blur/focus events
			if (this._focusTimer)
			{
				clearTimeout(this._focusTimer);
			}

			// Delay setting of 'paused' in case we get another focus event soon.
			// Focus events are sent to the container asynchronously, and this was
			// causing rapid toggling of the pause state and related issues,
			// especially in Internet Explorer
			this._focusTimer = setTimeout(
				function()
				{
					this._focusTimer = null;
					// A manual pause cannot be overriden by focus events.
					// User must click the resume button.
					if (this._isManualPause) return;

					this.paused = this._containerBlurred && this._appBlurred;

					// Focus on the content window when blurring the app
					// but selecting the container
					if (this._keepFocus && !this._containerBlurred && this._appBlurred)
					{
						this.focus();
					}
				}.bind(this),
				100
			);
		};

		// On elements with the class name pause-on-focus
		// we will pause the game until a blur event to that item
		// has been sent
		var self = this;
		var pauseFocus = document.querySelector(this.options.pauseFocusSelector);

		if (null === pauseFocus)
		{
			return;
		}

		pauseFocus.addEventListener('focus', function()
		{
			self._isManualPause = self.paused = true;
			self.addEventListener(
				'blur',
				function()
				{
					self._isManualPause = self.paused = false;
					self.focus();
				},
				{
					once: true
				}
			);
		});
	};

	/**
	 * When the document is clicked
	 * @method _onDocClicked
	 * @private
	 * @param  {Event} e Click or focus event
	 */
	var onDocClick = function(e)
	{
		if (!this.loaded) return;

		this.focus();
	};

	/**
	 * Handle the keep focus event for the window
	 * @method onKeepFocus
	 * @private
	 */
	var onKeepFocus = function(event)
	{
		this._keepFocus = !!event.data;
		this.manageFocus();
	};

	/**
	 * Handle focus events sent from iFrame children
	 * @method onFocus
	 * @private
	 */
	var onFocus = function(e)
	{
		this._appBlurred = !e.data;
		this.manageFocus();
	};

	/**
	 * Handle focus events sent from container's window
	 * @method onContainerFocus
	 * @private
	 */
	var onContainerFocus = function(e)
	{
		this._containerBlurred = false;
		this.manageFocus();
	};

	/**
	 * Handle blur events sent from container's window
	 * @method onContainerBlur
	 * @private
	 */
	var onContainerBlur = function(e)
	{
		//Set both container and application to blurred,
		//because some blur events are only happening on the container.
		//If container is blurred because application area was just focused,
		//the application's focus event will override the blur imminently.
		this._containerBlurred = this._appBlurred = true;
		this.manageFocus();
	};

	plugin.open = function()
	{
		this.client.on('focus', onFocus.bind(this));
		this.client.on('keepFocus', onKeepFocus.bind(this));
	};

	plugin.opened = function()
	{
		this.focus();
	};

	plugin.close = function()
	{
		// Stop the focus timer if it's running
		if (this._focusTimer)
		{
			clearTimeout(this._focusTimer);
		}
	};

	plugin.teardown = function()
	{
		var pauseFocus = document.querySelector(this.options.pauseFocusSelector);
		if (pauseFocus !== null)
		{
			pauseFocus.removeEventListener('focus');
		}

		document.removeEventListener('focus', this._onDocClick);
		document.removeEventListener('click', this._onDocClick);
		delete this._onDocClick;
		if (this._pageVisibility)
		{
			this._pageVisibility.destroy();
			delete this._pageVisibility;
		}
		delete this.focus;
		delete this.blur;
		delete this.manageFocus;
		delete this._appBlurred;
		delete this._focusTimer;
		delete this._keepFocus;
		delete this._containerBlurred;
	};
})();
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(50);

	plugin.setup = function()
	{
		/**
		 * Reference to the help button
		 * @property {HTMLElement} helpButton
		 */
		this.helpButton = document.querySelector(this.options.helpButton);

		if (null === this.helpButton)
		{
			return;
		}

		// store the listener so that we can use it later
		this.helpButtonClick = function()
		{
			if (!this.paused && !this.helpButton.classList.contains('disabled'))
			{
				this.client.send('playHelp');
			}
		}.bind(this);

		this.helpButton.addEventListener('click', this.helpButtonClick);

		this.helpButton.tooltip = function()
		{
			// TODO: Add non jQuery tool tips
		};

		// Handle pause
		this.on('pause', function(paused)
		{
			// Disable the help button when paused if it's active
			if (paused && !this.helpButton.classList.contains('disabled'))
			{
				this.helpButton.setAttribute('data-paused', true);
				this.helpEnabled = false;
			}
			else if (this.helpButton.getAttribute('data-paused'))
			{
				this.helpButton.setAttribute('data-paused', '');
				this.helpEnabled = true;
			}
		});

		/**
		 * Set the captions are muted
		 * @property {Boolean} helpEnabled
		 */
		Object.defineProperty(this, 'helpEnabled',
		{
			set: function(enabled)
			{
				this._helpEnabled = enabled;
				this.helpButton.classList.remove('disabled');
				this.helpButton.classList.remove('enabled');
				this.helpButton.classList.add(enabled ? 'enabled' : 'disabled');

				/**
				 * Fired when the enabled status of the help button changes
				 * @event helpEnabled
				 * @param {boolean} enabled If the help button is enabled
				 */
				this.trigger('helpEnabled', enabled);
			},
			get: function()
			{
				return this._helpEnabled;
			}
		});

		// Handle features changed
		this.on(
			'features',
			function(features)
			{
				this.helpButton.style.display = 'none';
				if (features.hints) this.helpButton.style.display = 'inline-block';
			}.bind(this)
		);
	};

	plugin.open = function()
	{
		this.client.on(
			'helpEnabled',
			function(event)
			{
				this.helpEnabled = !!event.data;
			}.bind(this)
		);
	};

	plugin.close = function()
	{
		this.client.off('helpEnabled');
		this.helpEnabled = false;
	};

	plugin.teardown = function()
	{
		if (null === this.helpButton)
		{
			return;
		}

		this.helpButton.removeEventListener('click', this.helpButtonClick);
		delete this.helpButton;
		delete this._helpEnabled;
	};
})();
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(80);

	plugin.setup = function()
	{
		/**
		 * Reference to the pause application button
		 * @property {HTMLElement} pauseButton
		 */
		this.pauseButton = document.querySelectorAll(this.options.pauseButton);

		this.onPauseToggle = onPauseToggle.bind(this);

		for (var i = 0; i < this.pauseButton.length; i++)
		{
			this.pauseButton[i].addEventListener('click', this.onPauseToggle);
		}

		/**
		 * If the application is currently paused manually
		 * @property {boolean} _isManualPause
		 * @private
		 * @default false
		 */
		this._isManualPause = false;

		/**
		 * If the current application is paused
		 * @property {Boolean} _disablePause
		 * @private
		 * @default false
		 */
		this._disablePause = false;

		/**
		 * If the current application is paused
		 * @property {Boolean} _paused
		 * @private
		 * @default false
		 */
		this._paused = false;

		/**
		 * If the current application is paused
		 * @property {Boolean} paused
		 * @default false
		 */
		Object.defineProperty(this, 'paused',
		{
			set: function(paused)
			{
				if (!this._disablePause)
				{
					this._paused = paused;

					if (this.client)
					{
						this.client.send('pause', paused);
					}
					/**
					 * Fired when the pause state is toggled
					 * @event pause
					 * @param {boolean} paused If the application is now paused
					 */
					/**
					 * Fired when the application resumes from a paused state
					 * @event resumed
					 */
					/**
					 * Fired when the application becomes paused
					 * @event paused
					 */
					this.trigger(paused ? 'paused' : 'resumed');
					this.trigger('pause', paused);

					// Set the pause button state
					for (var i = 0; i < this.pauseButton.length; i++)
					{
						var element = this.pauseButton[i];
						element.classList.remove('unpaused');
						element.classList.remove('paused');
						element.classList.add(paused ? 'paused' : 'unpaused');
					}
				}
			},
			get: function()
			{
				return this._paused;
			}
		});

		this.on(
			'features',
			function(features)
			{
				if (features.disablePause) this._disablePause = true;
			}.bind(this)
		);
	};

	/**
	 * Toggle the current paused state of the application
	 * @method onPauseToggle
	 * @private
	 */
	var onPauseToggle = function()
	{
		this.paused = !this.paused;
		this._isManualPause = this.paused;
	};

	plugin.opened = function()
	{
		for (var i = 0; i < this.pauseButton.length; i++)
		{
			this.pauseButton[i].classList.remove('disabled');
		}

		// Reset the paused state
		this.paused = this._paused;
	};

	plugin.close = function()
	{
		for (var i = 0; i < this.pauseButton.length; i++)
		{
			this._disableButton.bind(this.pauseButton[i]);
		}
		this.paused = false;
	};

	plugin.teardown = function()
	{
		for (var i = 0; i < this.pauseButton.length; i++)
		{
			this.pauseButton[i].removeEventListener('click', this.onPauseToggle);
		}
		delete this.pauseButton;
		delete this._isManualPause;
		delete this._paused;
	};
})();
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var Features = include('springroll.Features');

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(30);

	plugin.setup = function()
	{
		/**
		 * The release object from SpringRoll Connect
		 * @property {Object} release
		 */
		this.release = null;

		/**
		 * Open application based on an API Call to SpringRoll Connect
		 * @method openRemote
		 * @param {string} api The path to API call, this can be a full URL
		 * @param {Object} [options] The open options
		 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
		 * @param {Object} [options.playOptions=null] The optional play options
		 * @param {String} [options.query=''] The application query string options (e.g., "?level=1")
		 */
		this.openRemote = function(api, options, playOptions)
		{
			// This should be deprecated, support for old function signature
			if (typeof options === 'boolean')
			{
				options = {
					singlePlay: singlePlay,
					playOptions: playOptions
				};
			}
			options = Object.merge(
				{
					query: '',
					playOptions: null,
					singlePlay: false
				},
				options
			);

			this.release = null;

			var xhttp = new XMLHttpRequest();

			xhttp.onResponse = function(release)
			{
				var err = Features.test(release.capabilities);

				if (err)
				{
					return this.trigger('unsupported', err);
				}

				this.release = release;
				this._internalOpen(release.url + options.query, options);
			}.bind(this);

			xhttp.onreadystatechange = function()
			{
				if (this.readyState == 4 && this.status == 200)
				{
					this.onResponse(JSON.parse(this.response).data);
				}
			};

			xhttp.open('GET', api, true);
			xhttp.send();
		};
	};

	plugin.teardown = function()
	{
		delete this.openRemote;
		delete this.release;
	};
})();
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var SavedData = include('springroll.SavedData');

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(60);

	/**
	 * The name of the saved property if the sound is muted or not
	 * @property {string} SOUND_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var SOUND_MUTED = 'soundMuted';

	/**
	 * The name of the saved property if the music is muted or not
	 * @property {string} MUSIC_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var MUSIC_MUTED = 'musicMuted';

	/**
	 * The name of the saved property if the voice-over is muted or not
	 * @property {string} VO_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var VO_MUTED = 'voMuted';

	/**
	 * The name of the saved property if the effects are muted or not
	 * @property {string} SFX_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var SFX_MUTED = 'sfxMuted';

	plugin.setup = function()
	{
		/**
		 * Reference to the all sound mute button
		 * @property {HTMLElement} soundButton
		 */
		this.soundButton = document.querySelector(this.options.soundButton);

		/**
		 * Reference to the music mute button
		 * @property {HTMLElement} musicButton
		 */
		this.musicButton = document.querySelector(this.options.musicButton);

		/**
		 * Reference to the sound effects mute button
		 * @property {HTMLElement} sfxButton
		 */
		this.sfxButton = document.querySelector(this.options.sfxButton);

		/**
		 * Reference to the voice-over mute button
		 * @property {HTMLElement} voButton
		 */
		this.voButton = document.querySelector(this.options.voButton);

		if (null !== this.soundButton)
		{
			this.soundButton.addEventListener('click', onSoundToggle.bind(this));
		}

		if (null !== this.musicButton)
		{
			this.musicButton.addEventListener('click', onMusicToggle.bind(this));
		}

		if (null !== this.sfxButton)
		{
			this.sfxButton.addEventListener('click', onSFXToggle.bind(this));
		}

		if (null !== this.voButton)
		{
			this.voButton.addEventListener('click', onVOToggle.bind(this));
		}

		/**
		 * Check for when all mutes are muted or unmuted
		 * @method _checkSoundMute
		 * @private
		 */
		this._checkSoundMute = function()
		{
			this.soundMuted = this.sfxMuted && this.voMuted && this.musicMuted;
		};

		/**
		 * Set the all sound is enabled or not
		 * @property {boolean} soundMuted
		 * @default false
		 */
		Object.defineProperty(this, SOUND_MUTED,
		{
			set: function(muted)
			{
				this._soundMuted = muted;
				this._setMuteProp(SOUND_MUTED, this.soundButton, muted);
			},
			get: function()
			{
				return this._soundMuted;
			}
		});

		/**
		 * Set the voice-over audio is muted
		 * @property {boolean} voMuted
		 * @default true
		 */
		Object.defineProperty(this, VO_MUTED,
		{
			set: function(muted)
			{
				this._voMuted = muted;
				this._setMuteProp(VO_MUTED, this.voButton, muted);
			},
			get: function()
			{
				return this._voMuted;
			}
		});

		/**
		 * Set the music audio is muted
		 * @property {boolean} musicMuted
		 * @default true
		 */
		Object.defineProperty(this, MUSIC_MUTED,
		{
			set: function(muted)
			{
				this._musicMuted = muted;
				this._setMuteProp(MUSIC_MUTED, this.musicButton, muted);
			},
			get: function()
			{
				return this._musicMuted;
			}
		});

		/**
		 * Set the sound effect audio is muted
		 * @property {boolean} sfxMuted
		 * @default true
		 */
		Object.defineProperty(this, SFX_MUTED,
		{
			set: function(muted)
			{
				this._sfxMuted = muted;
				this._setMuteProp(SFX_MUTED, this.sfxButton, muted);
			},
			get: function()
			{
				return this._sfxMuted;
			}
		});

		//Set the defaults if we have none for the controls
		if (SavedData.read(SOUND_MUTED) === null)
		{
			this.soundMuted = false;
		}

		this.on(
			'features',
			function(features)
			{
				if (this.voButton !== null)
				{
					this.voButton.style.display = 'none';
				}

				if (this.musicButton !== null)
				{
					this.musicButton.style.display = 'none';
				}

				if (this.soundButton !== null)
				{
					this.soundButton.style.display = 'none';
				}

				if (this.sfxButton !== null)
				{
					this.sfxButton.style.display = 'none';
				}

				if (features.vo && this.voButton) this.voButton.style.display = 'inline-block';
				if (features.music && this.musicButton) this.musicButton.style.display = 'inline-block';
				if (features.sound && this.soundButton) this.soundButton.style.display = 'inline-block';
				if (features.sfx && this.sfxButton) this.sfxButton.style.display = 'inline-block';
			}.bind(this)
		);
	};

	/**
	 * Handler when the sound mute button is clicked
	 * @method onSoundToggle
	 * @private
	 */
	var onSoundToggle = function()
	{
		var muted = !this.soundMuted;
		this.soundMuted = muted;
		this.musicMuted = muted;
		this.voMuted = muted;
		this.sfxMuted = muted;
	};

	/**
	 * Handler when the music mute button is clicked
	 * @method onMusicToggle
	 * @private
	 */
	var onMusicToggle = function()
	{
		this.musicMuted = !this.musicMuted;
		this._checkSoundMute();
	};

	/**
	 * Handler when the voice-over mute button is clicked
	 * @method onVOToggle
	 * @private
	 */
	var onVOToggle = function()
	{
		this.voMuted = !this.voMuted;
		this._checkSoundMute();
	};

	/**
	 * Handler when the voice-over mute button is clicked
	 * @method onSFXToggle
	 * @private
	 */
	var onSFXToggle = function()
	{
		this.sfxMuted = !this.sfxMuted;
		this._checkSoundMute();
	};

	plugin.open = function() {};

	plugin.opened = function()
	{
		if (this.soundButton !== null)
		{
			this.soundButton.classList.remove('disabled');
		}

		if (this.sfxButton !== null)
		{
			this.sfxButton.classList.remove('disabled');
		}

		if (this.voButton !== null)
		{
			this.voButton.classList.remove('disabled');
		}

		if (this.musicButton !== null)
		{
			this.musicButton.classList.remove('disabled');
		}

		this.soundMuted = !!SavedData.read(SOUND_MUTED);
		this.musicMuted = !!SavedData.read(MUSIC_MUTED);
		this.sfxMuted = !!SavedData.read(SFX_MUTED);
		this.voMuted = !!SavedData.read(VO_MUTED);
	};

	plugin.close = function()
	{
		this._disableButton(this.soundButton);
		this._disableButton(this.musicButton);
		this._disableButton(this.voButton);
		this._disableButton(this.sfxButton);
	};

	plugin.teardown = function()
	{
		if (this.soundButton !== null)
		{
			this.soundButton.removeEventListener('click', onSoundToggle.bind(this));
		}

		if (this.musicButton !== null)
		{
			this.musicButton.removeEventListener('click', onMusicToggle.bind(this));
		}

		if (this.sfxButton !== null)
		{
			this.sfxButton.removeEventListener('click', onSFXToggle.bind(this));
		}

		if (this.voButton !== null)
		{
			this.voButton.removeEventListener('click', onVOToggle.bind(this));
		}

		delete this.voButton;
		delete this.sfxButton;
		delete this.musicButton;
		delete this.soundButton;
		delete this._checkSoundMute;
	};
})();
/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var SavedDataHandler = include('springroll.SavedDataHandler');

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(40);

	plugin.setup = function()
	{
		/**
		 * The external handler class, must include `remove`, `write`, `read` methods
		 * make it possible to use something else to handle the external, default
		 * is to use cookies/localStorage. See {{#crossLink "springroll.SavedDataHandler"}}{{/crossLink}}
		 * as an example.
		 * @property {Object} userDataHandler
		 * @default springroll.SavedDataHandler
		 */
		this.userDataHandler = new SavedDataHandler();
	};

	plugin.open = function()
	{
		this.client.on('userDataRemove', onUserDataRemove.bind(this));
		this.client.on('userDataRead', onUserDataRead.bind(this));
		this.client.on('userDataWrite', onUserDataWrite.bind(this));
	};

	/**
	 * Handler for the userDataRemove event
	 * @method onUserDataRemove
	 * @private
	 */
	var onUserDataRemove = function(event)
	{
		var client = this.client;
		this.userDataHandler.remove(event.data, function()
		{
			client.send(event.type);
		});
	};

	/**
	 * Handler for the userDataRead event
	 * @method onUserDataRead
	 * @private
	 */
	var onUserDataRead = function(event)
	{
		var client = this.client;
		this.userDataHandler.read(event.data, function(value)
		{
			client.send(event.type, value);
		});
	};

	/**
	 * Handler for the userDataWrite event
	 * @method onUserDataWrite
	 * @private
	 */
	var onUserDataWrite = function(event)
	{
		var data = event.data;
		var client = this.client;
		this.userDataHandler.write(data.name, data.value, function()
		{
			client.send(event.type);
		});
	};

	plugin.teardown = function()
	{
		this.userDataHandler = null;
	};

}());