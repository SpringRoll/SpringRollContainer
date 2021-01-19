(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.springroll = global.springroll || {}));
}(this, function (exports) { 'use strict';

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    }(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj);
  }

  if (support.arrayBuffer) {
    var viewClasses = ['[object Int8Array]', '[object Uint8Array]', '[object Uint8ClampedArray]', '[object Int16Array]', '[object Uint16Array]', '[object Int32Array]', '[object Uint32Array]', '[object Float32Array]', '[object Float64Array]'];

    var isArrayBufferView = ArrayBuffer.isView || function (obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
    };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }

    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name');
    }

    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }

    return value;
  } // Build a destructive iterator for the value list


  function iteratorFor(items) {
    var iterator = {
      next: function () {
        var value = items.shift();
        return {
          done: value === undefined,
          value: value
        };
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function () {
        return iterator;
      };
    }

    return iterator;
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function (value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function (header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function (name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function (name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function (name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function (name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null;
  };

  Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function (callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push(name);
    });
    return iteratorFor(items);
  };

  Headers.prototype.values = function () {
    var items = [];
    this.forEach(function (value) {
      items.push(value);
    });
    return iteratorFor(items);
  };

  Headers.prototype.entries = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items);
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }

    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result);
      };

      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise;
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise;
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }

    return chars.join('');
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0);
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer;
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function (body) {
      this._bodyInit = body;

      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer); // IE 10-11 can't handle a DataView body.

        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function () {
        var rejected = consumed(this);

        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob);
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob');
        } else {
          return Promise.resolve(new Blob([this._bodyText]));
        }
      };

      this.arrayBuffer = function () {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer);
        } else {
          return this.blob().then(readBlobAsArrayBuffer);
        }
      };
    }

    this.text = function () {
      var rejected = consumed(this);

      if (rejected) {
        return rejected;
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob);
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text');
      } else {
        return Promise.resolve(this._bodyText);
      }
    };

    if (support.formData) {
      this.formData = function () {
        return this.text().then(decode);
      };
    }

    this.json = function () {
      return this.text().then(JSON.parse);
    };

    return this;
  } // HTTP methods whose capitalization should be normalized


  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
      }

      this.url = input.url;
      this.credentials = input.credentials;

      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }

      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;

      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';

    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }

    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }

    this._initBody(body);
  }

  Request.prototype.clone = function () {
    return new Request(this, {
      body: this._bodyInit
    });
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers(); // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2

    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
      var parts = line.split(':');
      var key = parts.shift().trim();

      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers;
  }

  Body.call(Request.prototype);
  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';

    this._initBody(bodyInit);
  }
  Body.call(Response.prototype);

  Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  Response.error = function () {
    var response = new Response(null, {
      status: 0,
      statusText: ''
    });
    response.type = 'error';
    return response;
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function (url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code');
    }

    return new Response(null, {
      status: status,
      headers: {
        location: url
      }
    });
  };

  var DOMException = self.DOMException;

  try {
    new DOMException();
  } catch (err) {
    DOMException = function (message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };

    DOMException.prototype = Object.create(Error.prototype);
    DOMException.prototype.constructor = DOMException;
  }

  function fetch$1(input, init) {
    return new Promise(function (resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new DOMException('Aborted', 'AbortError'));
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function () {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function () {
        reject(new DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function () {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
  }
  fetch$1.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch$1;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var check = function (it) {
    return it && it.Math == Math && it;
  }; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


  var global_1 = // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
  Function('return this')();

  // iterable DOM collections
  // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
  var domIterables = {
    CSSRuleList: 0,
    CSSStyleDeclaration: 0,
    CSSValueList: 0,
    ClientRectList: 0,
    DOMRectList: 0,
    DOMStringList: 0,
    DOMTokenList: 1,
    DataTransferItemList: 0,
    FileList: 0,
    HTMLAllCollection: 0,
    HTMLCollection: 0,
    HTMLFormElement: 0,
    HTMLSelectElement: 0,
    MediaList: 0,
    MimeTypeArray: 0,
    NamedNodeMap: 0,
    NodeList: 1,
    PaintRequestList: 0,
    Plugin: 0,
    PluginArray: 0,
    SVGLengthList: 0,
    SVGNumberList: 0,
    SVGPathSegList: 0,
    SVGPointList: 0,
    SVGStringList: 0,
    SVGTransformList: 0,
    SourceBufferList: 0,
    StyleSheetList: 0,
    TextTrackCueList: 0,
    TextTrackList: 0,
    TouchList: 0
  };

  var aFunction = function (it) {
    if (typeof it != 'function') {
      throw TypeError(String(it) + ' is not a function');
    }

    return it;
  };

  var functionBindContext = function (fn, that, length) {
    aFunction(fn);
    if (that === undefined) return fn;

    switch (length) {
      case 0:
        return function () {
          return fn.call(that);
        };

      case 1:
        return function (a) {
          return fn.call(that, a);
        };

      case 2:
        return function (a, b) {
          return fn.call(that, a, b);
        };

      case 3:
        return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
    }

    return function ()
    /* ...args */
    {
      return fn.apply(that, arguments);
    };
  };

  var fails = function (exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  var toString = {}.toString;

  var classofRaw = function (it) {
    return toString.call(it).slice(8, -1);
  };

  var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

  var indexedObject = fails(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
  } : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function (it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  // https://tc39.github.io/ecma262/#sec-toobject

  var toObject = function (argument) {
    return Object(requireObjectCoercible(argument));
  };

  var ceil = Math.ceil;
  var floor = Math.floor; // `ToInteger` abstract operation
  // https://tc39.github.io/ecma262/#sec-tointeger

  var toInteger = function (argument) {
    return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
  };

  var min = Math.min; // `ToLength` abstract operation
  // https://tc39.github.io/ecma262/#sec-tolength

  var toLength = function (argument) {
    return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  // https://tc39.github.io/ecma262/#sec-isarray

  var isArray = Array.isArray || function isArray(arg) {
    return classofRaw(arg) == 'Array';
  };

  var descriptors = !fails(function () {
    return Object.defineProperty({}, 1, {
      get: function () {
        return 7;
      }
    })[1] != 7;
  });

  var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

  var EXISTS = isObject(document$1) && isObject(document$1.createElement);

  var documentCreateElement = function (it) {
    return EXISTS ? document$1.createElement(it) : {};
  };

  var ie8DomDefine = !descriptors && !fails(function () {
    return Object.defineProperty(documentCreateElement('div'), 'a', {
      get: function () {
        return 7;
      }
    }).a != 7;
  });

  var anObject = function (it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + ' is not an object');
    }

    return it;
  };

  // https://tc39.github.io/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string

  var toPrimitive = function (input, PREFERRED_STRING) {
    if (!isObject(input)) return input;
    var fn, val;
    if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
    if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty

  var f = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (ie8DomDefine) try {
      return nativeDefineProperty(O, P, Attributes);
    } catch (error) {
      /* empty */
    }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };
  var objectDefineProperty = {
    f: f
  };

  var createPropertyDescriptor = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var createNonEnumerableProperty = descriptors ? function (object, key, value) {
    return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var setGlobal = function (key, value) {
    try {
      createNonEnumerableProperty(global_1, key, value);
    } catch (error) {
      global_1[key] = value;
    }

    return value;
  };

  var SHARED = '__core-js_shared__';
  var store = global_1[SHARED] || setGlobal(SHARED, {});
  var sharedStore = store;

  var shared = createCommonjsModule(function (module) {
    (module.exports = function (key, value) {
      return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: '3.6.5',
      mode: 'global',
      copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
    });
  });

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var id = 0;
  var postfix = Math.random();

  var uid = function (key) {
    return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
  };

  var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
    // Chrome 38 Symbol has incorrect toString conversion
    // eslint-disable-next-line no-undef
    return !String(Symbol());
  });

  var useSymbolAsUid = nativeSymbol // eslint-disable-next-line no-undef
  && !Symbol.sham // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';

  var WellKnownSymbolsStore = shared('wks');
  var Symbol$1 = global_1.Symbol;
  var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

  var wellKnownSymbol = function (name) {
    if (!has(WellKnownSymbolsStore, name)) {
      if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
    }

    return WellKnownSymbolsStore[name];
  };

  var SPECIES = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
  // https://tc39.github.io/ecma262/#sec-arrayspeciescreate

  var arraySpeciesCreate = function (originalArray, length) {
    var C;

    if (isArray(originalArray)) {
      C = originalArray.constructor; // cross-realm fallback

      if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
        C = C[SPECIES];
        if (C === null) C = undefined;
      }
    }

    return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
  };

  var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation

  var createMethod = function (TYPE) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    return function ($this, callbackfn, that, specificCreate) {
      var O = toObject($this);
      var self = indexedObject(O);
      var boundFunction = functionBindContext(callbackfn, that, 3);
      var length = toLength(self.length);
      var index = 0;
      var create = specificCreate || arraySpeciesCreate;
      var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
      var value, result;

      for (; length > index; index++) if (NO_HOLES || index in self) {
        value = self[index];
        result = boundFunction(value, index, O);

        if (TYPE) {
          if (IS_MAP) target[index] = result; // map
          else if (result) switch (TYPE) {
              case 3:
                return true;
              // some

              case 5:
                return value;
              // find

              case 6:
                return index;
              // findIndex

              case 2:
                push.call(target, value);
              // filter
            } else if (IS_EVERY) return false; // every
        }
      }

      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
    };
  };

  var arrayIteration = {
    // `Array.prototype.forEach` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
    forEach: createMethod(0),
    // `Array.prototype.map` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.map
    map: createMethod(1),
    // `Array.prototype.filter` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.filter
    filter: createMethod(2),
    // `Array.prototype.some` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.some
    some: createMethod(3),
    // `Array.prototype.every` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.every
    every: createMethod(4),
    // `Array.prototype.find` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.find
    find: createMethod(5),
    // `Array.prototype.findIndex` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
    findIndex: createMethod(6)
  };

  var arrayMethodIsStrict = function (METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return !!method && fails(function () {
      // eslint-disable-next-line no-useless-call,no-throw-literal
      method.call(null, argument || function () {
        throw 1;
      }, 1);
    });
  };

  var defineProperty = Object.defineProperty;
  var cache = {};

  var thrower = function (it) {
    throw it;
  };

  var arrayMethodUsesToLength = function (METHOD_NAME, options) {
    if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
    if (!options) options = {};
    var method = [][METHOD_NAME];
    var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
    var argument0 = has(options, 0) ? options[0] : thrower;
    var argument1 = has(options, 1) ? options[1] : undefined;
    return cache[METHOD_NAME] = !!method && !fails(function () {
      if (ACCESSORS && !descriptors) return true;
      var O = {
        length: -1
      };
      if (ACCESSORS) defineProperty(O, 1, {
        enumerable: true,
        get: thrower
      });else O[1] = 1;
      method.call(O, argument0, argument1);
    });
  };

  var $forEach = arrayIteration.forEach;
  var STRICT_METHOD = arrayMethodIsStrict('forEach');
  var USES_TO_LENGTH = arrayMethodUsesToLength('forEach'); // `Array.prototype.forEach` method implementation
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach

  var arrayForEach = !STRICT_METHOD || !USES_TO_LENGTH ? function forEach(callbackfn
  /* , thisArg */
  ) {
    return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  } : [].forEach;

  for (var COLLECTION_NAME in domIterables) {
    var Collection = global_1[COLLECTION_NAME];
    var CollectionPrototype = Collection && Collection.prototype; // some Chrome versions have non-configurable methods on DOMTokenList

    if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
      createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
    } catch (error) {
      CollectionPrototype.forEach = arrayForEach;
    }
  }

  var toIndexedObject = function (it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var max = Math.max;
  var min$1 = Math.min; // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

  var toAbsoluteIndex = function (index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
  };

  var createMethod$1 = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++]; // eslint-disable-next-line no-self-compare

        if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
      } else for (; length > index; index++) {
        if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
      }
      return !IS_INCLUDES && -1;
    };
  };

  var arrayIncludes = {
    // `Array.prototype.includes` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    includes: createMethod$1(true),
    // `Array.prototype.indexOf` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod$1(false)
  };

  var hiddenKeys = {};

  var indexOf = arrayIncludes.indexOf;

  var objectKeysInternal = function (object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;

    for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


    while (names.length > i) if (has(O, key = names[i++])) {
      ~indexOf(result, key) || result.push(key);
    }

    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

  // https://tc39.github.io/ecma262/#sec-object.keys

  var objectKeys = Object.keys || function keys(O) {
    return objectKeysInternal(O, enumBugKeys);
  };

  // https://tc39.github.io/ecma262/#sec-object.defineproperties

  var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = objectKeys(Properties);
    var length = keys.length;
    var index = 0;
    var key;

    while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);

    return O;
  };

  var path = global_1;

  var aFunction$1 = function (variable) {
    return typeof variable == 'function' ? variable : undefined;
  };

  var getBuiltIn = function (namespace, method) {
    return arguments.length < 2 ? aFunction$1(path[namespace]) || aFunction$1(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
  };

  var html = getBuiltIn('document', 'documentElement');

  var keys = shared('keys');

  var sharedKey = function (key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var GT = '>';
  var LT = '<';
  var PROTOTYPE = 'prototype';
  var SCRIPT = 'script';
  var IE_PROTO = sharedKey('IE_PROTO');

  var EmptyConstructor = function () {
    /* empty */
  };

  var scriptTag = function (content) {
    return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
  }; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype


  var NullProtoObjectViaActiveX = function (activeXDocument) {
    activeXDocument.write(scriptTag(''));
    activeXDocument.close();
    var temp = activeXDocument.parentWindow.Object;
    activeXDocument = null; // avoid memory leak

    return temp;
  }; // Create object with fake `null` prototype: use iframe Object with cleared prototype


  var NullProtoObjectViaIFrame = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = documentCreateElement('iframe');
    var JS = 'java' + SCRIPT + ':';
    var iframeDocument;
    iframe.style.display = 'none';
    html.appendChild(iframe); // https://github.com/zloirock/core-js/issues/475

    iframe.src = String(JS);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(scriptTag('document.F=Object'));
    iframeDocument.close();
    return iframeDocument.F;
  }; // Check for document.domain and active x support
  // No need to use active x approach when document.domain is not set
  // see https://github.com/es-shims/es5-shim/issues/150
  // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
  // avoid IE GC bug


  var activeXDocument;

  var NullProtoObject = function () {
    try {
      /* global ActiveXObject */
      activeXDocument = document.domain && new ActiveXObject('htmlfile');
    } catch (error) {
      /* ignore */
    }

    NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
    var length = enumBugKeys.length;

    while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];

    return NullProtoObject();
  };

  hiddenKeys[IE_PROTO] = true; // `Object.create` method
  // https://tc39.github.io/ecma262/#sec-object.create

  var objectCreate = Object.create || function create(O, Properties) {
    var result;

    if (O !== null) {
      EmptyConstructor[PROTOTYPE] = anObject(O);
      result = new EmptyConstructor();
      EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

      result[IE_PROTO] = O;
    } else result = NullProtoObject();

    return Properties === undefined ? result : objectDefineProperties(result, Properties);
  };

  var UNSCOPABLES = wellKnownSymbol('unscopables');
  var ArrayPrototype = Array.prototype; // Array.prototype[@@unscopables]
  // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

  if (ArrayPrototype[UNSCOPABLES] == undefined) {
    objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
      configurable: true,
      value: objectCreate(null)
    });
  } // add a key to Array.prototype[@@unscopables]


  var addToUnscopables = function (key) {
    ArrayPrototype[UNSCOPABLES][key] = true;
  };

  var iterators = {};

  var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

  if (typeof sharedStore.inspectSource != 'function') {
    sharedStore.inspectSource = function (it) {
      return functionToString.call(it);
    };
  }

  var inspectSource = sharedStore.inspectSource;

  var WeakMap = global_1.WeakMap;
  var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

  var WeakMap$1 = global_1.WeakMap;
  var set, get, has$1;

  var enforce = function (it) {
    return has$1(it) ? get(it) : set(it, {});
  };

  var getterFor = function (TYPE) {
    return function (it) {
      var state;

      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError('Incompatible receiver, ' + TYPE + ' required');
      }

      return state;
    };
  };

  if (nativeWeakMap) {
    var store$1 = new WeakMap$1();
    var wmget = store$1.get;
    var wmhas = store$1.has;
    var wmset = store$1.set;

    set = function (it, metadata) {
      wmset.call(store$1, it, metadata);
      return metadata;
    };

    get = function (it) {
      return wmget.call(store$1, it) || {};
    };

    has$1 = function (it) {
      return wmhas.call(store$1, it);
    };
  } else {
    var STATE = sharedKey('state');
    hiddenKeys[STATE] = true;

    set = function (it, metadata) {
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };

    get = function (it) {
      return has(it, STATE) ? it[STATE] : {};
    };

    has$1 = function (it) {
      return has(it, STATE);
    };
  }

  var internalState = {
    set: set,
    get: get,
    has: has$1,
    enforce: enforce,
    getterFor: getterFor
  };

  var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

  var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
    1: 2
  }, 1); // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

  var f$1 = NASHORN_BUG ? function propertyIsEnumerable(V) {
    var descriptor = getOwnPropertyDescriptor(this, V);
    return !!descriptor && descriptor.enumerable;
  } : nativePropertyIsEnumerable;
  var objectPropertyIsEnumerable = {
    f: f$1
  };

  var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

  var f$2 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject(O);
    P = toPrimitive(P, true);
    if (ie8DomDefine) try {
      return nativeGetOwnPropertyDescriptor(O, P);
    } catch (error) {
      /* empty */
    }
    if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
  };
  var objectGetOwnPropertyDescriptor = {
    f: f$2
  };

  var redefine = createCommonjsModule(function (module) {
    var getInternalState = internalState.get;
    var enforceInternalState = internalState.enforce;
    var TEMPLATE = String(String).split('String');
    (module.exports = function (O, key, value, options) {
      var unsafe = options ? !!options.unsafe : false;
      var simple = options ? !!options.enumerable : false;
      var noTargetGet = options ? !!options.noTargetGet : false;

      if (typeof value == 'function') {
        if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
        enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
      }

      if (O === global_1) {
        if (simple) O[key] = value;else setGlobal(key, value);
        return;
      } else if (!unsafe) {
        delete O[key];
      } else if (!noTargetGet && O[key]) {
        simple = true;
      }

      if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, 'toString', function toString() {
      return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
    });
  });

  var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames

  var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return objectKeysInternal(O, hiddenKeys$1);
  };

  var objectGetOwnPropertyNames = {
    f: f$3
  };

  var f$4 = Object.getOwnPropertySymbols;
  var objectGetOwnPropertySymbols = {
    f: f$4
  };

  var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
    var keys = objectGetOwnPropertyNames.f(anObject(it));
    var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
  };

  var copyConstructorProperties = function (target, source) {
    var keys = ownKeys(source);
    var defineProperty = objectDefineProperty.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };

  var replacement = /#|\.prototype\./;

  var isForced = function (feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
  };

  var normalize = isForced.normalize = function (string) {
    return String(string).replace(replacement, '.').toLowerCase();
  };

  var data = isForced.data = {};
  var NATIVE = isForced.NATIVE = 'N';
  var POLYFILL = isForced.POLYFILL = 'P';
  var isForced_1 = isForced;

  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
  /*
    options.target      - name of the target object
    options.global      - target is the global object
    options.stat        - export as static methods of target
    options.proto       - export as prototype methods of target
    options.real        - real prototype method for the `pure` version
    options.forced      - export even if the native feature is available
    options.bind        - bind methods to the target, required for the `pure` version
    options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
    options.unsafe      - use the simple assignment of property instead of delete + defineProperty
    options.sham        - add a flag to not completely full polyfills
    options.enumerable  - export as enumerable property
    options.noTargetGet - prevent calling a getter on target
  */

  var _export = function (options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;

    if (GLOBAL) {
      target = global_1;
    } else if (STATIC) {
      target = global_1[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global_1[TARGET] || {}).prototype;
    }

    if (target) for (key in source) {
      sourceProperty = source[key];

      if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor$1(target, key);
        targetProperty = descriptor && descriptor.value;
      } else targetProperty = target[key];

      FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

      if (!FORCED && targetProperty !== undefined) {
        if (typeof sourceProperty === typeof targetProperty) continue;
        copyConstructorProperties(sourceProperty, targetProperty);
      } // add a flag to not completely full polyfills


      if (options.sham || targetProperty && targetProperty.sham) {
        createNonEnumerableProperty(sourceProperty, 'sham', true);
      } // extend global


      redefine(target, key, sourceProperty, options);
    }
  };

  var correctPrototypeGetter = !fails(function () {
    function F() {
      /* empty */
    }

    F.prototype.constructor = null;
    return Object.getPrototypeOf(new F()) !== F.prototype;
  });

  var IE_PROTO$1 = sharedKey('IE_PROTO');
  var ObjectPrototype = Object.prototype; // `Object.getPrototypeOf` method
  // https://tc39.github.io/ecma262/#sec-object.getprototypeof

  var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
    O = toObject(O);
    if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];

    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    }

    return O instanceof Object ? ObjectPrototype : null;
  };

  var ITERATOR = wellKnownSymbol('iterator');
  var BUGGY_SAFARI_ITERATORS = false;

  var returnThis = function () {
    return this;
  }; // `%IteratorPrototype%` object
  // https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object


  var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

  if ([].keys) {
    arrayIterator = [].keys(); // Safari 8 has buggy iterators w/o `next`

    if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;else {
      PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
      if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
    }
  }

  if (IteratorPrototype == undefined) IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

  if (!has(IteratorPrototype, ITERATOR)) {
    createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
  }

  var iteratorsCore = {
    IteratorPrototype: IteratorPrototype,
    BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
  };

  var defineProperty$1 = objectDefineProperty.f;
  var TO_STRING_TAG = wellKnownSymbol('toStringTag');

  var setToStringTag = function (it, TAG, STATIC) {
    if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
      defineProperty$1(it, TO_STRING_TAG, {
        configurable: true,
        value: TAG
      });
    }
  };

  var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

  var returnThis$1 = function () {
    return this;
  };

  var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
    var TO_STRING_TAG = NAME + ' Iterator';
    IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, {
      next: createPropertyDescriptor(1, next)
    });
    setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
    iterators[TO_STRING_TAG] = returnThis$1;
    return IteratorConstructor;
  };

  var aPossiblePrototype = function (it) {
    if (!isObject(it) && it !== null) {
      throw TypeError("Can't set " + String(it) + ' as a prototype');
    }

    return it;
  };

  // https://tc39.github.io/ecma262/#sec-object.setprototypeof
  // Works with __proto__ only. Old v8 can't work with null proto objects.

  /* eslint-disable no-proto */

  var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
    var CORRECT_SETTER = false;
    var test = {};
    var setter;

    try {
      setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
      setter.call(test, []);
      CORRECT_SETTER = test instanceof Array;
    } catch (error) {
      /* empty */
    }

    return function setPrototypeOf(O, proto) {
      anObject(O);
      aPossiblePrototype(proto);
      if (CORRECT_SETTER) setter.call(O, proto);else O.__proto__ = proto;
      return O;
    };
  }() : undefined);

  var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
  var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
  var ITERATOR$1 = wellKnownSymbol('iterator');
  var KEYS = 'keys';
  var VALUES = 'values';
  var ENTRIES = 'entries';

  var returnThis$2 = function () {
    return this;
  };

  var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
    createIteratorConstructor(IteratorConstructor, NAME, next);

    var getIterationMethod = function (KIND) {
      if (KIND === DEFAULT && defaultIterator) return defaultIterator;
      if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];

      switch (KIND) {
        case KEYS:
          return function keys() {
            return new IteratorConstructor(this, KIND);
          };

        case VALUES:
          return function values() {
            return new IteratorConstructor(this, KIND);
          };

        case ENTRIES:
          return function entries() {
            return new IteratorConstructor(this, KIND);
          };
      }

      return function () {
        return new IteratorConstructor(this);
      };
    };

    var TO_STRING_TAG = NAME + ' Iterator';
    var INCORRECT_VALUES_NAME = false;
    var IterablePrototype = Iterable.prototype;
    var nativeIterator = IterablePrototype[ITERATOR$1] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
    var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
    var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
    var CurrentIteratorPrototype, methods, KEY; // fix native

    if (anyNativeIterator) {
      CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));

      if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
        if (objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
          if (objectSetPrototypeOf) {
            objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
          } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
            createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
          }
        } // Set @@toStringTag to native iterators


        setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      }
    } // fix Array#{values, @@iterator}.name in V8 / FF


    if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
      INCORRECT_VALUES_NAME = true;

      defaultIterator = function values() {
        return nativeIterator.call(this);
      };
    } // define iterator


    if (IterablePrototype[ITERATOR$1] !== defaultIterator) {
      createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
    }

    iterators[NAME] = defaultIterator; // export additional methods

    if (DEFAULT) {
      methods = {
        values: getIterationMethod(VALUES),
        keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
        entries: getIterationMethod(ENTRIES)
      };
      if (FORCED) for (KEY in methods) {
        if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
          redefine(IterablePrototype, KEY, methods[KEY]);
        }
      } else _export({
        target: NAME,
        proto: true,
        forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME
      }, methods);
    }

    return methods;
  };

  var ARRAY_ITERATOR = 'Array Iterator';
  var setInternalState = internalState.set;
  var getInternalState = internalState.getterFor(ARRAY_ITERATOR); // `Array.prototype.entries` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.entries
  // `Array.prototype.keys` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.keys
  // `Array.prototype.values` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.values
  // `Array.prototype[@@iterator]` method
  // https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
  // `CreateArrayIterator` internal method
  // https://tc39.github.io/ecma262/#sec-createarrayiterator

  var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
    setInternalState(this, {
      type: ARRAY_ITERATOR,
      target: toIndexedObject(iterated),
      // target
      index: 0,
      // next index
      kind: kind // kind

    }); // `%ArrayIteratorPrototype%.next` method
    // https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
  }, function () {
    var state = getInternalState(this);
    var target = state.target;
    var kind = state.kind;
    var index = state.index++;

    if (!target || index >= target.length) {
      state.target = undefined;
      return {
        value: undefined,
        done: true
      };
    }

    if (kind == 'keys') return {
      value: index,
      done: false
    };
    if (kind == 'values') return {
      value: target[index],
      done: false
    };
    return {
      value: [index, target[index]],
      done: false
    };
  }, 'values'); // argumentsList[@@iterator] is %ArrayProto_values%
  // https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
  // https://tc39.github.io/ecma262/#sec-createmappedargumentsobject

  iterators.Arguments = iterators.Array; // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

  addToUnscopables('keys');
  addToUnscopables('values');
  addToUnscopables('entries');

  var ITERATOR$2 = wellKnownSymbol('iterator');
  var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
  var ArrayValues = es_array_iterator.values;

  for (var COLLECTION_NAME$1 in domIterables) {
    var Collection$1 = global_1[COLLECTION_NAME$1];
    var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;

    if (CollectionPrototype$1) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype$1[ITERATOR$2] !== ArrayValues) try {
        createNonEnumerableProperty(CollectionPrototype$1, ITERATOR$2, ArrayValues);
      } catch (error) {
        CollectionPrototype$1[ITERATOR$2] = ArrayValues;
      }

      if (!CollectionPrototype$1[TO_STRING_TAG$1]) {
        createNonEnumerableProperty(CollectionPrototype$1, TO_STRING_TAG$1, COLLECTION_NAME$1);
      }

      if (domIterables[COLLECTION_NAME$1]) for (var METHOD_NAME in es_array_iterator) {
        // some Chrome versions have non-configurable methods on DOMTokenList
        if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
          createNonEnumerableProperty(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
        } catch (error) {
          CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
        }
      }
    }
  }

  var createProperty = function (object, key, value) {
    var propertyKey = toPrimitive(key);
    if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
  };

  var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

  var process = global_1.process;
  var versions = process && process.versions;
  var v8 = versions && versions.v8;
  var match, version;

  if (v8) {
    match = v8.split('.');
    version = match[0] + match[1];
  } else if (engineUserAgent) {
    match = engineUserAgent.match(/Edge\/(\d+)/);

    if (!match || match[1] >= 74) {
      match = engineUserAgent.match(/Chrome\/(\d+)/);
      if (match) version = match[1];
    }
  }

  var engineV8Version = version && +version;

  var SPECIES$1 = wellKnownSymbol('species');

  var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
    // We can't use this feature detection in V8 since it causes
    // deoptimization and serious performance degradation
    // https://github.com/zloirock/core-js/issues/677
    return engineV8Version >= 51 || !fails(function () {
      var array = [];
      var constructor = array.constructor = {};

      constructor[SPECIES$1] = function () {
        return {
          foo: 1
        };
      };

      return array[METHOD_NAME](Boolean).foo !== 1;
    });
  };

  var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
  var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
  var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded'; // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/679

  var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
    var array = [];
    array[IS_CONCAT_SPREADABLE] = false;
    return array.concat()[0] !== array;
  });
  var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

  var isConcatSpreadable = function (O) {
    if (!isObject(O)) return false;
    var spreadable = O[IS_CONCAT_SPREADABLE];
    return spreadable !== undefined ? !!spreadable : isArray(O);
  };

  var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT; // `Array.prototype.concat` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.concat
  // with adding support of @@isConcatSpreadable and @@species

  _export({
    target: 'Array',
    proto: true,
    forced: FORCED
  }, {
    concat: function concat(arg) {
      // eslint-disable-line no-unused-vars
      var O = toObject(this);
      var A = arraySpeciesCreate(O, 0);
      var n = 0;
      var i, k, length, len, E;

      for (i = -1, length = arguments.length; i < length; i++) {
        E = i === -1 ? O : arguments[i];

        if (isConcatSpreadable(E)) {
          len = toLength(E.length);
          if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);

          for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
        } else {
          if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
          createProperty(A, n++, E);
        }
      }

      A.length = n;
      return A;
    }
  });

  var $indexOf = arrayIncludes.indexOf;
  var nativeIndexOf = [].indexOf;
  var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
  var STRICT_METHOD$1 = arrayMethodIsStrict('indexOf');
  var USES_TO_LENGTH$1 = arrayMethodUsesToLength('indexOf', {
    ACCESSORS: true,
    1: 0
  }); // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof

  _export({
    target: 'Array',
    proto: true,
    forced: NEGATIVE_ZERO || !STRICT_METHOD$1 || !USES_TO_LENGTH$1
  }, {
    indexOf: function indexOf(searchElement
    /* , fromIndex = 0 */
    ) {
      return NEGATIVE_ZERO // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var nativeAssign = Object.assign;
  var defineProperty$2 = Object.defineProperty; // `Object.assign` method
  // https://tc39.github.io/ecma262/#sec-object.assign

  var objectAssign = !nativeAssign || fails(function () {
    // should have correct order of operations (Edge bug)
    if (descriptors && nativeAssign({
      b: 1
    }, nativeAssign(defineProperty$2({}, 'a', {
      enumerable: true,
      get: function () {
        defineProperty$2(this, 'b', {
          value: 3,
          enumerable: false
        });
      }
    }), {
      b: 2
    })).b !== 1) return true; // should work with symbols and should have deterministic property order (V8 bug)

    var A = {};
    var B = {}; // eslint-disable-next-line no-undef

    var symbol = Symbol();
    var alphabet = 'abcdefghijklmnopqrst';
    A[symbol] = 7;
    alphabet.split('').forEach(function (chr) {
      B[chr] = chr;
    });
    return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
  }) ? function assign(target, source) {
    // eslint-disable-line no-unused-vars
    var T = toObject(target);
    var argumentsLength = arguments.length;
    var index = 1;
    var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    var propertyIsEnumerable = objectPropertyIsEnumerable.f;

    while (argumentsLength > index) {
      var S = indexedObject(arguments[index++]);
      var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
      var length = keys.length;
      var j = 0;
      var key;

      while (length > j) {
        key = keys[j++];
        if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
      }
    }

    return T;
  } : nativeAssign;

  // https://tc39.github.io/ecma262/#sec-object.assign

  _export({
    target: 'Object',
    stat: true,
    forced: Object.assign !== objectAssign
  }, {
    assign: objectAssign
  });

  var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
  var test = {};
  test[TO_STRING_TAG$2] = 'z';
  var toStringTagSupport = String(test) === '[object z]';

  var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag'); // ES3 wrong here

  var CORRECT_ARGUMENTS = classofRaw(function () {
    return arguments;
  }()) == 'Arguments'; // fallback for IE11 Script Access Denied error

  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (error) {
      /* empty */
    }
  }; // getting tag from ES6+ `Object.prototype.toString`


  var classof = toStringTagSupport ? classofRaw : function (it) {
    var O, tag, result;
    return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$3)) == 'string' ? tag // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O) // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
  };

  // https://tc39.github.io/ecma262/#sec-object.prototype.tostring


  var objectToString = toStringTagSupport ? {}.toString : function toString() {
    return '[object ' + classof(this) + ']';
  };

  // https://tc39.github.io/ecma262/#sec-object.prototype.tostring

  if (!toStringTagSupport) {
    redefine(Object.prototype, 'toString', objectToString, {
      unsafe: true
    });
  }

  var nativePromiseConstructor = global_1.Promise;

  var redefineAll = function (target, src, options) {
    for (var key in src) redefine(target, key, src[key], options);

    return target;
  };

  var SPECIES$2 = wellKnownSymbol('species');

  var setSpecies = function (CONSTRUCTOR_NAME) {
    var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
    var defineProperty = objectDefineProperty.f;

    if (descriptors && Constructor && !Constructor[SPECIES$2]) {
      defineProperty(Constructor, SPECIES$2, {
        configurable: true,
        get: function () {
          return this;
        }
      });
    }
  };

  var anInstance = function (it, Constructor, name) {
    if (!(it instanceof Constructor)) {
      throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
    }

    return it;
  };

  var ITERATOR$3 = wellKnownSymbol('iterator');
  var ArrayPrototype$1 = Array.prototype; // check on default Array iterator

  var isArrayIteratorMethod = function (it) {
    return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$3] === it);
  };

  var ITERATOR$4 = wellKnownSymbol('iterator');

  var getIteratorMethod = function (it) {
    if (it != undefined) return it[ITERATOR$4] || it['@@iterator'] || iterators[classof(it)];
  };

  var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
    try {
      return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
    } catch (error) {
      var returnMethod = iterator['return'];
      if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
      throw error;
    }
  };

  var iterate_1 = createCommonjsModule(function (module) {
    var Result = function (stopped, result) {
      this.stopped = stopped;
      this.result = result;
    };

    var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
      var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
      var iterator, iterFn, index, length, result, next, step;

      if (IS_ITERATOR) {
        iterator = iterable;
      } else {
        iterFn = getIteratorMethod(iterable);
        if (typeof iterFn != 'function') throw TypeError('Target is not iterable'); // optimisation for array iterators

        if (isArrayIteratorMethod(iterFn)) {
          for (index = 0, length = toLength(iterable.length); length > index; index++) {
            result = AS_ENTRIES ? boundFunction(anObject(step = iterable[index])[0], step[1]) : boundFunction(iterable[index]);
            if (result && result instanceof Result) return result;
          }

          return new Result(false);
        }

        iterator = iterFn.call(iterable);
      }

      next = iterator.next;

      while (!(step = next.call(iterator)).done) {
        result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
        if (typeof result == 'object' && result && result instanceof Result) return result;
      }

      return new Result(false);
    };

    iterate.stop = function (result) {
      return new Result(true, result);
    };
  });

  var ITERATOR$5 = wellKnownSymbol('iterator');
  var SAFE_CLOSING = false;

  try {
    var called = 0;
    var iteratorWithReturn = {
      next: function () {
        return {
          done: !!called++
        };
      },
      'return': function () {
        SAFE_CLOSING = true;
      }
    };

    iteratorWithReturn[ITERATOR$5] = function () {
      return this;
    }; // eslint-disable-next-line no-throw-literal
  } catch (error) {
    /* empty */
  }

  var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
    var ITERATION_SUPPORT = false;

    try {
      var object = {};

      object[ITERATOR$5] = function () {
        return {
          next: function () {
            return {
              done: ITERATION_SUPPORT = true
            };
          }
        };
      };

      exec(object);
    } catch (error) {
      /* empty */
    }

    return ITERATION_SUPPORT;
  };

  var SPECIES$3 = wellKnownSymbol('species'); // `SpeciesConstructor` abstract operation
  // https://tc39.github.io/ecma262/#sec-speciesconstructor

  var speciesConstructor = function (O, defaultConstructor) {
    var C = anObject(O).constructor;
    var S;
    return C === undefined || (S = anObject(C)[SPECIES$3]) == undefined ? defaultConstructor : aFunction(S);
  };

  var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

  var location = global_1.location;
  var set$1 = global_1.setImmediate;
  var clear = global_1.clearImmediate;
  var process$1 = global_1.process;
  var MessageChannel = global_1.MessageChannel;
  var Dispatch = global_1.Dispatch;
  var counter = 0;
  var queue = {};
  var ONREADYSTATECHANGE = 'onreadystatechange';
  var defer, channel, port;

  var run = function (id) {
    // eslint-disable-next-line no-prototype-builtins
    if (queue.hasOwnProperty(id)) {
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  };

  var runner = function (id) {
    return function () {
      run(id);
    };
  };

  var listener = function (event) {
    run(event.data);
  };

  var post = function (id) {
    // old engines have not location.origin
    global_1.postMessage(id + '', location.protocol + '//' + location.host);
  }; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


  if (!set$1 || !clear) {
    set$1 = function setImmediate(fn) {
      var args = [];
      var i = 1;

      while (arguments.length > i) args.push(arguments[i++]);

      queue[++counter] = function () {
        // eslint-disable-next-line no-new-func
        (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
      };

      defer(counter);
      return counter;
    };

    clear = function clearImmediate(id) {
      delete queue[id];
    }; // Node.js 0.8-


    if (classofRaw(process$1) == 'process') {
      defer = function (id) {
        process$1.nextTick(runner(id));
      }; // Sphere (JS game engine) Dispatch API

    } else if (Dispatch && Dispatch.now) {
      defer = function (id) {
        Dispatch.now(runner(id));
      }; // Browsers with MessageChannel, includes WebWorkers
      // except iOS - https://github.com/zloirock/core-js/issues/624

    } else if (MessageChannel && !engineIsIos) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = listener;
      defer = functionBindContext(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
      // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (global_1.addEventListener && typeof postMessage == 'function' && !global_1.importScripts && !fails(post) && location.protocol !== 'file:') {
      defer = post;
      global_1.addEventListener('message', listener, false); // IE8-
    } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
      defer = function (id) {
        html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
          html.removeChild(this);
          run(id);
        };
      }; // Rest old browsers

    } else {
      defer = function (id) {
        setTimeout(runner(id), 0);
      };
    }
  }

  var task = {
    set: set$1,
    clear: clear
  };

  var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
  var macrotask = task.set;
  var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
  var process$2 = global_1.process;
  var Promise$1 = global_1.Promise;
  var IS_NODE = classofRaw(process$2) == 'process'; // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`

  var queueMicrotaskDescriptor = getOwnPropertyDescriptor$2(global_1, 'queueMicrotask');
  var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;
  var flush, head, last, notify, toggle, node, promise, then; // modern engines have queueMicrotask method

  if (!queueMicrotask) {
    flush = function () {
      var parent, fn;
      if (IS_NODE && (parent = process$2.domain)) parent.exit();

      while (head) {
        fn = head.fn;
        head = head.next;

        try {
          fn();
        } catch (error) {
          if (head) notify();else last = undefined;
          throw error;
        }
      }

      last = undefined;
      if (parent) parent.enter();
    }; // Node.js


    if (IS_NODE) {
      notify = function () {
        process$2.nextTick(flush);
      }; // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339

    } else if (MutationObserver && !engineIsIos) {
      toggle = true;
      node = document.createTextNode('');
      new MutationObserver(flush).observe(node, {
        characterData: true
      });

      notify = function () {
        node.data = toggle = !toggle;
      }; // environments with maybe non-completely correct, but existent Promise

    } else if (Promise$1 && Promise$1.resolve) {
      // Promise.resolve without an argument throws an error in LG WebOS 2
      promise = Promise$1.resolve(undefined);
      then = promise.then;

      notify = function () {
        then.call(promise, flush);
      }; // for other environments - macrotask based on:
      // - setImmediate
      // - MessageChannel
      // - window.postMessag
      // - onreadystatechange
      // - setTimeout

    } else {
      notify = function () {
        // strange IE + webpack dev server bug - use .call(global)
        macrotask.call(global_1, flush);
      };
    }
  }

  var microtask = queueMicrotask || function (fn) {
    var task = {
      fn: fn,
      next: undefined
    };
    if (last) last.next = task;

    if (!head) {
      head = task;
      notify();
    }

    last = task;
  };

  var PromiseCapability = function (C) {
    var resolve, reject;
    this.promise = new C(function ($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = aFunction(resolve);
    this.reject = aFunction(reject);
  }; // 25.4.1.5 NewPromiseCapability(C)


  var f$5 = function (C) {
    return new PromiseCapability(C);
  };

  var newPromiseCapability = {
    f: f$5
  };

  var promiseResolve = function (C, x) {
    anObject(C);
    if (isObject(x) && x.constructor === C) return x;
    var promiseCapability = newPromiseCapability.f(C);
    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var hostReportErrors = function (a, b) {
    var console = global_1.console;

    if (console && console.error) {
      arguments.length === 1 ? console.error(a) : console.error(a, b);
    }
  };

  var perform = function (exec) {
    try {
      return {
        error: false,
        value: exec()
      };
    } catch (error) {
      return {
        error: true,
        value: error
      };
    }
  };

  var task$1 = task.set;
  var SPECIES$4 = wellKnownSymbol('species');
  var PROMISE = 'Promise';
  var getInternalState$1 = internalState.get;
  var setInternalState$1 = internalState.set;
  var getInternalPromiseState = internalState.getterFor(PROMISE);
  var PromiseConstructor = nativePromiseConstructor;
  var TypeError$1 = global_1.TypeError;
  var document$2 = global_1.document;
  var process$3 = global_1.process;
  var $fetch = getBuiltIn('fetch');
  var newPromiseCapability$1 = newPromiseCapability.f;
  var newGenericPromiseCapability = newPromiseCapability$1;
  var IS_NODE$1 = classofRaw(process$3) == 'process';
  var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
  var UNHANDLED_REJECTION = 'unhandledrejection';
  var REJECTION_HANDLED = 'rejectionhandled';
  var PENDING = 0;
  var FULFILLED = 1;
  var REJECTED = 2;
  var HANDLED = 1;
  var UNHANDLED = 2;
  var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;
  var FORCED$1 = isForced_1(PROMISE, function () {
    var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);

    if (!GLOBAL_CORE_JS_PROMISE) {
      // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // We can't detect it synchronously, so just check versions
      if (engineV8Version === 66) return true; // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test

      if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
    } // We need Promise#finally in the pure version for preventing prototype pollution
    // deoptimization and performance degradation
    // https://github.com/zloirock/core-js/issues/679

    if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false; // Detect correctness of subclassing with @@species support

    var promise = PromiseConstructor.resolve(1);

    var FakePromise = function (exec) {
      exec(function () {
        /* empty */
      }, function () {
        /* empty */
      });
    };

    var constructor = promise.constructor = {};
    constructor[SPECIES$4] = FakePromise;
    return !(promise.then(function () {
      /* empty */
    }) instanceof FakePromise);
  });
  var INCORRECT_ITERATION = FORCED$1 || !checkCorrectnessOfIteration(function (iterable) {
    PromiseConstructor.all(iterable)['catch'](function () {
      /* empty */
    });
  }); // helpers

  var isThenable = function (it) {
    var then;
    return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
  };

  var notify$1 = function (promise, state, isReject) {
    if (state.notified) return;
    state.notified = true;
    var chain = state.reactions;
    microtask(function () {
      var value = state.value;
      var ok = state.state == FULFILLED;
      var index = 0; // variable length - can't use forEach

      while (chain.length > index) {
        var reaction = chain[index++];
        var handler = ok ? reaction.ok : reaction.fail;
        var resolve = reaction.resolve;
        var reject = reaction.reject;
        var domain = reaction.domain;
        var result, then, exited;

        try {
          if (handler) {
            if (!ok) {
              if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
              state.rejection = HANDLED;
            }

            if (handler === true) result = value;else {
              if (domain) domain.enter();
              result = handler(value); // can throw

              if (domain) {
                domain.exit();
                exited = true;
              }
            }

            if (result === reaction.promise) {
              reject(TypeError$1('Promise-chain cycle'));
            } else if (then = isThenable(result)) {
              then.call(result, resolve, reject);
            } else resolve(result);
          } else reject(value);
        } catch (error) {
          if (domain && !exited) domain.exit();
          reject(error);
        }
      }

      state.reactions = [];
      state.notified = false;
      if (isReject && !state.rejection) onUnhandled(promise, state);
    });
  };

  var dispatchEvent = function (name, promise, reason) {
    var event, handler;

    if (DISPATCH_EVENT) {
      event = document$2.createEvent('Event');
      event.promise = promise;
      event.reason = reason;
      event.initEvent(name, false, true);
      global_1.dispatchEvent(event);
    } else event = {
      promise: promise,
      reason: reason
    };

    if (handler = global_1['on' + name]) handler(event);else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
  };

  var onUnhandled = function (promise, state) {
    task$1.call(global_1, function () {
      var value = state.value;
      var IS_UNHANDLED = isUnhandled(state);
      var result;

      if (IS_UNHANDLED) {
        result = perform(function () {
          if (IS_NODE$1) {
            process$3.emit('unhandledRejection', value, promise);
          } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
        }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

        state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
        if (result.error) throw result.value;
      }
    });
  };

  var isUnhandled = function (state) {
    return state.rejection !== HANDLED && !state.parent;
  };

  var onHandleUnhandled = function (promise, state) {
    task$1.call(global_1, function () {
      if (IS_NODE$1) {
        process$3.emit('rejectionHandled', promise);
      } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
    });
  };

  var bind = function (fn, promise, state, unwrap) {
    return function (value) {
      fn(promise, state, value, unwrap);
    };
  };

  var internalReject = function (promise, state, value, unwrap) {
    if (state.done) return;
    state.done = true;
    if (unwrap) state = unwrap;
    state.value = value;
    state.state = REJECTED;
    notify$1(promise, state, true);
  };

  var internalResolve = function (promise, state, value, unwrap) {
    if (state.done) return;
    state.done = true;
    if (unwrap) state = unwrap;

    try {
      if (promise === value) throw TypeError$1("Promise can't be resolved itself");
      var then = isThenable(value);

      if (then) {
        microtask(function () {
          var wrapper = {
            done: false
          };

          try {
            then.call(value, bind(internalResolve, promise, wrapper, state), bind(internalReject, promise, wrapper, state));
          } catch (error) {
            internalReject(promise, wrapper, error, state);
          }
        });
      } else {
        state.value = value;
        state.state = FULFILLED;
        notify$1(promise, state, false);
      }
    } catch (error) {
      internalReject(promise, {
        done: false
      }, error, state);
    }
  }; // constructor polyfill


  if (FORCED$1) {
    // 25.4.3.1 Promise(executor)
    PromiseConstructor = function Promise(executor) {
      anInstance(this, PromiseConstructor, PROMISE);
      aFunction(executor);
      Internal.call(this);
      var state = getInternalState$1(this);

      try {
        executor(bind(internalResolve, this, state), bind(internalReject, this, state));
      } catch (error) {
        internalReject(this, state, error);
      }
    }; // eslint-disable-next-line no-unused-vars


    Internal = function Promise(executor) {
      setInternalState$1(this, {
        type: PROMISE,
        done: false,
        notified: false,
        parent: false,
        reactions: [],
        rejection: false,
        state: PENDING,
        value: undefined
      });
    };

    Internal.prototype = redefineAll(PromiseConstructor.prototype, {
      // `Promise.prototype.then` method
      // https://tc39.github.io/ecma262/#sec-promise.prototype.then
      then: function then(onFulfilled, onRejected) {
        var state = getInternalPromiseState(this);
        var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
        reaction.fail = typeof onRejected == 'function' && onRejected;
        reaction.domain = IS_NODE$1 ? process$3.domain : undefined;
        state.parent = true;
        state.reactions.push(reaction);
        if (state.state != PENDING) notify$1(this, state, false);
        return reaction.promise;
      },
      // `Promise.prototype.catch` method
      // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
      'catch': function (onRejected) {
        return this.then(undefined, onRejected);
      }
    });

    OwnPromiseCapability = function () {
      var promise = new Internal();
      var state = getInternalState$1(promise);
      this.promise = promise;
      this.resolve = bind(internalResolve, promise, state);
      this.reject = bind(internalReject, promise, state);
    };

    newPromiseCapability.f = newPromiseCapability$1 = function (C) {
      return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
    };

    if (typeof nativePromiseConstructor == 'function') {
      nativeThen = nativePromiseConstructor.prototype.then; // wrap native Promise#then for native async functions

      redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          nativeThen.call(that, resolve, reject);
        }).then(onFulfilled, onRejected); // https://github.com/zloirock/core-js/issues/640
      }, {
        unsafe: true
      }); // wrap fetch result

      if (typeof $fetch == 'function') _export({
        global: true,
        enumerable: true,
        forced: true
      }, {
        // eslint-disable-next-line no-unused-vars
        fetch: function fetch(input
        /* , init */
        ) {
          return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
        }
      });
    }
  }

  _export({
    global: true,
    wrap: true,
    forced: FORCED$1
  }, {
    Promise: PromiseConstructor
  });
  setToStringTag(PromiseConstructor, PROMISE, false, true);
  setSpecies(PROMISE);
  PromiseWrapper = getBuiltIn(PROMISE); // statics

  _export({
    target: PROMISE,
    stat: true,
    forced: FORCED$1
  }, {
    // `Promise.reject` method
    // https://tc39.github.io/ecma262/#sec-promise.reject
    reject: function reject(r) {
      var capability = newPromiseCapability$1(this);
      capability.reject.call(undefined, r);
      return capability.promise;
    }
  });
  _export({
    target: PROMISE,
    stat: true,
    forced: FORCED$1
  }, {
    // `Promise.resolve` method
    // https://tc39.github.io/ecma262/#sec-promise.resolve
    resolve: function resolve(x) {
      return promiseResolve(this, x);
    }
  });
  _export({
    target: PROMISE,
    stat: true,
    forced: INCORRECT_ITERATION
  }, {
    // `Promise.all` method
    // https://tc39.github.io/ecma262/#sec-promise.all
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapability$1(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      var result = perform(function () {
        var $promiseResolve = aFunction(C.resolve);
        var values = [];
        var counter = 0;
        var remaining = 1;
        iterate_1(iterable, function (promise) {
          var index = counter++;
          var alreadyCalled = false;
          values.push(undefined);
          remaining++;
          $promiseResolve.call(C, promise).then(function (value) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[index] = value;
            --remaining || resolve(values);
          }, reject);
        });
        --remaining || resolve(values);
      });
      if (result.error) reject(result.value);
      return capability.promise;
    },
    // `Promise.race` method
    // https://tc39.github.io/ecma262/#sec-promise.race
    race: function race(iterable) {
      var C = this;
      var capability = newPromiseCapability$1(C);
      var reject = capability.reject;
      var result = perform(function () {
        var $promiseResolve = aFunction(C.resolve);
        iterate_1(iterable, function (promise) {
          $promiseResolve.call(C, promise).then(capability.resolve, reject);
        });
      });
      if (result.error) reject(result.value);
      return capability.promise;
    }
  });

  var runtime_1 = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    var runtime = function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.

      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.

        generator._invoke = makeInvokeMethod(innerFn, self, context);
        return generator;
      }

      exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.

      function tryCatch(fn, obj, arg) {
        try {
          return {
            type: "normal",
            arg: fn.call(obj, arg)
          };
        } catch (err) {
          return {
            type: "throw",
            arg: err
          };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.

      var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.

      function Generator() {}

      function GeneratorFunction() {}

      function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.


      var IteratorPrototype = {};

      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

      if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.

      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          prototype[method] = function (arg) {
            return this._invoke(method, arg);
          };
        });
      }

      exports.isGeneratorFunction = function (genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
      };

      exports.mark = function (genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;

          if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
          }
        }

        genFun.prototype = Object.create(Gp);
        return genFun;
      }; // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.


      exports.awrap = function (arg) {
        return {
          __await: arg
        };
      };

      function AsyncIterator(generator) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);

          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;

            if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
              return Promise.resolve(value.__await).then(function (value) {
                invoke("next", value, resolve, reject);
              }, function (err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return Promise.resolve(value).then(function (unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function (error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new Promise(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise = // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        } // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).


        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);

      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };

      exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.

      exports.async = function (innerFn, outerFn, self, tryLocsList) {
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
        return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
          return result.done ? result.value : iter.next();
        });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;
        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            } // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;

            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);

              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;
            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);
            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;
            var record = tryCatch(innerFn, self, context);

            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done ? GenStateCompleted : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };
            } else if (record.type === "throw") {
              state = GenStateCompleted; // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.

              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      } // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.


      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];

        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError("The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (!info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

          context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.

          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }
        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        } // The delegate iterator is finished, so forget it and continue with
        // the outer generator.


        context.delegate = null;
        return ContinueSentinel;
      } // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.


      defineIteratorMethods(Gp);
      Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.

      Gp[iteratorSymbol] = function () {
        return this;
      };

      Gp.toString = function () {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = {
          tryLoc: locs[0]
        };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{
          tryLoc: "root"
        }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function (object) {
        var keys = [];

        for (var key in object) {
          keys.push(key);
        }

        keys.reverse(); // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.

        return function next() {
          while (keys.length) {
            var key = keys.pop();

            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          } // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.


          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];

          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1,
                next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;
              return next;
            };

            return next.next = next;
          }
        } // Return an iterator with no values.


        return {
          next: doneResult
        };
      }

      exports.values = values;

      function doneResult() {
        return {
          value: undefined$1,
          done: true
        };
      }

      Context.prototype = {
        constructor: Context,
        reset: function (skipTempReset) {
          this.prev = 0;
          this.next = 0; // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.

          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;
          this.method = "next";
          this.arg = undefined$1;
          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },
        stop: function () {
          this.done = true;
          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;

          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },
        dispatchException: function (exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;

          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !!caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }
              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },
        abrupt: function (type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },
        complete: function (record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" || record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },
        finish: function (finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },
        "catch": function (tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;

              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }

              return thrown;
            }
          } // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.


          throw new Error("illegal catch attempt");
        },
        delegateYield: function (iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      }; // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.

      return exports;
    }( // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports);

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  });

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  /**
   * Provide feature detection
   * @class Features
   */
  var Features =
  /*#__PURE__*/
  function () {
    function Features() {
      _classCallCheck(this, Features);
    }

    _createClass(Features, null, [{
      key: "basic",

      /**
       * Test for basic browser compatiliblity
       * @method basic
       * @static
       * @return {String} The error message, if fails
       */
      value: function basic() {
        if (!Features.canvas) {
          return 'Browser does not support canvas';
        } else if (!Features.webaudio && !Features.htmlAudio) {
          return 'Browser does not support WebAudio or HTMLAudio';
        }

        return null;
      }
      /**
       * See if the current bowser has the correct features
       * @method test
       * @static
       * @param {object} capabilities The capabilities
       * @param {object} [capabilities.features] The features
       * @param {object} [capabilities.features.webgl] WebGL required
       * @param {object} [capabilities.features.geolocation] Geolocation required
       * @param {object} [capabilities.features.webworkers] Web Workers API required
       * @param {object} [capabilities.features.webaudio] WebAudio API required
       * @param {object} [capabilities.features.websockets] WebSockets required
       * @param {object} [capabilities.sizes] The sizes
       * @param {Boolean} [capabilities.sizes.xsmall] Screens < 480
       * @param {Boolean} [capabilities.sizes.small] Screens < 768
       * @param {Boolean} [capabilities.sizes.medium] Screens < 992
       * @param {Boolean} [capabilities.sizes.large] Screens < 1200
       * @param {Boolean} [capabilities.sizes.xlarge] Screens >= 1200
       * @param {object} [capabilities.ui] The ui
       * @param {Boolean} [capabilities.ui.touch] Touch capable
       * @return {String|null} The error, or else returns null
       */

    }, {
      key: "test",
      value: function test(capabilities) {
        // check for basic compatibility
        var err = this.basic();

        if (err) {
          return err;
        }

        var features = capabilities.features;
        var ui = capabilities.ui;
        var sizes = capabilities.sizes;

        for (var name in features) {
          if (features[name] === true && !Features[name]) {
            // Failed built-in feature check
            return 'Browser does not support ' + name;
          }
        } // Failed negative touch requirement


        if (!ui.touch && Features.touch) {
          return 'Game does not support touch input';
        } // Check the sizes


        var size = Math.max(window.screen.width, window.screen.height);

        if (!sizes.xsmall && size < 480) {
          return 'Game doesn\'t support extra small screens';
        }

        if (!sizes.small && size < 768) {
          return 'Game doesn\'t support small screens';
        }

        if (!sizes.medium && size < 992) {
          return 'Game doesn\'t support medium screens';
        }

        if (!sizes.large && size < 1200) {
          return 'Game doesn\'t support large screens';
        }

        if (!sizes.xlarge && size >= 1200) {
          return 'Game doesn\'t support extra large screens';
        }

        return null;
      }
      /**
       * Returns browser feature support info
       * @returns {string}
       */

    }, {
      key: "webgl",

      /**
       * If the browser has WebGL support
       * @property {boolean} webgl
       */
      get: function get() {
        var canvas = document.createElement('canvas');
        return !!(canvas && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      }
      /**
       * If the browser has Canvas support
       * @property {boolean} canvas
       */

    }, {
      key: "canvas",
      get: function get() {
        var canvas = document.createElement('canvas');
        return !!(canvas !== null && canvas.getContext && canvas.getContext('2d'));
      }
      /**
       * If the browser has WebAudio API support
       * @property {boolean} webaudio
       */

    }, {
      key: "webaudio",
      get: function get() {
        return 'webkitAudioContext' in window || 'AudioContext' in window;
      }
      /**
       * If the browser has HTMLAudio support
       * @property {boolean} htmlAudio
       */

    }, {
      key: "htmlAudio",
      get: function get() {
        return 'HTMLAudioElement' in window;
      }
      /**
       * If the browser has Web Sockets API
       * @property {boolean} websockets
       */

    }, {
      key: "websockets",
      get: function get() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
      }
      /**
       * If the browser has Geolocation API
       * @property {boolean} geolocation
       */

    }, {
      key: "geolocation",
      get: function get() {
        return 'geolocation' in navigator;
      }
      /**
       * If the browser has Web Workers API
       * @property {boolean} webworkers
       */

    }, {
      key: "webworkers",
      get: function get() {
        return 'function' === typeof Worker;
      }
      /**
       * If the browser has touch
       * @property {boolean} touch
       */

    }, {
      key: "touch",
      get: function get() {
        return !!('ontouchstart' in window || // iOS & Android
        navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 || // IE10
        navigator.pointerEnabled && navigator.maxTouchPoints > 0); // IE11+
      }
    }, {
      key: "info",
      get: function get() {
        return "Browser Feature Detection\n\t\t\t\tCanvas support ".concat(Features.canvas ? "\u2713" : "\xD7", "\n\t\t\t\tWebGL support ").concat(Features.webgl ? "\u2713" : "\xD7", "\n\t\t\t\tWebAudio support ").concat(Features.webAudio ? "\u2713" : "\xD7");
      }
    }]);

    return Features;
  }();

  var $filter = arrayIteration.filter;
  var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter'); // Edge 14- issue

  var USES_TO_LENGTH$2 = arrayMethodUsesToLength('filter'); // `Array.prototype.filter` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
  // with adding support of @@species

  _export({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$2
  }, {
    filter: function filter(callbackfn
    /* , thisArg */
    ) {
      return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var $find = arrayIteration.find;
  var FIND = 'find';
  var SKIPS_HOLES = true;
  var USES_TO_LENGTH$3 = arrayMethodUsesToLength(FIND); // Shouldn't skip holes

  if (FIND in []) Array(1)[FIND](function () {
    SKIPS_HOLES = false;
  }); // `Array.prototype.find` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.find

  _export({
    target: 'Array',
    proto: true,
    forced: SKIPS_HOLES || !USES_TO_LENGTH$3
  }, {
    find: function find(callbackfn
    /* , that = undefined */
    ) {
      return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  }); // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

  addToUnscopables(FIND);

  var createMethod$2 = function (CONVERT_TO_STRING) {
    return function ($this, pos) {
      var S = String(requireObjectCoercible($this));
      var position = toInteger(pos);
      var size = S.length;
      var first, second;
      if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
      first = S.charCodeAt(position);
      return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
    };
  };

  var stringMultibyte = {
    // `String.prototype.codePointAt` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
    codeAt: createMethod$2(false),
    // `String.prototype.at` method
    // https://github.com/mathiasbynens/String.prototype.at
    charAt: createMethod$2(true)
  };

  var charAt = stringMultibyte.charAt;
  var STRING_ITERATOR = 'String Iterator';
  var setInternalState$2 = internalState.set;
  var getInternalState$2 = internalState.getterFor(STRING_ITERATOR); // `String.prototype[@@iterator]` method
  // https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator

  defineIterator(String, 'String', function (iterated) {
    setInternalState$2(this, {
      type: STRING_ITERATOR,
      string: String(iterated),
      index: 0
    }); // `%StringIteratorPrototype%.next` method
    // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
  }, function next() {
    var state = getInternalState$2(this);
    var string = state.string;
    var index = state.index;
    var point;
    if (index >= string.length) return {
      value: undefined,
      done: true
    };
    point = charAt(string, index);
    state.index += point.length;
    return {
      value: point,
      done: false
    };
  });

  function t(t, e) {
    return t(e = {
      exports: {}
    }, e.exports), e.exports;
  }

  var e = t(function (t) {
    function e(t) {
      return (e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
        return typeof t;
      } : function (t) {
        return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
      })(t);
    }

    function n(r) {
      return "function" == typeof Symbol && "symbol" === e(Symbol.iterator) ? t.exports = n = function (t) {
        return e(t);
      } : t.exports = n = function (t) {
        return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : e(t);
      }, n(r);
    }

    t.exports = n;
  });

  var n = function (t, e) {
    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
  };

  function r(t, e) {
    for (var n = 0; n < e.length; n++) {
      var r = e[n];
      r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, r.key, r);
    }
  }

  var o = function (t, e, n) {
    return e && r(t.prototype, e), n && r(t, n), t;
  },
      i = function () {
    function t() {
      n(this, t), this._listeners = {};
    }

    return o(t, [{
      key: "on",
      value: function (t, e) {
        var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0;
        this._listeners[t] || (this._listeners[t] = []), e._priority = parseInt(n) || 0, -1 === this._listeners[t].indexOf(e) && (this._listeners[t].push(e), this._listeners[t].length > 1 && this._listeners[t].sort(this.listenerSorter));
      }
    }, {
      key: "listenerSorter",
      value: function (t, e) {
        return t._priority - e._priority;
      }
    }, {
      key: "off",
      value: function (t, e) {
        if (void 0 !== this._listeners[t]) if (void 0 !== e) {
          var n = this._listeners[t].indexOf(e);

          -1 < n && this._listeners[t].splice(n, 1);
        } else delete this._listeners[t];
      }
    }, {
      key: "trigger",
      value: function (t) {
        var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        if ("string" == typeof t && (t = {
          type: t,
          data: "object" === e(n) && null !== n ? n : {}
        }), void 0 !== this._listeners[t.type]) for (var r = this._listeners[t.type].length - 1; r >= 0; r--) this._listeners[t.type][r](t);
      }
    }, {
      key: "destroy",
      value: function () {
        this._listeners = {};
      }
    }]), t;
  }(),
      s = t(function (t) {
    var e = function (t) {
      var e,
          n = Object.prototype,
          r = n.hasOwnProperty,
          o = "function" == typeof Symbol ? Symbol : {},
          i = o.iterator || "@@iterator",
          s = o.asyncIterator || "@@asyncIterator",
          a = o.toStringTag || "@@toStringTag";

      function c(t, e, n, r) {
        var o = e && e.prototype instanceof d ? e : d,
            i = Object.create(o.prototype),
            s = new S(r || []);
        return i._invoke = function (t, e, n) {
          var r = h;
          return function (o, i) {
            if (r === f) throw new Error("Generator is already running");

            if (r === p) {
              if ("throw" === o) throw i;
              return P();
            }

            for (n.method = o, n.arg = i;;) {
              var s = n.delegate;

              if (s) {
                var a = O(s, n);

                if (a) {
                  if (a === y) continue;
                  return a;
                }
              }

              if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
                if (r === h) throw r = p, n.arg;
                n.dispatchException(n.arg);
              } else "return" === n.method && n.abrupt("return", n.arg);
              r = f;
              var c = u(t, e, n);

              if ("normal" === c.type) {
                if (r = n.done ? p : l, c.arg === y) continue;
                return {
                  value: c.arg,
                  done: n.done
                };
              }

              "throw" === c.type && (r = p, n.method = "throw", n.arg = c.arg);
            }
          };
        }(t, n, s), i;
      }

      function u(t, e, n) {
        try {
          return {
            type: "normal",
            arg: t.call(e, n)
          };
        } catch (t) {
          return {
            type: "throw",
            arg: t
          };
        }
      }

      t.wrap = c;
      var h = "suspendedStart",
          l = "suspendedYield",
          f = "executing",
          p = "completed",
          y = {};

      function d() {}

      function v() {}

      function g() {}

      var m = {};

      m[i] = function () {
        return this;
      };

      var w = Object.getPrototypeOf,
          b = w && w(w(j([])));
      b && b !== n && r.call(b, i) && (m = b);

      var _ = g.prototype = d.prototype = Object.create(m);

      function x(t) {
        ["next", "throw", "return"].forEach(function (e) {
          t[e] = function (t) {
            return this._invoke(e, t);
          };
        });
      }

      function L(t) {
        var e;

        this._invoke = function (n, o) {
          function i() {
            return new Promise(function (e, i) {
              !function e(n, o, i, s) {
                var a = u(t[n], t, o);

                if ("throw" !== a.type) {
                  var c = a.arg,
                      h = c.value;
                  return h && "object" == typeof h && r.call(h, "__await") ? Promise.resolve(h.__await).then(function (t) {
                    e("next", t, i, s);
                  }, function (t) {
                    e("throw", t, i, s);
                  }) : Promise.resolve(h).then(function (t) {
                    c.value = t, i(c);
                  }, function (t) {
                    return e("throw", t, i, s);
                  });
                }

                s(a.arg);
              }(n, o, e, i);
            });
          }

          return e = e ? e.then(i, i) : i();
        };
      }

      function O(t, n) {
        var r = t.iterator[n.method];

        if (r === e) {
          if (n.delegate = null, "throw" === n.method) {
            if (t.iterator.return && (n.method = "return", n.arg = e, O(t, n), "throw" === n.method)) return y;
            n.method = "throw", n.arg = new TypeError("The iterator does not provide a 'throw' method");
          }

          return y;
        }

        var o = u(r, t.iterator, n.arg);
        if ("throw" === o.type) return n.method = "throw", n.arg = o.arg, n.delegate = null, y;
        var i = o.arg;
        return i ? i.done ? (n[t.resultName] = i.value, n.next = t.nextLoc, "return" !== n.method && (n.method = "next", n.arg = e), n.delegate = null, y) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, y);
      }

      function E(t) {
        var e = {
          tryLoc: t[0]
        };
        1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
      }

      function k(t) {
        var e = t.completion || {};
        e.type = "normal", delete e.arg, t.completion = e;
      }

      function S(t) {
        this.tryEntries = [{
          tryLoc: "root"
        }], t.forEach(E, this), this.reset(!0);
      }

      function j(t) {
        if (t) {
          var n = t[i];
          if (n) return n.call(t);
          if ("function" == typeof t.next) return t;

          if (!isNaN(t.length)) {
            var o = -1,
                s = function n() {
              for (; ++o < t.length;) if (r.call(t, o)) return n.value = t[o], n.done = !1, n;

              return n.value = e, n.done = !0, n;
            };

            return s.next = s;
          }
        }

        return {
          next: P
        };
      }

      function P() {
        return {
          value: e,
          done: !0
        };
      }

      return v.prototype = _.constructor = g, g.constructor = v, g[a] = v.displayName = "GeneratorFunction", t.isGeneratorFunction = function (t) {
        var e = "function" == typeof t && t.constructor;
        return !!e && (e === v || "GeneratorFunction" === (e.displayName || e.name));
      }, t.mark = function (t) {
        return Object.setPrototypeOf ? Object.setPrototypeOf(t, g) : (t.__proto__ = g, a in t || (t[a] = "GeneratorFunction")), t.prototype = Object.create(_), t;
      }, t.awrap = function (t) {
        return {
          __await: t
        };
      }, x(L.prototype), L.prototype[s] = function () {
        return this;
      }, t.AsyncIterator = L, t.async = function (e, n, r, o) {
        var i = new L(c(e, n, r, o));
        return t.isGeneratorFunction(n) ? i : i.next().then(function (t) {
          return t.done ? t.value : i.next();
        });
      }, x(_), _[a] = "Generator", _[i] = function () {
        return this;
      }, _.toString = function () {
        return "[object Generator]";
      }, t.keys = function (t) {
        var e = [];

        for (var n in t) e.push(n);

        return e.reverse(), function n() {
          for (; e.length;) {
            var r = e.pop();
            if (r in t) return n.value = r, n.done = !1, n;
          }

          return n.done = !0, n;
        };
      }, t.values = j, S.prototype = {
        constructor: S,
        reset: function (t) {
          if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(k), !t) for (var n in this) "t" === n.charAt(0) && r.call(this, n) && !isNaN(+n.slice(1)) && (this[n] = e);
        },
        stop: function () {
          this.done = !0;
          var t = this.tryEntries[0].completion;
          if ("throw" === t.type) throw t.arg;
          return this.rval;
        },
        dispatchException: function (t) {
          if (this.done) throw t;
          var n = this;

          function o(r, o) {
            return a.type = "throw", a.arg = t, n.next = r, o && (n.method = "next", n.arg = e), !!o;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var s = this.tryEntries[i],
                a = s.completion;
            if ("root" === s.tryLoc) return o("end");

            if (s.tryLoc <= this.prev) {
              var c = r.call(s, "catchLoc"),
                  u = r.call(s, "finallyLoc");

              if (c && u) {
                if (this.prev < s.catchLoc) return o(s.catchLoc, !0);
                if (this.prev < s.finallyLoc) return o(s.finallyLoc);
              } else if (c) {
                if (this.prev < s.catchLoc) return o(s.catchLoc, !0);
              } else {
                if (!u) throw new Error("try statement without catch or finally");
                if (this.prev < s.finallyLoc) return o(s.finallyLoc);
              }
            }
          }
        },
        abrupt: function (t, e) {
          for (var n = this.tryEntries.length - 1; n >= 0; --n) {
            var o = this.tryEntries[n];

            if (o.tryLoc <= this.prev && r.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
              var i = o;
              break;
            }
          }

          i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
          var s = i ? i.completion : {};
          return s.type = t, s.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(s);
        },
        complete: function (t, e) {
          if ("throw" === t.type) throw t.arg;
          return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
        },
        finish: function (t) {
          for (var e = this.tryEntries.length - 1; e >= 0; --e) {
            var n = this.tryEntries[e];
            if (n.finallyLoc === t) return this.complete(n.completion, n.afterLoc), k(n), y;
          }
        },
        catch: function (t) {
          for (var e = this.tryEntries.length - 1; e >= 0; --e) {
            var n = this.tryEntries[e];

            if (n.tryLoc === t) {
              var r = n.completion;

              if ("throw" === r.type) {
                var o = r.arg;
                k(n);
              }

              return o;
            }
          }

          throw new Error("illegal catch attempt");
        },
        delegateYield: function (t, n, r) {
          return this.delegate = {
            iterator: j(t),
            resultName: n,
            nextLoc: r
          }, "next" === this.method && (this.arg = e), y;
        }
      }, t;
    }(t.exports);

    try {
      regeneratorRuntime = e;
    } catch (t) {
      Function("r", "regeneratorRuntime = r")(e);
    }
  });

  var a = function (t) {
    if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return t;
  };

  var c = function (t, n) {
    return !n || "object" !== e(n) && "function" != typeof n ? a(t) : n;
  },
      u = t(function (t) {
    function e(n) {
      return t.exports = e = Object.setPrototypeOf ? Object.getPrototypeOf : function (t) {
        return t.__proto__ || Object.getPrototypeOf(t);
      }, e(n);
    }

    t.exports = e;
  });

  var h = function (t, e) {
    for (; !Object.prototype.hasOwnProperty.call(t, e) && null !== (t = u(t)););

    return t;
  },
      l = t(function (t) {
    function e(n, r, o) {
      return "undefined" != typeof Reflect && Reflect.get ? t.exports = e = Reflect.get : t.exports = e = function (t, e, n) {
        var r = h(t, e);

        if (r) {
          var o = Object.getOwnPropertyDescriptor(r, e);
          return o.get ? o.get.call(n) : o.value;
        }
      }, e(n, r, o || n);
    }

    t.exports = e;
  }),
      f$6 = t(function (t) {
    function e(n, r) {
      return t.exports = e = Object.setPrototypeOf || function (t, e) {
        return t.__proto__ = e, t;
      }, e(n, r);
    }

    t.exports = e;
  });

  var p = function (t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t.prototype = Object.create(e && e.prototype, {
      constructor: {
        value: t,
        writable: !0,
        configurable: !0
      }
    }), e && f$6(t, e);
  },
      y = function (t) {
    function r() {
      var t,
          e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 100 * Math.random() | 0;
      return n(this, r), (t = c(this, u(r).call(this))).id = "BELLHOP:".concat(e), t.connected = !1, t.isChild = !0, t.connecting = !1, t.debug = !1, t.origin = "*", t._sendLater = [], t.iframe = null, t.receive = t.receive.bind(a(t)), t;
    }

    return p(r, i), o(r, [{
      key: "receive",
      value: function (t) {
        if (this.target === t.source) if (this.logDebugMessage(!0, t), "connected" === t.data) this.onConnectionReceived(t.data);else {
          var n = t.data;
          if ("string" == typeof n) try {
            n = JSON.parse(n);
          } catch (t) {
            console.error("Bellhop error: ", t);
          }
          this.connected && "object" === e(n) && n.type && this.trigger(n);
        }
      }
    }, {
      key: "onConnectionReceived",
      value: function (t) {
        this.connecting = !1, this.connected = !0, this.isChild || this.target.postMessage(t, this.origin);

        for (var e = 0; e < this._sendLater.length; e++) {
          var n = this._sendLater[e],
              r = n.type,
              o = n.data;
          this.send(r, o);
        }

        this._sendLater.length = 0, this.trigger("connected");
      }
    }, {
      key: "connect",
      value: function (t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "*";
        this.connecting || (this.disconnect(), this.connecting = !0, t instanceof HTMLIFrameElement && (this.iframe = t), this.isChild = void 0 === t, this.supported = !0, this.isChild && (this.supported = window != t), this.origin = e, window.addEventListener("message", this.receive), this.isChild && (window === this.target ? this.trigger("failed") : this.target.postMessage("connected", this.origin)));
      }
    }, {
      key: "disconnect",
      value: function () {
        this.connected = !1, this.connecting = !1, this.origin = null, this.iframe = null, this.isChild = !0, this._sendLater.length = 0, window.removeEventListener("message", this.receive);
      }
    }, {
      key: "send",
      value: function (t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        if ("string" != typeof t) throw "The event type must be a string";
        var n = {
          type: t,
          data: e
        };
        this.logDebugMessage(!1, n), this.connecting ? this._sendLater.push(n) : this.target.postMessage(JSON.stringify(n), this.origin);
      }
    }, {
      key: "fetch",
      value: function (t, e) {
        var n = this,
            r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
            o = arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
        if (!this.connecting && !this.connected) throw "No connection, please call connect() first";

        var i = function t(r) {
          o && n.off(r.type, t), e(r);
        };

        this.on(t, i), this.send(t, r);
      }
    }, {
      key: "respond",
      value: function (t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
            n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
            r = this,
            o = function t(o) {
          var i;
          return s.async(function (a) {
            for (;;) switch (a.prev = a.next) {
              case 0:
                return n && r.off(o, t), "function" == typeof e && (e = e()), a.next = 4, s.awrap(e);

              case 4:
                i = a.sent, r.send(o.type, i);

              case 6:
              case "end":
                return a.stop();
            }
          });
        };

        this.on(t, o);
      }
    }, {
      key: "logDebugMessage",
      value: function () {
        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
            e = arguments.length > 1 ? arguments[1] : void 0;
        this.debug && "function" == typeof this.debug ? this.debug({
          isChild: this.isChild,
          received: !1,
          message: e
        }) : this.debug && console.log("Bellhop Instance (".concat(this.isChild ? "Child" : "Parent", ") ").concat(t ? "Receieved" : "Sent"), e);
      }
    }, {
      key: "destroy",
      value: function () {
        l(u(r.prototype), "destroy", this).call(this), this.disconnect(), this._sendLater.length = 0;
      }
    }, {
      key: "target",
      get: function () {
        return this.isChild ? window.parent : this.iframe.contentWindow;
      }
    }]), r;
  }();

  /**
   *
   *
   * @export
   * @class PluginManager
   */

  var PluginManager =
  /*#__PURE__*/
  function () {
    /**
     *Creates an instance of PluginManager.
     * @memberof PluginManager
     */
    function PluginManager(_ref) {
      var _ref$plugins = _ref.plugins,
          plugins = _ref$plugins === void 0 ? [] : _ref$plugins;

      _classCallCheck(this, PluginManager);

      this.client = new y(); // @ts-ignore

      this.client.hidden = this.client.receive.bind(this.client); // @ts-ignore

      this.client.hiddenSend = this.client.send.bind(this.client);

      this.client.receive = function (event) {
        this.hidden(event);
      }.bind(this.client);

      this.client.send = function (event, data) {
        this.hiddenSend(event, data);
      }.bind(this.client);

      this.plugins = plugins;
    }
    /**
     *
     *
     * @returns
     * @memberof PluginManager
     */


    _createClass(PluginManager, [{
      key: "setupPlugins",
      value: function setupPlugins() {
        var _this = this;

        var preloads = [];

        var _loop = function _loop(i, l) {
          if (!_this.plugins[i].preload) {
            return {
              v: void 0
            };
          }

          preloads.push(_this.plugins[i].preload(_this).catch(function preloadFail(error) {
            this.plugins[i].preloadFailed = true;
            console.warn(this.plugins[i].name, 'Preload Failed:', error);
          }));
        };

        for (var i = 0, l = this.plugins.length; i < l; i++) {
          var _ret = _loop(i, l);

          if (_typeof(_ret) === "object") return _ret.v;
        } // ~wait for all preloads to resolve


        return Promise.all(preloads).then(function () {
          // Remove plugins that fail to load.
          _this.plugins = _this.plugins.filter(function (plugin) {
            return plugin.preloadFailed !== true;
          }); //init

          _this.plugins.forEach(function (plugin) {
            if (!plugin.init) {
              return;
            }

            plugin.init(_this);
          }); //start


          _this.plugins.forEach(function (plugin) {
            if (!plugin.start) {
              return;
            }

            plugin.start(_this);
          });
        });
      }
      /**
       * Registers a plugin to be used by PluginManagers, sorting it by priority order.
       * @param {BasePlugin} plugin The plugin to register.
       */

    }, {
      key: "uses",
      value: function uses(plugin) {
        this.plugins.push(plugin);
      }
      /**
       * Finds a plugin by name.
       * @param {string} name The name of the plugin.
       * @returns {BasePlugin}
       */

    }, {
      key: "getPlugin",
      value: function getPlugin(name) {
        return this.plugins.find(function (plugin) {
          return plugin.name === name;
        });
      }
    }]);

    return PluginManager;
  }();

  var version$1 = "2.1.0";

  /**
   * The application container
   * @class Container
   * @property {Bellhop} client Communication layer between the container and application
   * @property {boolean} loaded Check to see if a application is loaded
   * @property {boolean} loading Check to see if a application is loading
   * @property {object} release The current release data
   * @property {HTMLIFrameElement} iframe The DOM object for the iframe
   * @static @property {string} version The current version of the library
   */

  var Container =
  /*#__PURE__*/
  function (_PluginManager) {
    _inherits(Container, _PluginManager);

    /**
     *Creates an instance of Container.
     * @param {object} config
     * @param {string | HTMLIFrameElement} iframeOrSelector
     * @param {Array<BasePlugin> | null} [config.plugins=[]]
     * @memberof Container
     */
    function Container(iframeOrSelector) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          plugins = _ref.plugins;

      _classCallCheck(this, Container);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Container).call(this, {
        plugins: plugins
      }));
      _this.iframe = iframeOrSelector instanceof HTMLIFrameElement ? iframeOrSelector : document.querySelector(iframeOrSelector);

      if (null === _this.iframe) {
        throw new Error('No iframe was found with the provided selector');
      }

      _this.loaded = false;
      _this.loading = false;
      _this.release = null;
      _this.onLoading = _this.onLoading.bind(_assertThisInitialized(_this));
      _this.onLoadDone = _this.onLoadDone.bind(_assertThisInitialized(_this));
      _this.onLoadDone = _this.onLoadDone.bind(_assertThisInitialized(_this));
      _this.onEndGame = _this.onEndGame.bind(_assertThisInitialized(_this));
      _this.onLocalError = _this.onLocalError.bind(_assertThisInitialized(_this));

      _this.initClient();

      _this.setupPlugins();

      return _this;
    }
    /**
     * The game is starting to load
     * @memberof Container
     */


    _createClass(Container, [{
      key: "onLoading",
      value: function onLoading() {
        this.client.trigger('opening');
      }
      /**
       * Reset the mutes for audio and captions
       * @memberof Container
       */

    }, {
      key: "onLoadDone",
      value: function onLoadDone() {
        this.loading = false;
        this.loaded = true;
        this.iframe.classList.remove('loading');
        this.client.trigger('opened');
      }
      /**
       * The application ended and destroyed itself
       * @memberof Container
       */

    }, {
      key: "onEndGame",
      value: function onEndGame() {
        this.reset();
      }
      /**
       * Handle the local errors
       * @method onLocalError
       * @private
       * @param  {Event} $event Bellhop event
       */

    }, {
      key: "onLocalError",
      value: function onLocalError($event) {
        console.error('SpringRoll Container error: ', $event, new Error().stack);
      }
      /**
       * Reset all the buttons back to their original setting
       * and clear the iframe.
       * @memberof Container
       */

    }, {
      key: "reset",
      value: function reset() {
        var wasLoaded = this.loaded || this.loading;

        if (wasLoaded) {
          this.client.trigger('closed');
        } // Reset state


        this.loaded = false;
        this.loading = false; // Clear the iframe src location

        this.iframe.setAttribute('src', '');
        this.iframe.classList.remove('loading');
      }
      /**
       * Set up communication layer between site and application.
       * May be called from subclasses if they create/destroy Bellhop instances.
       * @memberof Container
       */

    }, {
      key: "initClient",
      value: function initClient() {
        //Handle bellhop events coming from the application
        this.client.on('loading', this.onLoading);
        this.client.on('loaded', this.onLoadDone);
        this.client.on('loadDone', this.onLoadDone);
        this.client.on('endGame', this.onEndGame);
        this.client.on('localError', this.onLocalError); // @ts-ignore

        this.client.connect(this.iframe);
      }
      /**
       * If there was an error when closing, reset the container
       * @memberof Container
       */

    }, {
      key: "_onCloseFailed",
      value: function _onCloseFailed() {
        this.reset(); // force close the app
      }
      /**
       * Open a application or path
       * @param {string} userPath The full path to the application to load
       * @param {object} [userOptions] The open options
       * @param {boolean} [userOptions.singlePlay=false] If we should play in single play mode
       * @param {object | null} [userOptions.playOptions=null] The optional play options
       * @memberof Container
       */

    }, {
      key: "_internalOpen",
      value: function _internalOpen(userPath) {
        var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref2$singlePlay = _ref2.singlePlay,
            singlePlay = _ref2$singlePlay === void 0 ? false : _ref2$singlePlay,
            _ref2$playOptions = _ref2.playOptions,
            playOptions = _ref2$playOptions === void 0 ? null : _ref2$playOptions;

        var options = {
          singlePlay: singlePlay,
          playOptions: playOptions
        };
        this.reset();
        this.loading = true;
        this.initClient();
        var err = Features.basic();

        if (err) {
          console.error('ERROR:', err);
          this.client.trigger('unsupported');
        }

        var path = userPath;

        if (null !== options.playOptions) {
          var playOptionsQueryString = 'playOptions=' + encodeURIComponent(JSON.stringify(options.playOptions));
          path = -1 === userPath.indexOf('?') ? "".concat(userPath, "?").concat(playOptionsQueryString) : "".concat(userPath, "&").concat(playOptionsQueryString);
        }

        this.iframe.classList.add('loading');
        this.iframe.setAttribute('src', path);
        this.client.respond('singlePlay', {
          singlePlay: singlePlay
        });
        this.client.respond('playOptions', playOptions);
        this.client.trigger('open');
      }
      /**
       *
       *
       * @param {string} path
       * @param {object} [options={}]
       * @memberof Container
       */

    }, {
      key: "openPath",
      value: function openPath(path) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // This should be deprecated, support for old function signature
        if ('object' !== _typeof(options)) {
          console.warn('SpringRoll Container.openPath was passed a invalid options parameter. Using default parameters instead');
          options = {};
        }

        this._internalOpen(path, Object.assign({
          singlePlay: false,
          playOptions: {}
        }, options));
      }
      /**
       * Open application based on an API Call to SpringRoll Connect
       * @param {string} api
       * @param {object} options
       * @param {string} [options.query='']
       * @param {boolean} [options.singlePlay=false]
       * @param {null | object} [options.playOptions=null]
       * @returns {Promise<void>}
       * @memberof Container
       */

    }, {
      key: "openRemote",
      value: function () {
        var _openRemote = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(api) {
          var _ref3,
              _ref3$query,
              query,
              _ref3$singlePlay,
              singlePlay,
              _ref3$playOptions,
              playOptions,
              response,
              json,
              release,
              error,
              _args = arguments;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _ref3 = _args.length > 1 && _args[1] !== undefined ? _args[1] : {}, _ref3$query = _ref3.query, query = _ref3$query === void 0 ? '' : _ref3$query, _ref3$singlePlay = _ref3.singlePlay, singlePlay = _ref3$singlePlay === void 0 ? false : _ref3$singlePlay, _ref3$playOptions = _ref3.playOptions, playOptions = _ref3$playOptions === void 0 ? null : _ref3$playOptions;
                  this.release = null;
                  _context.next = 4;
                  return fetch(api, {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });

                case 4:
                  response = _context.sent;
                  _context.next = 7;
                  return response.json();

                case 7:
                  json = _context.sent;

                  if (json.success) {
                    _context.next = 10;
                    break;
                  }

                  throw new Error(json.error);

                case 10:
                  // If the browser doesn't support the capabilities requested by this game, also fail.
                  release = json.data;
                  error = Features.test(release.capabilities);

                  if (!error) {
                    _context.next = 15;
                    break;
                  }

                  this.client.trigger('unsupported', {
                    error: error
                  });
                  throw new Error(error);

                case 15:
                  // otherwise, open the game
                  this.release = release;

                  this._internalOpen(release.url + query, {
                    singlePlay: singlePlay,
                    playOptions: playOptions
                  });

                case 17:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function openRemote(_x) {
          return _openRemote.apply(this, arguments);
        }

        return openRemote;
      }()
      /**
       * Destroy and don't use after this
       * @memberof Container
       */

    }, {
      key: "destroy",
      value: function destroy() {
        this.reset();
        this.iframe = null;
        this.options = null;
        this.release = null;
      }
      /**
       * Tell the application to start closing
       * @memberof Container
       */

    }, {
      key: "close",
      value: function close() {
        if (this.loading || this.loaded) {
          this.client.trigger('close'); // Start the close

          this.client.send('close');
        } else {
          this.reset();
        }
      }
      /**
       * The current version of SpringRollContainer
       * @readonly
       * @static
       * @memberof Container
       */

    }], [{
      key: "version",
      get: function get() {
        return version$1;
      }
    }]);

    return Container;
  }(PluginManager);

  /**
   * Handle the page visiblity change, if supported. Application uses one of these to
   * monitor page visibility. It is suggested that you listen to `pause`, `paused`,
   * or `resumed` events on the Application instead of using one of these yourself.
   *
   * @export
   * @class PageVisibility
   * @constructor
   * @param {Function} onFocus Callback when the page becomes visible
   * @param {Function} onBlur Callback when the page loses visibility
   */
  var PageVisibility =
  /*#__PURE__*/
  function () {
    /**
     *Creates an instance of PageVisibility.
     * @param { function } [onFocus=function() {}]
     * @param { function } [onBlur=function() {}]
     * @memberof PageVisibility
     */
    function PageVisibility() {
      var onFocus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      var onBlur = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      _classCallCheck(this, PageVisibility);

      this._onFocus = onFocus;
      this._onBlur = onBlur;

      this.onFocus = function (e) {
        if (this.enabled) {
          this._onFocus(e);
        }
      }.bind(this);

      this.onBlur = function (e) {
        if (this.enabled) {
          this._onBlur(e);
        }
      }.bind(this);

      this._enabled = false;
      this.enabled = true;
      this.onToggle = this.onToggle.bind(this);
    }
    /**
     * Disable the detection
     * @memberof PageVisibility
     */


    _createClass(PageVisibility, [{
      key: "destroy",
      value: function destroy() {
        this.enabled = false;
        this.onToggle = null;
        this.onFocus = null;
        this.onBlur = null;
      }
      /**
       * The visibility toggle listener function
       * @param {Event} $event;
       * @memberof PageVisibility
       */

    }, {
      key: "onToggle",
      value: function onToggle($event) {
        if (this.enabled) {
          document.hidden ? this.onBlur($event) : this.onFocus($event);
        }
      }
      /**
       * If this object is enabled.
       * @returns {boolean}
       * @memberof PageVisibility
       */

    }, {
      key: "enabled",
      get: function get() {
        return this._enabled;
      }
      /**
       * Sets the state of the object
       * @memberof PageVisibility
       */
      ,
      set: function set(enable) {
        this._enabled = enable;
        document.removeEventListener('visibilitychange', this.onToggle, false);
        window.removeEventListener('blur', this.onBlur, false);
        window.removeEventListener('focus', this.onFocus, false);
        window.removeEventListener('pagehide', this.onBlur, false);
        window.removeEventListener('pageshow', this.onFocus, false);
        window.removeEventListener('visibilitychange', this.onToggle, false);

        if (this._enabled) {
          document.addEventListener('visibilitychange', this.onToggle, false);
          window.addEventListener('blur', this.onBlur, false);
          window.addEventListener('focus', this.onFocus, false);
          window.addEventListener('pagehide', this.onBlur, false);
          window.addEventListener('pageshow', this.onFocus, false);
          window.addEventListener('visibilitychange', this.onToggle, false);
        }
      }
    }]);

    return PageVisibility;
  }();

  var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;
  var toString$1 = {}.toString;
  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function (it) {
    try {
      return nativeGetOwnPropertyNames(it);
    } catch (error) {
      return windowNames.slice();
    }
  }; // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window


  var f$7 = function getOwnPropertyNames(it) {
    return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : nativeGetOwnPropertyNames(toIndexedObject(it));
  };

  var objectGetOwnPropertyNamesExternal = {
    f: f$7
  };

  var f$8 = wellKnownSymbol;
  var wellKnownSymbolWrapped = {
    f: f$8
  };

  var defineProperty$3 = objectDefineProperty.f;

  var defineWellKnownSymbol = function (NAME) {
    var Symbol = path.Symbol || (path.Symbol = {});
    if (!has(Symbol, NAME)) defineProperty$3(Symbol, NAME, {
      value: wellKnownSymbolWrapped.f(NAME)
    });
  };

  var $forEach$1 = arrayIteration.forEach;
  var HIDDEN = sharedKey('hidden');
  var SYMBOL = 'Symbol';
  var PROTOTYPE$1 = 'prototype';
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
  var setInternalState$3 = internalState.set;
  var getInternalState$3 = internalState.getterFor(SYMBOL);
  var ObjectPrototype$1 = Object[PROTOTYPE$1];
  var $Symbol = global_1.Symbol;
  var $stringify = getBuiltIn('JSON', 'stringify');
  var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
  var nativeDefineProperty$1 = objectDefineProperty.f;
  var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNamesExternal.f;
  var nativePropertyIsEnumerable$1 = objectPropertyIsEnumerable.f;
  var AllSymbols = shared('symbols');
  var ObjectPrototypeSymbols = shared('op-symbols');
  var StringToSymbolRegistry = shared('string-to-symbol-registry');
  var SymbolToStringRegistry = shared('symbol-to-string-registry');
  var WellKnownSymbolsStore$1 = shared('wks');
  var QObject = global_1.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

  var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

  var setSymbolDescriptor = descriptors && fails(function () {
    return objectCreate(nativeDefineProperty$1({}, 'a', {
      get: function () {
        return nativeDefineProperty$1(this, 'a', {
          value: 7
        }).a;
      }
    })).a != 7;
  }) ? function (O, P, Attributes) {
    var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype$1, P);
    if (ObjectPrototypeDescriptor) delete ObjectPrototype$1[P];
    nativeDefineProperty$1(O, P, Attributes);

    if (ObjectPrototypeDescriptor && O !== ObjectPrototype$1) {
      nativeDefineProperty$1(ObjectPrototype$1, P, ObjectPrototypeDescriptor);
    }
  } : nativeDefineProperty$1;

  var wrap = function (tag, description) {
    var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
    setInternalState$3(symbol, {
      type: SYMBOL,
      tag: tag,
      description: description
    });
    if (!descriptors) symbol.description = description;
    return symbol;
  };

  var isSymbol = useSymbolAsUid ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    return Object(it) instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(O, P, Attributes) {
    if (O === ObjectPrototype$1) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
    anObject(O);
    var key = toPrimitive(P, true);
    anObject(Attributes);

    if (has(AllSymbols, key)) {
      if (!Attributes.enumerable) {
        if (!has(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor(1, {}));
        O[HIDDEN][key] = true;
      } else {
        if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
        Attributes = objectCreate(Attributes, {
          enumerable: createPropertyDescriptor(0, false)
        });
      }

      return setSymbolDescriptor(O, key, Attributes);
    }

    return nativeDefineProperty$1(O, key, Attributes);
  };

  var $defineProperties = function defineProperties(O, Properties) {
    anObject(O);
    var properties = toIndexedObject(Properties);
    var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
    $forEach$1(keys, function (key) {
      if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
    });
    return O;
  };

  var $create = function create(O, Properties) {
    return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
  };

  var $propertyIsEnumerable = function propertyIsEnumerable(V) {
    var P = toPrimitive(V, true);
    var enumerable = nativePropertyIsEnumerable$1.call(this, P);
    if (this === ObjectPrototype$1 && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
    return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
  };

  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
    var it = toIndexedObject(O);
    var key = toPrimitive(P, true);
    if (it === ObjectPrototype$1 && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
    var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);

    if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
      descriptor.enumerable = true;
    }

    return descriptor;
  };

  var $getOwnPropertyNames = function getOwnPropertyNames(O) {
    var names = nativeGetOwnPropertyNames$1(toIndexedObject(O));
    var result = [];
    $forEach$1(names, function (key) {
      if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
    });
    return result;
  };

  var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
    var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$1;
    var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
    var result = [];
    $forEach$1(names, function (key) {
      if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype$1, key))) {
        result.push(AllSymbols[key]);
      }
    });
    return result;
  }; // `Symbol` constructor
  // https://tc39.github.io/ecma262/#sec-symbol-constructor


  if (!nativeSymbol) {
    $Symbol = function Symbol() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
      var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
      var tag = uid(description);

      var setter = function (value) {
        if (this === ObjectPrototype$1) setter.call(ObjectPrototypeSymbols, value);
        if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
      };

      if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype$1, tag, {
        configurable: true,
        set: setter
      });
      return wrap(tag, description);
    };

    redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
      return getInternalState$3(this).tag;
    });
    redefine($Symbol, 'withoutSetter', function (description) {
      return wrap(uid(description), description);
    });
    objectPropertyIsEnumerable.f = $propertyIsEnumerable;
    objectDefineProperty.f = $defineProperty;
    objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
    objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
    objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

    wellKnownSymbolWrapped.f = function (name) {
      return wrap(wellKnownSymbol(name), name);
    };

    if (descriptors) {
      // https://github.com/tc39/proposal-Symbol-description
      nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
        configurable: true,
        get: function description() {
          return getInternalState$3(this).description;
        }
      });

      {
        redefine(ObjectPrototype$1, 'propertyIsEnumerable', $propertyIsEnumerable, {
          unsafe: true
        });
      }
    }
  }

  _export({
    global: true,
    wrap: true,
    forced: !nativeSymbol,
    sham: !nativeSymbol
  }, {
    Symbol: $Symbol
  });
  $forEach$1(objectKeys(WellKnownSymbolsStore$1), function (name) {
    defineWellKnownSymbol(name);
  });
  _export({
    target: SYMBOL,
    stat: true,
    forced: !nativeSymbol
  }, {
    // `Symbol.for` method
    // https://tc39.github.io/ecma262/#sec-symbol.for
    'for': function (key) {
      var string = String(key);
      if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
      var symbol = $Symbol(string);
      StringToSymbolRegistry[string] = symbol;
      SymbolToStringRegistry[symbol] = string;
      return symbol;
    },
    // `Symbol.keyFor` method
    // https://tc39.github.io/ecma262/#sec-symbol.keyfor
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
      if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
    },
    useSetter: function () {
      USE_SETTER = true;
    },
    useSimple: function () {
      USE_SETTER = false;
    }
  });
  _export({
    target: 'Object',
    stat: true,
    forced: !nativeSymbol,
    sham: !descriptors
  }, {
    // `Object.create` method
    // https://tc39.github.io/ecma262/#sec-object.create
    create: $create,
    // `Object.defineProperty` method
    // https://tc39.github.io/ecma262/#sec-object.defineproperty
    defineProperty: $defineProperty,
    // `Object.defineProperties` method
    // https://tc39.github.io/ecma262/#sec-object.defineproperties
    defineProperties: $defineProperties,
    // `Object.getOwnPropertyDescriptor` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor
  });
  _export({
    target: 'Object',
    stat: true,
    forced: !nativeSymbol
  }, {
    // `Object.getOwnPropertyNames` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
    getOwnPropertyNames: $getOwnPropertyNames,
    // `Object.getOwnPropertySymbols` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
    getOwnPropertySymbols: $getOwnPropertySymbols
  }); // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
  // https://bugs.chromium.org/p/v8/issues/detail?id=3443

  _export({
    target: 'Object',
    stat: true,
    forced: fails(function () {
      objectGetOwnPropertySymbols.f(1);
    })
  }, {
    getOwnPropertySymbols: function getOwnPropertySymbols(it) {
      return objectGetOwnPropertySymbols.f(toObject(it));
    }
  }); // `JSON.stringify` method behavior with symbols
  // https://tc39.github.io/ecma262/#sec-json.stringify

  if ($stringify) {
    var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
      var symbol = $Symbol(); // MS Edge converts symbol values to JSON as {}

      return $stringify([symbol]) != '[null]' // WebKit converts symbol values to JSON as null
      || $stringify({
        a: symbol
      }) != '{}' // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
    });
    _export({
      target: 'JSON',
      stat: true,
      forced: FORCED_JSON_STRINGIFY
    }, {
      // eslint-disable-next-line no-unused-vars
      stringify: function stringify(it, replacer, space) {
        var args = [it];
        var index = 1;
        var $replacer;

        while (arguments.length > index) args.push(arguments[index++]);

        $replacer = replacer;
        if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

        if (!isArray(replacer)) replacer = function (key, value) {
          if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
          if (!isSymbol(value)) return value;
        };
        args[1] = replacer;
        return $stringify.apply(null, args);
      }
    });
  } // `Symbol.prototype[@@toPrimitive]` method
  // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive


  if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
    createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
  } // `Symbol.prototype[@@toStringTag]` property
  // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag


  setToStringTag($Symbol, SYMBOL);
  hiddenKeys[HIDDEN] = true;

  var defineProperty$4 = objectDefineProperty.f;
  var NativeSymbol = global_1.Symbol;

  if (descriptors && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) || // Safari 12 bug
  NativeSymbol().description !== undefined)) {
    var EmptyStringDescriptionStore = {}; // wrap Symbol constructor for correct work with undefined description

    var SymbolWrapper = function Symbol() {
      var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
      var result = this instanceof SymbolWrapper ? new NativeSymbol(description) // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
      if (description === '') EmptyStringDescriptionStore[result] = true;
      return result;
    };

    copyConstructorProperties(SymbolWrapper, NativeSymbol);
    var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
    symbolPrototype.constructor = SymbolWrapper;
    var symbolToString = symbolPrototype.toString;
    var native = String(NativeSymbol('test')) == 'Symbol(test)';
    var regexp = /^Symbol\((.*)\)[^)]+$/;
    defineProperty$4(symbolPrototype, 'description', {
      configurable: true,
      get: function description() {
        var symbol = isObject(this) ? this.valueOf() : this;
        var string = symbolToString.call(symbol);
        if (has(EmptyStringDescriptionStore, symbol)) return '';
        var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
        return desc === '' ? undefined : desc;
      }
    });
    _export({
      global: true,
      forced: true
    }, {
      Symbol: SymbolWrapper
    });
  }

  // https://tc39.github.io/ecma262/#sec-symbol.iterator

  defineWellKnownSymbol('iterator');

  var $includes = arrayIncludes.includes;
  var USES_TO_LENGTH$4 = arrayMethodUsesToLength('indexOf', {
    ACCESSORS: true,
    1: 0
  }); // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes

  _export({
    target: 'Array',
    proto: true,
    forced: !USES_TO_LENGTH$4
  }, {
    includes: function includes(el
    /* , fromIndex = 0 */
    ) {
      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  }); // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

  addToUnscopables('includes');

  // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags


  var regexpFlags = function () {
    var that = anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.dotAll) result += 's';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  // so we use an intermediate function.


  function RE(s, f) {
    return RegExp(s, f);
  }

  var UNSUPPORTED_Y = fails(function () {
    // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
    var re = RE('a', 'y');
    re.lastIndex = 2;
    return re.exec('abcd') != null;
  });
  var BROKEN_CARET = fails(function () {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
    var re = RE('^r', 'gy');
    re.lastIndex = 2;
    return re.exec('str') != null;
  });
  var regexpStickyHelpers = {
    UNSUPPORTED_Y: UNSUPPORTED_Y,
    BROKEN_CARET: BROKEN_CARET
  };

  var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.

  var nativeReplace = String.prototype.replace;
  var patchedExec = nativeExec;

  var UPDATES_LAST_INDEX_WRONG = function () {
    var re1 = /a/;
    var re2 = /b*/g;
    nativeExec.call(re1, 'a');
    nativeExec.call(re2, 'a');
    return re1.lastIndex !== 0 || re2.lastIndex !== 0;
  }();

  var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET; // nonparticipating capturing group, copied from es5-shim's String#split patch.

  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;
      var sticky = UNSUPPORTED_Y$1 && re.sticky;
      var flags = regexpFlags.call(re);
      var source = re.source;
      var charsAdded = 0;
      var strCopy = str;

      if (sticky) {
        flags = flags.replace('y', '');

        if (flags.indexOf('g') === -1) {
          flags += 'g';
        }

        strCopy = String(str).slice(re.lastIndex); // Support anchored sticky behavior.

        if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
          source = '(?: ' + source + ')';
          strCopy = ' ' + strCopy;
          charsAdded++;
        } // ^(? + rx + ) is needed, in combination with some str slicing, to
        // simulate the 'y' flag.


        reCopy = new RegExp('^(?:' + source + ')', flags);
      }

      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
      }

      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
      match = nativeExec.call(sticky ? reCopy : re, strCopy);

      if (sticky) {
        if (match) {
          match.input = match.input.slice(charsAdded);
          match[0] = match[0].slice(charsAdded);
          match.index = re.lastIndex;
          re.lastIndex += match[0].length;
        } else re.lastIndex = 0;
      } else if (UPDATES_LAST_INDEX_WRONG && match) {
        re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
      }

      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        nativeReplace.call(match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var regexpExec = patchedExec;

  _export({
    target: 'RegExp',
    proto: true,
    forced: /./.exec !== regexpExec
  }, {
    exec: regexpExec
  });

  var SPECIES$5 = wellKnownSymbol('species');
  var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
    // #replace needs built-in support for named groups.
    // #match works fine because it just return the exec results, even if it has
    // a "grops" property.
    var re = /./;

    re.exec = function () {
      var result = [];
      result.groups = {
        a: '7'
      };
      return result;
    };

    return ''.replace(re, '$<a>') !== '7';
  }); // IE <= 11 replaces $0 with the whole match, as if it was $&
  // https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0

  var REPLACE_KEEPS_$0 = function () {
    return 'a'.replace(/./, '$0') === '$0';
  }();

  var REPLACE = wellKnownSymbol('replace'); // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string

  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function () {
    if (/./[REPLACE]) {
      return /./[REPLACE]('a', '$0') === '';
    }

    return false;
  }(); // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  // Weex JS has frozen built-in prototypes, so use try / catch wrapper


  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
    var re = /(?:)/;
    var originalExec = re.exec;

    re.exec = function () {
      return originalExec.apply(this, arguments);
    };

    var result = 'ab'.split(re);
    return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
  });

  var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
    var SYMBOL = wellKnownSymbol(KEY);
    var DELEGATES_TO_SYMBOL = !fails(function () {
      // String methods call symbol-named RegEp methods
      var O = {};

      O[SYMBOL] = function () {
        return 7;
      };

      return ''[KEY](O) != 7;
    });
    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
      // Symbol-named RegExp methods call .exec
      var execCalled = false;
      var re = /a/;

      if (KEY === 'split') {
        // We can't use real regex here since it causes deoptimization
        // and serious performance degradation in V8
        // https://github.com/zloirock/core-js/issues/306
        re = {}; // RegExp[@@split] doesn't call the regex's exec method, but first creates
        // a new one. We need to return the patched regex when creating the new one.

        re.constructor = {};

        re.constructor[SPECIES$5] = function () {
          return re;
        };

        re.flags = '';
        re[SYMBOL] = /./[SYMBOL];
      }

      re.exec = function () {
        execCalled = true;
        return null;
      };

      re[SYMBOL]('');
      return !execCalled;
    });

    if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0 && !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE) || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
      var nativeRegExpMethod = /./[SYMBOL];
      var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return {
              done: true,
              value: nativeRegExpMethod.call(regexp, str, arg2)
            };
          }

          return {
            done: true,
            value: nativeMethod.call(str, regexp, arg2)
          };
        }

        return {
          done: false
        };
      }, {
        REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
        REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
      });
      var stringMethod = methods[0];
      var regexMethod = methods[1];
      redefine(String.prototype, KEY, stringMethod);
      redefine(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) {
        return regexMethod.call(string, this, arg);
      } // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) {
        return regexMethod.call(string, this);
      });
    }

    if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
  };

  var MATCH = wellKnownSymbol('match'); // `IsRegExp` abstract operation
  // https://tc39.github.io/ecma262/#sec-isregexp

  var isRegexp = function (it) {
    var isRegExp;
    return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
  };

  var charAt$1 = stringMultibyte.charAt; // `AdvanceStringIndex` abstract operation
  // https://tc39.github.io/ecma262/#sec-advancestringindex

  var advanceStringIndex = function (S, index, unicode) {
    return index + (unicode ? charAt$1(S, index).length : 1);
  };

  // https://tc39.github.io/ecma262/#sec-regexpexec

  var regexpExecAbstract = function (R, S) {
    var exec = R.exec;

    if (typeof exec === 'function') {
      var result = exec.call(R, S);

      if (typeof result !== 'object') {
        throw TypeError('RegExp exec method returned something other than an Object or null');
      }

      return result;
    }

    if (classofRaw(R) !== 'RegExp') {
      throw TypeError('RegExp#exec called on incompatible receiver');
    }

    return regexpExec.call(R, S);
  };

  var arrayPush = [].push;
  var min$2 = Math.min;
  var MAX_UINT32 = 0xFFFFFFFF; // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError

  var SUPPORTS_Y = !fails(function () {
    return !RegExp(MAX_UINT32, 'y');
  }); // @@split logic

  fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
    var internalSplit;

    if ('abbc'.split(/(b)*/)[1] == 'c' || 'test'.split(/(?:)/, -1).length != 4 || 'ab'.split(/(?:ab)*/).length != 2 || '.'.split(/(.?)(.?)/).length != 4 || '.'.split(/()()/).length > 1 || ''.split(/.?/).length) {
      // based on es5-shim implementation, need to rework it
      internalSplit = function (separator, limit) {
        var string = String(requireObjectCoercible(this));
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (separator === undefined) return [string]; // If `separator` is not a regex, use native split

        if (!isRegexp(separator)) {
          return nativeSplit.call(string, separator, lim);
        }

        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
        var lastLastIndex = 0; // Make `global` and avoid `lastIndex` issues by working with a copy

        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var match, lastIndex, lastLength;

        while (match = regexpExec.call(separatorCopy, string)) {
          lastIndex = separatorCopy.lastIndex;

          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
            lastLength = match[0].length;
            lastLastIndex = lastIndex;
            if (output.length >= lim) break;
          }

          if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
        }

        if (lastLastIndex === string.length) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));

        return output.length > lim ? output.slice(0, lim) : output;
      }; // Chakra, V8

    } else if ('0'.split(undefined, 0).length) {
      internalSplit = function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
      };
    } else internalSplit = nativeSplit;

    return [// `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined ? splitter.call(separator, O, limit) : internalSplit.call(String(O), separator, limit);
    }, // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);
      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : '') + (rx.unicode ? 'u' : '') + (SUPPORTS_Y ? 'y' : 'g'); // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.

      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];

      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;

        if (z === null || (e = min$2(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;

          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }

          q = p = e;
        }
      }

      A.push(S.slice(p));
      return A;
    }];
  }, !SUPPORTS_Y);

  // a string of all valid unicode whitespaces
  // eslint-disable-next-line max-len
  var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

  var whitespace = '[' + whitespaces + ']';
  var ltrim = RegExp('^' + whitespace + whitespace + '*');
  var rtrim = RegExp(whitespace + whitespace + '*$'); // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation

  var createMethod$3 = function (TYPE) {
    return function ($this) {
      var string = String(requireObjectCoercible($this));
      if (TYPE & 1) string = string.replace(ltrim, '');
      if (TYPE & 2) string = string.replace(rtrim, '');
      return string;
    };
  };

  var stringTrim = {
    // `String.prototype.{ trimLeft, trimStart }` methods
    // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
    start: createMethod$3(1),
    // `String.prototype.{ trimRight, trimEnd }` methods
    // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
    end: createMethod$3(2),
    // `String.prototype.trim` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.trim
    trim: createMethod$3(3)
  };

  var non = '\u200B\u0085\u180E'; // check that a method works with the correct list
  // of whitespaces and has a correct name

  var stringTrimForced = function (METHOD_NAME) {
    return fails(function () {
      return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
    });
  };

  var $trim = stringTrim.trim; // `String.prototype.trim` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.trim

  _export({
    target: 'String',
    proto: true,
    forced: stringTrimForced('trim')
  }, {
    trim: function trim() {
      return $trim(this);
    }
  });

  var TO_STRING = 'toString';
  var RegExpPrototype = RegExp.prototype;
  var nativeToString = RegExpPrototype[TO_STRING];
  var NOT_GENERIC = fails(function () {
    return nativeToString.call({
      source: 'a',
      flags: 'b'
    }) != '/a/b';
  }); // FF44- RegExp#toString has a wrong name

  var INCORRECT_NAME = nativeToString.name != TO_STRING; // `RegExp.prototype.toString` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring

  if (NOT_GENERIC || INCORRECT_NAME) {
    redefine(RegExp.prototype, TO_STRING, function toString() {
      var R = anObject(this);
      var p = String(R.source);
      var rf = R.flags;
      var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
      return '/' + p + '/' + f;
    }, {
      unsafe: true
    });
  }

  /**
   * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
   *
   * @class SavedData
   */
  var SavedData =
  /*#__PURE__*/
  function () {
    /**
     * 
     */
    function SavedData() {
      var dbName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      _classCallCheck(this, SavedData);

      this.db = null;
      this.dbName = dbName;
    }
    /**
     * Remove a saved variable by name.
     * @method remove
     * @static
     * @param {String} name The name of the value to remove
     */


    _createClass(SavedData, [{
      key: "IDBOpen",

      /**
       * Open a connection with the IDB Database and optionally add or delete
       * Indexes and stores
       * 
       * @param {string} dbName The name of your IndexedDB database
       * @param {string} dbVersion The version number of the database. Additions and deletions will be ignored if lower than current version number
       * @param {JSON} additions Any additions to the structure of the database
       * @param {array} additions.stores Any stores to be added into the database syntax: {storeName: '[name]', options: {[optionally add options]}}
       * @param {array} additions.indexes Any Indexes to be added to the database syntax: {storeName: '[name]', options: {[optionally add options]}}
       */
      value: function IDBOpen(dbName) {
        var _this = this;

        var dbVersion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var additions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var deletions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var callback = arguments.length > 4 ? arguments[4] : undefined;
        var request = dbVersion ? indexedDB.open(dbName, dbVersion) : indexedDB.open(dbName);

        request.onsuccess = function (e) {
          _this.db = e.target.result;
          console.log(_this.db);

          if (_this.db.version == dbVersion) {
            callback('Success: IDBOpen');
          }
        };

        request.onerror = function () {
          callback({
            result: _this.db.error.toString(),
            success: false
          });
        }; // on upgrade needed fires only if the dbVersion is higher than the current version number


        request.onupgradeneeded = function (e) {
          _this.db = e.target.result;

          if (additions != null) {
            if (additions.stores) {
              additions.stores.forEach(function (store) {
                _this.db.createObjectStore(store.storeName, store.options);
              });
            }

            if (additions.indexes) {
              additions.indexes.forEach(function (index) {
                // Open a transaction returning a store object
                var storeObject = request.transaction.objectStore(index.storeName);
                storeObject.createIndex(index.indexName, index.keyPath, index.options);
              });
            }
          }

          if (deletions != null) {
            if (deletions.stores) {
              deletions.stores.forEach(function (store) {
                _this.db.deleteObjectStore(store.storeName);
              });
            }

            if (deletions.indexes) {
              deletions.indexes.forEach(function (index) {
                // Open a transaction returning a store object
                var storeObject = request.transaction.objectStore(index.storeName);
                storeObject.deleteIndex(index.indexName);
              });
            }
          }

          callback({
            result: 'Success: IDBOpen',
            success: true
          });
        };

        request.onerror = function () {
          callback({
            result: _this.db.error.toString(),
            success: false
          });
        };
      }
      /**
       * Add a record to a given store
       * @param {string} storeName The name of the store from which the record will be updated
       * @param {string} key the key of the record to be updated 
       * @param {*} value The value for the record with the given key to be updated
       */

    }, {
      key: "IDBAdd",
      value: function IDBAdd(storeName, value, key, callback) {
        if (!this.db && this.dbName != '') {
          this.IDBOpen(this.dbName);
        }

        var tx = this.db.transaction(storeName, 'readwrite');
        tx.onerror = callback({
          result: tx.error != null ? tx.error.toString() : 'Aborted: No error given, was the record already added?',
          success: false
        });
        tx.onabort = callback({
          result: tx.error != null ? tx.error.toString() : 'Aborted: No error given, was the record already added?',
          success: false
        });

        tx.oncomplete = function () {
          return callback({
            result: 'Success: Record Added',
            success: true
          });
        };

        var store = tx.objectStore(storeName);
        console.log('here');
        store.add(value, key);
      }
      /**
       * Update a record in a given store
       * @param {string} storeName 
       * @param {string} key the key of the record to be updated 
       * @param {string | object} value The altered object to be updated from the given store
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBUpdate",
      value: function IDBUpdate(storeName, key, value, callback) {
        var tx = this.db.transaction(storeName, 'readwrite');
        var store = tx.objectStore(storeName);
        var updateRequest = store.put(key, value);

        updateRequest.onsuccess = function () {
          callback({
            result: 'Success: Record Updated',
            success: true
          });
        };
      }
      /**
       * Delete a given record within a given store
       * @param {*} storeName 
       * @param {*} key 
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBRemove",
      value: function IDBRemove(storeName, key, callback) {
        var _this2 = this;

        if (!this.db && this.dbName != '') {
          this.IDBOpen(this.dbName);
        }

        var tx = this.db.transaction(storeName, 'readwrite');

        tx.onerror = function () {
          return callback({
            result: _this2.db.error.toString(),
            success: false
          });
        };

        var store = tx.objectStore(storeName);
        store.delete(key);

        tx.oncomplete = function () {
          return callback({
            result: 'Removed Successfully',
            success: true
          });
        };
      }
      /**
       * Return a record from a given store with a given key
       * @param {string} storeName 
       * @param {string} key The key for the record in the given store 
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBRead",
      value: function IDBRead(storeName, key, callback) {
        var _this3 = this;

        var tx = this.db.transaction(storeName, 'readonly');
        var store = tx.objectStore(storeName);

        tx.onerror = function () {
          return callback({
            result: _this3.db.error.toString(),
            success: false
          });
        };

        var readRequest = store.get(key);

        readRequest.onsuccess = function () {
          callback({
            data: readRequest.result
          });
        };
      }
      /**
       * Get all keys with given index
       * @param {string} query Optionally give a keyRange of records to return
       * @param {string} count Optionally give a max limit on records to be returned
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBGetIndexKeys",
      value: function IDBGetIndexKeys(storeName, indexName) {
        var _this4 = this;

        var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var count = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        var tx = this.db.transaction(storeName, 'readWrite');
        var store = tx.objectStore(storeName);
        var index;

        tx.onerror = function () {
          return callback({
            result: _this4.db.error.toString(),
            success: false
          });
        };

        if (query && count) {
          index = store.index(indexName, query, count);
        } else if (query) {
          index = store.index(indexName, query);
        } else {
          index = store.index(indexName);
        }

        var getAllKeysRequest = index.getAllKeys();

        getAllKeysRequest.onsuccess = function (e) {
          callback({
            result: e.result,
            success: true
          });
        };
      }
      /**
       * Get all records from a store
       * @param {string} storeName The store to get all records from
       * @param {integer} count Optionally the count of records to return
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBReadAll",
      value: function IDBReadAll(storeName, count, callback) {
        var _this5 = this;

        var tx = this.db.transaction(storeName, 'readonly');
        var store = tx.objectStore(storeName);
        var readRequest = count != null ? store.getAll(storeName) : store.getAll(storeName, count);

        tx.onerror = function () {
          return callback({
            result: _this5.db.error.toString(),
            success: false
          });
        };

        readRequest.onsuccess = function () {
          callback({
            result: readRequest.result,
            success: true
          });
        };
      }
      /**
       * Get the version number of a given database. This will create a database if it doesn't exist. 
       * Do not call this after opening a connection with 
       * @param {string} dbName The name of the database for which the version will be returned
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBGetVersion",
      value: function IDBGetVersion(dbName, callback) {
        // Open the database
        var dBOpenRequest = window.indexedDB.open(dbName); // these two event handlers act on the database
        // being opened. successfully, or not

        dBOpenRequest.onerror = function () {
          callback({
            result: dBOpenRequest.error.toString(),
            success: false
          });
        };

        dBOpenRequest.onsuccess = function () {
          var db = dBOpenRequest.result;
          callback({
            result: db.version,
            success: true
          });
        };
      }
      /**
       * Closes the connection to the database if open
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBClose",
      value: function IDBClose(callback) {
        if (this.db) {
          this.db.close();
          callback({
            result: 'Success: Closed Database Connection',
            success: true
          });
        }
      }
    }], [{
      key: "remove",
      value: function remove(name) {
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

    }, {
      key: "write",
      value: function write(name, value) {
        var tempOnly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        return tempOnly ? sessionStorage.setItem(name, JSON.stringify('function' === typeof value ? value() : value)) : localStorage.setItem(name, JSON.stringify('function' === typeof value ? value() : value));
      }
      /**
       * Read the value of a saved variable
       * @method read
       * @static
       * @param {String} name The name of the variable
       * @return {*} The value (run through `JSON.parse()`) or null if it doesn't exist
       */

    }, {
      key: "read",
      value: function read(name) {
        var value = localStorage.getItem(name) || sessionStorage.getItem(name);

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
    }]);

    return SavedData;
  }();

  /**
   *
   *
   * @export
   * @class BasePlugin
   * @property {Bellhop} client
   * @property {string} name
   */

  var BasePlugin =
  /*#__PURE__*/
  function () {
    /**
     *Creates an instance of BasePlugin.
     * @param {string} name
     * @memberof BasePlugin
     */
    function BasePlugin(name) {
      _classCallCheck(this, BasePlugin);

      this.name = name;
      this.client = null;
    }
    /**
     *
     * @param {Container} [container]
     * @memberof BasePlugin
     * @returns {Promise}
     */


    _createClass(BasePlugin, [{
      key: "preload",
      value: function () {
        var _preload = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(_ref) {
          var client;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  client = _ref.client;
                  this.client = client;

                case 2:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function preload(_x) {
          return _preload.apply(this, arguments);
        }

        return preload;
      }()
      /**
       *
       * @memberof BasePlugin
       */

    }, {
      key: "start",
      value: function start() {
        this.client.on('loaded', this.sendAllProperties);
        this.client.on('loadDone', this.sendAllProperties);
      }
      /**
       *
       * @param {Container} [_]
       * @memberof BasePlugin
       */

    }, {
      key: "init",
      value: function init(_) {}
      /**
       *
       *
       * @param {string} prop
       * @param {any} value
       * @memberof BasePlugin
       */

    }, {
      key: "sendProperty",
      value: function sendProperty(prop, value) {
        SavedData.write(prop, value);
        this.client.send(prop, value);
      }
      /**
       *
       * @param {Container} [_]
       * @memberof BasePlugin
       */

    }, {
      key: "sendAllProperties",
      value: function sendAllProperties(_) {}
      /**
       *
       * @param {string} warningText
       * @memberof BasePlugin
       */

    }, {
      key: "warn",
      value: function warn(warningText) {
        console.warn("[SpringrollContainer] ".concat(this.name, ": ").concat(warningText));
      }
    }]);

    return BasePlugin;
  }();

  /**
   *
   *
   * @export
   * @class ButtonPlugin
   * @extends {BasePlugin}
   */

  var ButtonPlugin =
  /*#__PURE__*/
  function (_BasePlugin) {
    _inherits(ButtonPlugin, _BasePlugin);

    /**
     *Creates an instance of ButtonPlugin.
     * @param {string} name
     *
     * @memberof ButtonPlugin
     */
    function ButtonPlugin(name) {
      var _this;

      _classCallCheck(this, ButtonPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ButtonPlugin).call(this, name));
      _this.sendMutes = false;
      return _this;
    }
    /**
     * @memberof ButtonPlugin
     * @param {Container} [container]
     */


    _createClass(ButtonPlugin, [{
      key: "init",
      value: function init(container) {
        // eslint-disable-line no-unused-vars
        this.sendMutes = true;
      }
      /**
       *
       * Applies the disabled class to the provided element
       * @param {HTMLButtonElement | Element} button
       * @memberof ButtonPlugin
       */

    }, {
      key: "_disableButton",
      value: function _disableButton(button) {
        if (button instanceof HTMLButtonElement) {
          button.classList.remove('enabled');
          button.classList.add('disabled');
        }
      }
      /**
       *
       *
       * @memberof ButtonPlugin
       */

    }, {
      key: "reset",
      value: function reset() {
        this.sendMutes = false;
      }
      /**
       *
       *
       * @param {string} prop
       * @param {Element} button
       * @param {Boolean} muted
       * @memberof ButtonPlugin
       */

    }, {
      key: "_setMuteProp",
      value: function _setMuteProp(prop, button, muted) {
        var _this2 = this;

        if (Array.isArray(button)) {
          button.forEach(function (b) {
            return _this2.changeMutedState(b, muted);
          });
        } else {
          this.changeMutedState(button, muted);
        }

        this.sendProperty(prop, muted);
      }
      /**
       *
       *
       * @param {Element} button
       * @param {Boolean} muted
       * @returns
       * @memberof ButtonPlugin
       */

    }, {
      key: "changeMutedState",
      value: function changeMutedState(button) {
        var muted = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        //most times button will be a Button class rather than an HTMLElement
        //But just in case the Button ui-element is not being used
        var htmlButton = button.button ? button.button : button;

        if (!(htmlButton instanceof HTMLElement)) {
          return;
        }

        htmlButton.classList.remove('unmuted');
        htmlButton.classList.remove('muted');
        htmlButton.classList.add(muted ? 'muted' : 'unmuted');
      }
    }]);

    return ButtonPlugin;
  }(BasePlugin);

  var notARegexp = function (it) {
    if (isRegexp(it)) {
      throw TypeError("The method doesn't accept regular expressions");
    }

    return it;
  };

  var MATCH$1 = wellKnownSymbol('match');

  var correctIsRegexpLogic = function (METHOD_NAME) {
    var regexp = /./;

    try {
      '/./'[METHOD_NAME](regexp);
    } catch (e) {
      try {
        regexp[MATCH$1] = false;
        return '/./'[METHOD_NAME](regexp);
      } catch (f) {
        /* empty */
      }
    }

    return false;
  };

  // https://tc39.github.io/ecma262/#sec-string.prototype.includes


  _export({
    target: 'String',
    proto: true,
    forced: !correctIsRegexpLogic('includes')
  }, {
    includes: function includes(searchString
    /* , position = 0 */
    ) {
      return !!~String(requireObjectCoercible(this)).indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var $map = arrayIteration.map;
  var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('map'); // FF49- issue

  var USES_TO_LENGTH$5 = arrayMethodUsesToLength('map'); // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  // with adding support of @@species

  _export({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$5
  }, {
    map: function map(callbackfn
    /* , thisArg */
    ) {
      return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var FAILS_ON_PRIMITIVES = fails(function () {
    objectKeys(1);
  }); // `Object.keys` method
  // https://tc39.github.io/ecma262/#sec-object.keys

  _export({
    target: 'Object',
    stat: true,
    forced: FAILS_ON_PRIMITIVES
  }, {
    keys: function keys(it) {
      return objectKeys(toObject(it));
    }
  });

  var propertyIsEnumerable = objectPropertyIsEnumerable.f; // `Object.{ entries, values }` methods implementation

  var createMethod$4 = function (TO_ENTRIES) {
    return function (it) {
      var O = toIndexedObject(it);
      var keys = objectKeys(O);
      var length = keys.length;
      var i = 0;
      var result = [];
      var key;

      while (length > i) {
        key = keys[i++];

        if (!descriptors || propertyIsEnumerable.call(O, key)) {
          result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
        }
      }

      return result;
    };
  };

  var objectToArray = {
    // `Object.entries` method
    // https://tc39.github.io/ecma262/#sec-object.entries
    entries: createMethod$4(true),
    // `Object.values` method
    // https://tc39.github.io/ecma262/#sec-object.values
    values: createMethod$4(false)
  };

  var $values = objectToArray.values; // `Object.values` method
  // https://tc39.github.io/ecma262/#sec-object.values

  _export({
    target: 'Object',
    stat: true
  }, {
    values: function values(O) {
      return $values(O);
    }
  });

  var freezing = !fails(function () {
    return Object.isExtensible(Object.preventExtensions({}));
  });

  var internalMetadata = createCommonjsModule(function (module) {
    var defineProperty = objectDefineProperty.f;
    var METADATA = uid('meta');
    var id = 0;

    var isExtensible = Object.isExtensible || function () {
      return true;
    };

    var setMetadata = function (it) {
      defineProperty(it, METADATA, {
        value: {
          objectID: 'O' + ++id,
          // object ID
          weakData: {} // weak collections IDs

        }
      });
    };

    var fastKey = function (it, create) {
      // return a primitive with prefix
      if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

      if (!has(it, METADATA)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return 'F'; // not necessary to add metadata

        if (!create) return 'E'; // add missing metadata

        setMetadata(it); // return object ID
      }

      return it[METADATA].objectID;
    };

    var getWeakData = function (it, create) {
      if (!has(it, METADATA)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return true; // not necessary to add metadata

        if (!create) return false; // add missing metadata

        setMetadata(it); // return the store of weak collections IDs
      }

      return it[METADATA].weakData;
    }; // add metadata on freeze-family methods calling


    var onFreeze = function (it) {
      if (freezing && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
      return it;
    };

    var meta = module.exports = {
      REQUIRED: false,
      fastKey: fastKey,
      getWeakData: getWeakData,
      onFreeze: onFreeze
    };
    hiddenKeys[METADATA] = true;
  });
  var internalMetadata_1 = internalMetadata.REQUIRED;
  var internalMetadata_2 = internalMetadata.fastKey;
  var internalMetadata_3 = internalMetadata.getWeakData;
  var internalMetadata_4 = internalMetadata.onFreeze;

  var inheritIfRequired = function ($this, dummy, Wrapper) {
    var NewTarget, NewTargetPrototype;
    if ( // it can work only with native `setPrototypeOf`
    objectSetPrototypeOf && // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    typeof (NewTarget = dummy.constructor) == 'function' && NewTarget !== Wrapper && isObject(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) objectSetPrototypeOf($this, NewTargetPrototype);
    return $this;
  };

  var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
    var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
    var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
    var ADDER = IS_MAP ? 'set' : 'add';
    var NativeConstructor = global_1[CONSTRUCTOR_NAME];
    var NativePrototype = NativeConstructor && NativeConstructor.prototype;
    var Constructor = NativeConstructor;
    var exported = {};

    var fixMethod = function (KEY) {
      var nativeMethod = NativePrototype[KEY];
      redefine(NativePrototype, KEY, KEY == 'add' ? function add(value) {
        nativeMethod.call(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        nativeMethod.call(this, key === 0 ? 0 : key, value);
        return this;
      });
    }; // eslint-disable-next-line max-len


    if (isForced_1(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
      new NativeConstructor().entries().next();
    })))) {
      // create collection constructor
      Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
      internalMetadata.REQUIRED = true;
    } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
      var instance = new Constructor(); // early implementations not supports chaining

      var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance; // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false

      var THROWS_ON_PRIMITIVES = fails(function () {
        instance.has(1);
      }); // most early implementations doesn't supports iterables, most modern - not close it correctly
      // eslint-disable-next-line no-new

      var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) {
        new NativeConstructor(iterable);
      }); // for early implementations -0 and +0 not the same

      var BUGGY_ZERO = !IS_WEAK && fails(function () {
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new NativeConstructor();
        var index = 5;

        while (index--) $instance[ADDER](index, index);

        return !$instance.has(-0);
      });

      if (!ACCEPT_ITERABLES) {
        Constructor = wrapper(function (dummy, iterable) {
          anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
          var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
          if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
          return that;
        });
        Constructor.prototype = NativePrototype;
        NativePrototype.constructor = Constructor;
      }

      if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
        fixMethod('delete');
        fixMethod('has');
        IS_MAP && fixMethod('get');
      }

      if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER); // weak collections should not contains .clear method

      if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
    }

    exported[CONSTRUCTOR_NAME] = Constructor;
    _export({
      global: true,
      forced: Constructor != NativeConstructor
    }, exported);
    setToStringTag(Constructor, CONSTRUCTOR_NAME);
    if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);
    return Constructor;
  };

  var defineProperty$5 = objectDefineProperty.f;
  var fastKey = internalMetadata.fastKey;
  var setInternalState$4 = internalState.set;
  var internalStateGetterFor = internalState.getterFor;
  var collectionStrong = {
    getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
      var C = wrapper(function (that, iterable) {
        anInstance(that, C, CONSTRUCTOR_NAME);
        setInternalState$4(that, {
          type: CONSTRUCTOR_NAME,
          index: objectCreate(null),
          first: undefined,
          last: undefined,
          size: 0
        });
        if (!descriptors) that.size = 0;
        if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
      });
      var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

      var define = function (that, key, value) {
        var state = getInternalState(that);
        var entry = getEntry(that, key);
        var previous, index; // change existing entry

        if (entry) {
          entry.value = value; // create new entry
        } else {
          state.last = entry = {
            index: index = fastKey(key, true),
            key: key,
            value: value,
            previous: previous = state.last,
            next: undefined,
            removed: false
          };
          if (!state.first) state.first = entry;
          if (previous) previous.next = entry;
          if (descriptors) state.size++;else that.size++; // add to index

          if (index !== 'F') state.index[index] = entry;
        }

        return that;
      };

      var getEntry = function (that, key) {
        var state = getInternalState(that); // fast case

        var index = fastKey(key);
        var entry;
        if (index !== 'F') return state.index[index]; // frozen object case

        for (entry = state.first; entry; entry = entry.next) {
          if (entry.key == key) return entry;
        }
      };

      redefineAll(C.prototype, {
        // 23.1.3.1 Map.prototype.clear()
        // 23.2.3.2 Set.prototype.clear()
        clear: function clear() {
          var that = this;
          var state = getInternalState(that);
          var data = state.index;
          var entry = state.first;

          while (entry) {
            entry.removed = true;
            if (entry.previous) entry.previous = entry.previous.next = undefined;
            delete data[entry.index];
            entry = entry.next;
          }

          state.first = state.last = undefined;
          if (descriptors) state.size = 0;else that.size = 0;
        },
        // 23.1.3.3 Map.prototype.delete(key)
        // 23.2.3.4 Set.prototype.delete(value)
        'delete': function (key) {
          var that = this;
          var state = getInternalState(that);
          var entry = getEntry(that, key);

          if (entry) {
            var next = entry.next;
            var prev = entry.previous;
            delete state.index[entry.index];
            entry.removed = true;
            if (prev) prev.next = next;
            if (next) next.previous = prev;
            if (state.first == entry) state.first = next;
            if (state.last == entry) state.last = prev;
            if (descriptors) state.size--;else that.size--;
          }

          return !!entry;
        },
        // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
        // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
        forEach: function forEach(callbackfn
        /* , that = undefined */
        ) {
          var state = getInternalState(this);
          var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
          var entry;

          while (entry = entry ? entry.next : state.first) {
            boundFunction(entry.value, entry.key, this); // revert to the last existing entry

            while (entry && entry.removed) entry = entry.previous;
          }
        },
        // 23.1.3.7 Map.prototype.has(key)
        // 23.2.3.7 Set.prototype.has(value)
        has: function has(key) {
          return !!getEntry(this, key);
        }
      });
      redefineAll(C.prototype, IS_MAP ? {
        // 23.1.3.6 Map.prototype.get(key)
        get: function get(key) {
          var entry = getEntry(this, key);
          return entry && entry.value;
        },
        // 23.1.3.9 Map.prototype.set(key, value)
        set: function set(key, value) {
          return define(this, key === 0 ? 0 : key, value);
        }
      } : {
        // 23.2.3.1 Set.prototype.add(value)
        add: function add(value) {
          return define(this, value = value === 0 ? 0 : value, value);
        }
      });
      if (descriptors) defineProperty$5(C.prototype, 'size', {
        get: function () {
          return getInternalState(this).size;
        }
      });
      return C;
    },
    setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
      var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
      var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
      var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME); // add .keys, .values, .entries, [@@iterator]
      // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11

      defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
        setInternalState$4(this, {
          type: ITERATOR_NAME,
          target: iterated,
          state: getInternalCollectionState(iterated),
          kind: kind,
          last: undefined
        });
      }, function () {
        var state = getInternalIteratorState(this);
        var kind = state.kind;
        var entry = state.last; // revert to the last existing entry

        while (entry && entry.removed) entry = entry.previous; // get next entry


        if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
          // or finish the iteration
          state.target = undefined;
          return {
            value: undefined,
            done: true
          };
        } // return step by kind


        if (kind == 'keys') return {
          value: entry.key,
          done: false
        };
        if (kind == 'values') return {
          value: entry.value,
          done: false
        };
        return {
          value: [entry.key, entry.value],
          done: false
        };
      }, IS_MAP ? 'entries' : 'values', !IS_MAP, true); // add [@@species], 23.1.2.2, 23.2.2.2

      setSpecies(CONSTRUCTOR_NAME);
    }
  };

  // https://tc39.github.io/ecma262/#sec-set-objects


  var es_set = collection('Set', function (init) {
    return function Set() {
      return init(this, arguments.length ? arguments[0] : undefined);
    };
  }, collectionStrong);

  /**
   * @export
   * @class RadioGroup
   */

  var RadioGroup =
  /*#__PURE__*/
  function (_BasePlugin) {
    _inherits(RadioGroup, _BasePlugin);

    /**
     * creates an instance of RadioGroup
     * @constructor
     * @param {string} selector selector string for the radio group
     * @param {string} controlName the name of the control (used for warning logging only)
     * @param {string} [featureName='captionStyles'] the feature name used by Springroll. Defaults to captionStyles
     * @param {string} defaultValue the value attribute of the radio button that should be selected by default
     * @param {string} pluginName name of the plugin that instantiated the RadioGroup. Used for logging warnings
     * @memberof RadioGroupPlugin
     */
    function RadioGroup(_ref) {
      var _this;

      var selector = _ref.selector,
          controlName = _ref.controlName,
          _ref$featureName = _ref.featureName,
          featureName = _ref$featureName === void 0 ? 'captionStyles' : _ref$featureName,
          defaultValue = _ref.defaultValue,
          pluginName = _ref.pluginName;

      _classCallCheck(this, RadioGroup);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RadioGroup).call(this, pluginName));
      _this.controlName = controlName;
      _this.featureName = featureName;
      _this.radioElements = document.querySelectorAll(selector);
      _this.defaultValue = defaultValue;
      _this.radioGroup = {};

      if (_this.radioElements.length <= 0) {
        _this.warn("".concat(_this.controlName, " RadioGroup found no HTMLElements with selector: ").concat(selector));

        return _possibleConstructorReturn(_this);
      }

      _this.radioElements.forEach(function (radio) {
        if (radio.type !== 'radio') {
          _this.warn("".concat(_this.controlName, " was provided a non Radio Button element with selector: ").concat(selector));

          return;
        }

        radio.value = radio.value.toLowerCase();
        _this.radioGroup[radio.value] = radio;
      });

      if (!_this.radioGroup[_this.defaultValue]) {
        _this.warn("".concat(_this.controlName, " RadioGroup for selector: ").concat(selector, " does not have a radio button with value ").concat(_this.defaultValue, " to use as default value. Using first element as default"));

        _this.defaultValue = _this.radioElements[0].value.toLowerCase();
      }

      _this.radioGroup[_this.defaultValue].checked = true;
      return _this;
    }
    /**
     * @param {string[]} valuesArray Array of acceptable values to check against the radio group.
     * @return {boolean}
     * @memberof RadioGroup
     */


    _createClass(RadioGroup, [{
      key: "hasOnly",
      value: function hasOnly(valuesArray) {
        for (var key in this.radioGroup) {
          if (!valuesArray.includes(this.radioGroup[key].value)) {
            this.warn("".concat(this.controlName, " radio button value: ").concat(this.radioGroup[key].value, " is not an accepted value. Skipping radio group"));
            return false;
          }
        }

        return true;
      }
      /**
       * @return {boolean}
       * @memberof RadioGroup
       */

    }, {
      key: "hasDuplicateValues",
      value: function hasDuplicateValues() {
        return this.values.length !== _toConsumableArray(new Set(this.values)).length;
      }
      /**
       * Adds change listeners to the radio buttons using the given callback function
       * @memberof RadioGroup
       * @param {Function} callBack event to fire on change
       */

    }, {
      key: "enableRadioEvents",
      value: function enableRadioEvents(callBack) {
        if (!this.radioGroup.length <= 0) {
          return;
        }

        var event = callBack;

        for (var radio in this.radioGroup) {
          this.radioGroup[radio].addEventListener('change', event);
        }
      }
      /**
       * removes the event listeners from the RadioGroup
       * @memberof RadioGroup
       * @param {Function} callBack event to fire on change
       */

    }, {
      key: "disableRadioEvents",
      value: function disableRadioEvents(callBack) {
        if (!this.radioGroup.length <= 0) {
          return;
        }

        for (var radio in this.radioGroup) {
          this.radioGroup[radio].removeEventListener('change', callBack);
        }
      }
      /**
       * enables display of the Radio buttons if the correct feature is present in the features list
       * @memberof RadioGroup
       * @param {object} data Object containing which features are enabled
       */

    }, {
      key: "displayRadios",
      value: function displayRadios(data) {
        if (this.radioGroup.length <= 0 && data[this.featureName]) {
          this.warn("".concat(this.controlName, " was not provided a valid input element or selector but '").concat(this.featureName, "' was included as a game feature"));
          return;
        }

        if (this.radioGroup.length <= 0) {
          return;
        }

        if (data[this.featureName]) {
          return;
        }

        for (var radio in this.radioGroup) {
          this.radioGroup[radio].style.display = 'none';
        }
      }
      /**
       * Reset the radio button states
       * @memberof RadioGroup
       */

    }, {
      key: "resetState",
      value: function resetState() {
        this.radioGroup[this.defaultValue].checked = true;
      }
      /**
       * @readonly
       * @returns {number}
       * @memberof RadioGroup
       */

    }, {
      key: "length",
      get: function get() {
        return Object.keys(this.radioGroup).length;
      }
      /**
       * @readonly
       * @returns {number}
       * @memberof RadioGroup
       */

    }, {
      key: "values",
      get: function get() {
        return Object.values(this.radioGroup).map(function (radio) {
          return radio.value;
        });
      }
    }]);

    return RadioGroup;
  }(BasePlugin);

  /**
   *
   *
   * @export
   * @class RadioGroupPlugin
   */

  var RadioGroupPlugin =
  /*#__PURE__*/
  function (_BasePlugin) {
    _inherits(RadioGroupPlugin, _BasePlugin);

    /**
     *
     *Creates an instance of RadioGroupPlugin.
     * @constructor
     * @memberof RadioGroupPlugin
     * @param {string} name
     */
    function RadioGroupPlugin(cssSelector, name, _ref) {
      var _this;

      var supportedValues = _ref.supportedValues,
          initialValue = _ref.initialValue,
          controlName = _ref.controlName,
          featureName = _ref.featureName,
          radioCount = _ref.radioCount;

      _classCallCheck(this, RadioGroupPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RadioGroupPlugin).call(this, name));
      _this.selectors = cssSelector ? cssSelector.split(',') : [];
      _this.supportedValues = supportedValues;
      _this.initialValue = supportedValues.includes(initialValue) ? initialValue : supportedValues[0];
      _this.controlName = controlName;
      _this.featureName = featureName;
      _this.radioCount = radioCount;
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      _this._currentValue = _this.initialValue;
      _this.radioGroups = _this.setUpRadios(_this.selectors);
      _this.radioGroupsLength = _this.radioGroups.length;
      return _this;
    }
    /**
     * @memberof RadioGroupPlugin
     * @param {string[]} selectors the separated selector strings used to target the radio button groups
     * @returns {RadioGroup[]}
     */


    _createClass(RadioGroupPlugin, [{
      key: "setUpRadios",
      value: function setUpRadios(selectors) {
        var _this2 = this;

        var radioGroups = [];
        selectors.forEach(function (selector) {
          var radioGroup = new RadioGroup({
            selector: selector.trim(),
            controlName: _this2.controlName,
            defaultValue: _this2.initialValue,
            pluginName: _this2.name,
            featureName: _this2.featureName
          });

          if (radioGroup.length !== _this2.radioCount) {
            _this2.warn("Selector \"".concat(selector, "\" did not find exactly ").concat(_this2.radioCount, " radio buttons for ").concat(_this2.controlName, ". Skipping selector"));

            return;
          }

          if (!radioGroup.hasOnly(_this2.supportedValues)) {
            return;
          }

          if (radioGroup.hasDuplicateValues()) {
            _this2.warn("Duplicate radio button values detected (values: ".concat(radioGroup.values, " ). Skipping radio group"));

            return;
          }

          radioGroups.push(radioGroup);
        });
        return radioGroups;
      }
      /**
       * @memberof RadioGroupPlugin
       */

    }, {
      key: "start",
      value: function start() {
        this.client.on('loaded', this.sendAllProperties);
        this.client.on('loadDone', this.sendAllProperties);
      }
      /**
      *
      * Sends initial caption properties to the application
      * @memberof RadioGroupPlugin
      */

    }, {
      key: "sendAllProperties",
      value: function sendAllProperties() {
        this.sendProperty(this.featureName, this.property);
      }
      /**
       * @memberof RadioGroupPlugin
       * @param {string} newValue
       */

    }, {
      key: "currentValue",
      set: function set(newValue) {
        if (!this.supportedValues.includes(newValue)) {
          return;
        }

        this._currentValue = newValue;

        for (var i = 0, l = this.radioGroups.length; i < l; i++) {
          this.radioGroups[i].radioGroup[newValue].checked = true;
        }
      }
      /**
       * @memberof RadioGroupPlugin
       * @return {string}
       */
      ,
      get: function get() {
        return this._currentValue;
      }
    }]);

    return RadioGroupPlugin;
  }(BasePlugin);

  var getOwnPropertyNames = objectGetOwnPropertyNames.f;
  var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
  var defineProperty$6 = objectDefineProperty.f;
  var trim = stringTrim.trim;
  var NUMBER = 'Number';
  var NativeNumber = global_1[NUMBER];
  var NumberPrototype = NativeNumber.prototype; // Opera ~12 has broken Object#toString

  var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER; // `ToNumber` abstract operation
  // https://tc39.github.io/ecma262/#sec-tonumber

  var toNumber = function (argument) {
    var it = toPrimitive(argument, false);
    var first, third, radix, maxCode, digits, length, index, code;

    if (typeof it == 'string' && it.length > 2) {
      it = trim(it);
      first = it.charCodeAt(0);

      if (first === 43 || first === 45) {
        third = it.charCodeAt(2);
        if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
      } else if (first === 48) {
        switch (it.charCodeAt(1)) {
          case 66:
          case 98:
            radix = 2;
            maxCode = 49;
            break;
          // fast equal of /^0b[01]+$/i

          case 79:
          case 111:
            radix = 8;
            maxCode = 55;
            break;
          // fast equal of /^0o[0-7]+$/i

          default:
            return +it;
        }

        digits = it.slice(2);
        length = digits.length;

        for (index = 0; index < length; index++) {
          code = digits.charCodeAt(index); // parseInt parses a string to a first unavailable symbol
          // but ToNumber should return NaN if a string contains unavailable symbols

          if (code < 48 || code > maxCode) return NaN;
        }

        return parseInt(digits, radix);
      }
    }

    return +it;
  }; // `Number` constructor
  // https://tc39.github.io/ecma262/#sec-number-constructor


  if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
    var NumberWrapper = function Number(value) {
      var it = arguments.length < 1 ? 0 : value;
      var dummy = this;
      return dummy instanceof NumberWrapper // check on 1..constructor(foo) case
      && (BROKEN_CLASSOF ? fails(function () {
        NumberPrototype.valueOf.call(dummy);
      }) : classofRaw(dummy) != NUMBER) ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
    };

    for (var keys$1 = descriptors ? getOwnPropertyNames(NativeNumber) : ( // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' + // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), j = 0, key; keys$1.length > j; j++) {
      if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
        defineProperty$6(NumberWrapper, key, getOwnPropertyDescriptor$3(NativeNumber, key));
      }
    }

    NumberWrapper.prototype = NumberPrototype;
    NumberPrototype.constructor = NumberWrapper;
    redefine(global_1, NUMBER, NumberWrapper);
  }

  /**
   * @export
   * @class Slider
   */

  var Slider =
  /*#__PURE__*/
  function () {
    /**
     *Creates an instance of Slider
     * @param {object} params
     * @param {string | HTMLInputElement} params.slider the slider element or a selector string
     * @param {string} params.control the feature that this slider controols
     * @param {number} [min=0] slider min value
     * @param {number} [max=1] slider max value
     * @param {number} [step=0.1] slider step value
     * @param {number} [defaultValue=1] slider starting value
     * @memberof SliderPlugin
     */
    function Slider(_ref) {
      var slider = _ref.slider,
          control = _ref.control,
          _ref$min = _ref.min,
          min = _ref$min === void 0 ? 0 : _ref$min,
          _ref$max = _ref.max,
          max = _ref$max === void 0 ? 1 : _ref$max,
          _ref$step = _ref.step,
          step = _ref$step === void 0 ? 0.1 : _ref$step,
          _ref$defaultValue = _ref.defaultValue,
          defaultValue = _ref$defaultValue === void 0 ? 1 : _ref$defaultValue;

      _classCallCheck(this, Slider);

      this.min = min;
      this.max = max;
      this.step = step;
      this.sliderValue = defaultValue;
      this.control = control;
      this.slider = this.setUpSlider(slider, control);
    }
    /**
     * @param {string | HTMLInputElement | HTMLElement} slider
     * @param {string} control The control element (sensitivity, difficulty, pointer size, etc) this slider will be controlling
     * @returns {Element | HTMLElement}
     * @memberof Slider
     */


    _createClass(Slider, [{
      key: "setUpSlider",
      value: function setUpSlider(slider, control) {
        if ('string' === typeof slider) {
          slider = document.querySelector(slider);
        }

        if (!slider || 'range' !== slider.type) {
          return null;
        }

        var value = SavedData.read(control);
        slider.min = this.min;
        slider.max = this.max;
        slider.step = this.step;

        if ((value || value === 0) && value.toString().trim().length > 0) {
          slider.value = value;
          this.sliderValue = value;
        } else {
          slider.value = this.sliderValue;
        }

        return slider;
      }
      /**
       * Controls the range of the slider
       * @param {number} i
       * @returns
       * @memberof Slider
       */

    }, {
      key: "sliderRange",
      value: function sliderRange(i) {
        if (i < this.min) {
          return this.min;
        } else if (i > this.max) {
          return this.max;
        } else {
          return i;
        }
      }
      /**
       * Adds change and input listeners to the slider using the given callback function
       * @memberof Slider
       * @param {Function} callBack event to fire on change or input
       */

    }, {
      key: "enableSliderEvents",
      value: function enableSliderEvents(callBack) {
        if (!this.slider) {
          return;
        }

        var event = callBack;
        this.slider.addEventListener('change', event);
        this.slider.addEventListener('input', event);
      }
      /**
       * removes the event listeners from the given slider.
       * @memberof Slider
       * @param {Function} callBack event to fire on change or input
       */

    }, {
      key: "disableSliderEvents",
      value: function disableSliderEvents(callBack) {
        if (!this.slider) {
          return;
        }

        var event = callBack;
        this.slider.removeEventListener('change', event);
        this.slider.removeEventListener('input', event);
      }
      /**
       * enables display of the Slider if it is present in the features list
       * @memberof Slider
       * @param {object} data Object containing which features are enabled
       */

    }, {
      key: "displaySlider",
      value: function displaySlider(data) {
        if (!this.slider && data[this.control]) {
          console.warn("".concat(this.control, " was not provided a valid input element or selector but was included as a game feature"));
        }

        if (!this.slider) {
          return;
        }

        this.slider.style.display = data[this.control] ? '' : 'none';
      }
      /**
       * @param {Event} event the event to be fired on the slider
       * @memberof Slider
       */

    }, {
      key: "dispatchEvent",
      value: function dispatchEvent(event) {
        this.slider.dispatchEvent(event);
      }
      /**
       * @readonly
       * @returns {string}
       * @memberof Slider
       */

    }, {
      key: "value",
      get: function get() {
        return this.slider.value;
      }
      /**
       * @memberof Slider
       */
      ,
      set: function set(value) {
        this.slider.value = value;
      }
    }]);

    return Slider;
  }();

  /**
   * @export
   * @class Button
   */
  var Button =
  /*#__PURE__*/
  function () {
    // TODO: Shouldn't there be a way in this method to add a class?

    /**
     *Creates an instance of Button
     * @param {object} params
     * @param {string | HTMLElement} params.button the button itself or a selector string
     * @param {Function} params.onClick the function to call when the button is clicked
     * @param {string} channel the feature this button controls
     * @memberof ButtonPlugin
     */
    function Button(_ref) {
      var button = _ref.button,
          onClick = _ref.onClick,
          channel = _ref.channel;

      _classCallCheck(this, Button);

      this.button = button instanceof HTMLElement ? button : document.querySelector(button);
      this.onClick = onClick;
      this.channel = channel;

      if (this.button) {
        this.button.addEventListener('click', onClick);
      }
    }
    /**
     * enables display of the button if it is present in the features list
     * @memberof Button
     * @param {object} data Object containing which features are enabled
     */


    _createClass(Button, [{
      key: "displayButton",
      value: function displayButton(data) {
        if (!(this.button instanceof HTMLElement)) {
          return;
        }

        this.button.style.display = data[this.channel] || this.channel === 'pause' || this.channel === 'hints' ? '' : 'none';
      }
      /**
       * enables display of the button
       * @memberof Button
       */

    }, {
      key: "enableButton",
      value: function enableButton() {
        if (!this.button) {
          return;
        }

        this.button.classList.remove('disabled');
      }
      /**
       * 
       * @param {string} className The classname to be appended to the end of the class property
       */

    }, {
      key: "addClass",
      value: function addClass(className) {
        this.button.className = this.button.className ? this.button.className + " ".concat(className) : " ".concat(className);
      }
    }]);

    return Button;
  }();

  /**
   *
   *
   * @export
   * @class SliderPlugin
   */

  var SliderPlugin =
  /*#__PURE__*/
  function (_BasePlugin) {
    _inherits(SliderPlugin, _BasePlugin);

    /**
     *
     *Creates an instance of SliderPlugin.
     * @constructor
     * @memberof SliderPlugin
     * @param {string} cssSelector
     * @param {string} name
     * @param {object} options
     * @param {string | number} [options.defaultValue='0.5']
     * @param {string | number} [options.minValue='0']
     * @param {string | number} [options.maxValue='1']
     * @param {string} [options.featureName] Springroll Core feature name that the plugin is supporting
     */
    function SliderPlugin(cssSelector, name, _ref) {
      var _this;

      var _ref$defaultValue = _ref.defaultValue,
          defaultValue = _ref$defaultValue === void 0 ? '0.5' : _ref$defaultValue,
          _ref$minValue = _ref.minValue,
          minValue = _ref$minValue === void 0 ? '0' : _ref$minValue,
          _ref$maxValue = _ref.maxValue,
          maxValue = _ref$maxValue === void 0 ? '1' : _ref$maxValue,
          featureName = _ref.featureName;

      _classCallCheck(this, SliderPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(SliderPlugin).call(this, name));
      _this.featureName = featureName;
      _this.minValue = minValue;
      _this.defaultValue = defaultValue;
      _this.maxValue = maxValue;
      _this._currentValue = defaultValue;
      _this.sliders = _this.setUpSliders(cssSelector);
      _this.slidersLength = _this.sliders.length;
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));

      if (0 >= _this.slidersLength) {
        _this.warn('Plugin was not provided any valid HTML Elements');

        return _possibleConstructorReturn(_this);
      }

      return _this;
    }
    /**
     * @memberof SliderPlugin
     * @param {string[]} selectors the selector strings used to target the input elements
     * @returns {Slider[]}
     */


    _createClass(SliderPlugin, [{
      key: "setUpSliders",
      value: function setUpSliders(selectors) {
        var _this2 = this;

        var sliders = [];

        if (selectors instanceof HTMLElement) {
          sliders.push(new Slider({
            slider: selectors,
            control: this.featureName,
            defaultValue: this.defaultValue,
            minValue: this.minValue,
            maxValue: this.maxValue
          }));
        } else {
          document.querySelectorAll(selectors).forEach(function (slider) {
            sliders.push(new Slider({
              slider: slider,
              control: _this2.featureName,
              defaultValue: _this2.defaultValue,
              minValue: _this2.minValue,
              maxValue: _this2.maxValue
            }));
          });
        }

        return sliders;
      }
      /**
       * @memberof SliderPlugin
       */

    }, {
      key: "init",
      value: function init() {
        this.client.on('features', function (features) {
          if (!features.data) {
            return;
          }

          for (var i = 0; i < this.slidersLength; i++) {
            this.sliders[i].displaySlider(features.data);
          }
        }.bind(this));
      }
      /**
       * @memberof SliderPlugin
       */

    }, {
      key: "start",
      value: function start() {
        this._currentValue = this.sliders[0].value; //update current value to the saved data value set in Slider.

        this.client.on('loaded', this.sendAllProperties);
        this.client.on('loadDone', this.sendAllProperties);
      }
      /**
      *
      * Sends initial caption properties to the application
      * @memberof SliderPlugin
      */

    }, {
      key: "sendAllProperties",
      value: function sendAllProperties() {
        this.sendProperty(this.featureName, this.currentValue);
      }
      /**
       * @memberof SliderPlugin
       * @param {string} newValue
       */

    }, {
      key: "currentValue",
      set: function set(newValue) {
        //just use first slider to ensure the number is valid.
        this._currentValue = this.sliders[0].sliderRange(Number(newValue));

        for (var i = 0; i < this.slidersLength; i++) {
          this.sliders[i].value = newValue;
        }
      }
      /**
       * @memberof SliderPlugin
       * @return {string}
       */
      ,
      get: function get() {
        return this._currentValue;
      }
    }]);

    return SliderPlugin;
  }(BasePlugin);

  var CAPTIONS_STYLES = 'captionsStyles';
  var DEFAULT_CAPTIONS_STYLES = {
    size: 'medium',
    background: 'black',
    color: 'white',
    edge: 'none',
    font: 'arial',
    align: 'top'
  };
  var DEFAULT_COLOR_STYLE = {
    color: 'white',
    background: 'black'
  };
  var INVERTED_COLOR_STYLE = {
    color: 'black',
    background: 'white'
  };
  var FONT_SIZE_VALUES = ['small', 'medium', 'large'];
  var COLOR_VALUES = ['default', 'inverted'];
  var ALIGN_VALUES = ['top', 'bottom'];
  /**
   * @export
   * @class CaptionsStylePlugin
   * @property {object} captionsStyles The collection of captions styles
   * @property {string[]} fontSizeSelectors selector strings for the radio button groups
   * @property {string[]} colorSelectors selector strings for the radio button groups
   * @property {string[]} alignmentSelectors selector strings for the radio button groups
   * @property {Object[]} fontSizeRadios array that contains each radio group
   * @property {Object[]} colorRadios array that contains each radio group
   * @property {Object[]} alignmentRadios array that contains each radio group
   * @property {number} fontSizeRadiosLength
   * @property {number} colorRadiosLength
   * @property {number} alignmentRadiosLength
   * @extends {ButtonPlugin}
   */

  var CaptionsStylePlugin =
  /*#__PURE__*/
  function (_ButtonPlugin) {
    _inherits(CaptionsStylePlugin, _ButtonPlugin);

    /**
     *Creates an instance of CaptionsStylePlugin.
     * @param {string } fontSizeRadios selector string for one or more radio groups for caption font size
     * @param {string } colorRadios selector string for one or more radio groups for caption font/background colors
     * @param {string } alignmentRadios selector string for one or more radio groups for caption position
     * @memberof CaptionsStylePlugin
     */
    function CaptionsStylePlugin(fontSizeRadios, colorRadios, alignmentRadios) {
      var _this;

      var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
          _ref$defaultFontSize = _ref.defaultFontSize,
          defaultFontSize = _ref$defaultFontSize === void 0 ? 'medium' : _ref$defaultFontSize,
          _ref$defaultColor = _ref.defaultColor,
          defaultColor = _ref$defaultColor === void 0 ? 'default' : _ref$defaultColor,
          _ref$defaultAlignment = _ref.defaultAlignment,
          defaultAlignment = _ref$defaultAlignment === void 0 ? 'top' : _ref$defaultAlignment;

      _classCallCheck(this, CaptionsStylePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CaptionsStylePlugin).call(this, 'Caption-Button-Plugin'));
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      _this.captionsStyles = Object.assign({}, DEFAULT_CAPTIONS_STYLES, SavedData.read(CAPTIONS_STYLES) || {}); //split the selector strings into individual selectors.
      //Helps keep the input style consistent across plugins.

      _this.fontSizeSelectors = fontSizeRadios ? fontSizeRadios.split(',') : [];
      _this.colorSelectors = colorRadios ? colorRadios.split(',') : [];
      _this.alignmentSelectors = alignmentRadios ? alignmentRadios.split(',') : [];
      _this.defaultFontSize = FONT_SIZE_VALUES.includes(defaultFontSize) ? defaultFontSize : FONT_SIZE_VALUES[0];
      _this.defaultColor = COLOR_VALUES.includes(defaultColor) ? defaultColor : COLOR_VALUES[0];
      _this.defaultAlignment = ALIGN_VALUES.includes(defaultAlignment) ? defaultAlignment : ALIGN_VALUES[0];
      _this.fontSizeRadios = [];
      _this.colorRadios = [];
      _this.alignmentRadios = [];
      _this.fontSizeRadios = _this.setUpFontSizeRadios(_this.fontSizeSelectors);
      _this.colorRadios = _this.setUpColorRadios(_this.colorSelectors);
      _this.alignmentRadios = _this.setUpAlignmentRadios(_this.alignmentSelectors);
      _this._captionsMuted = false;
      _this.alignmentRadiosLength = _this.alignmentRadios.length;
      _this.fontSizeRadiosLength = _this.fontSizeRadios.length;
      _this.colorRadiosLength = _this.colorRadios.length;

      if (0 >= _this.alignmentRadiosLength + _this.fontSizeRadiosLength + _this.colorRadiosLength) {
        _this.warn('Plugin was not provided any input elements');

        return _possibleConstructorReturn(_this);
      } //set up change events


      for (var i = 0; i < _this.colorRadiosLength; i++) {
        _this.colorRadios[i].enableRadioEvents(_this.onColorChange.bind(_assertThisInitialized(_this)));
      }

      for (var _i = 0; _i < _this.alignmentRadiosLength; _i++) {
        _this.alignmentRadios[_i].enableRadioEvents(_this.onAlignmentChange.bind(_assertThisInitialized(_this)));
      }

      for (var _i2 = 0; _i2 < _this.fontSizeRadiosLength; _i2++) {
        _this.fontSizeRadios[_i2].enableRadioEvents(_this.onFontSizeChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof CaptionsStylePlugin
     * @param {string[]} selectors the separated selector strings used to target the radio button groups
     * @returns {RadioGroup[]}
     */


    _createClass(CaptionsStylePlugin, [{
      key: "setUpFontSizeRadios",
      value: function setUpFontSizeRadios(selectors) {
        var _this2 = this;

        var radioGroups = [];
        selectors.forEach(function (selector) {
          var radioGroup = new RadioGroup({
            selector: selector.trim(),
            controlName: 'Font Size',
            defaultValue: _this2.defaultFontSize,
            pluginName: 'Caption-Button-Plugin'
          });

          if (radioGroup.length !== 3) {
            _this2.warn("Selector \"".concat(selector, "\" did not find exactly three(3) radio buttons for caption font size. Skipping selector"));

            return;
          }

          if (!radioGroup.hasOnly(FONT_SIZE_VALUES)) {
            return;
          }

          if (radioGroup.hasDuplicateValues()) {
            _this2.warn("Duplicate radio button values detected (values: ".concat(radioGroup.values, " ). Skipping radio group"));

            return;
          }

          radioGroups.push(radioGroup);
        });
        return radioGroups;
      }
      /**
       * @memberof CaptionsStylePlugin
       * @param {string[]} selectors the separated selector strings used to target the radio button groups
       * @returns {RadioGroup[]}
       */

    }, {
      key: "setUpColorRadios",
      value: function setUpColorRadios(selectors) {
        var _this3 = this;

        var radioGroups = [];
        selectors.forEach(function (selector) {
          var radioGroup = new RadioGroup({
            selector: selector.trim(),
            controlName: 'Color',
            defaultValue: _this3.defaultColor,
            pluginName: 'Caption-Button-Plugin'
          });

          if (radioGroup.length !== 2) {
            _this3.warn("Selector \"".concat(selector, "\" did not find exactly two(2) radio buttons for caption colors. Skipping selector"));

            return;
          }

          if (!radioGroup.hasOnly(COLOR_VALUES)) {
            return;
          }

          if (radioGroup.hasDuplicateValues()) {
            _this3.warn("Duplicate radio button values detected (values: ".concat(radioGroup.values, " ). Skipping radio group"));

            return;
          }

          radioGroups.push(radioGroup);
        });
        return radioGroups;
      }
      /**
       * @memberof CaptionsStylePlugin
       * @param {string[]} selectors the separated selector strings used to target the radio button groups
       * @returns {RadioGroup[]}
       */

    }, {
      key: "setUpAlignmentRadios",
      value: function setUpAlignmentRadios(selectors) {
        var _this4 = this;

        var radioGroups = [];
        selectors.forEach(function (selector) {
          var radioGroup = new RadioGroup({
            selector: selector.trim(),
            controlName: 'Alignment',
            defaultValue: _this4.defaultAlignment,
            pluginName: 'Caption-Button-Plugin'
          });

          if (radioGroup.length !== 2) {
            _this4.warn("Selector \"".concat(selector, "\" did not find exactly two(2) radio buttons for caption alignment. Skipping selector"));

            return;
          }

          if (!radioGroup.hasOnly(ALIGN_VALUES)) {
            return;
          }

          if (radioGroup.hasDuplicateValues()) {
            _this4.warn("Duplicate radio button values detected (values: ".concat(radioGroup.values, " ). Skipping radio group"));

            return;
          }

          radioGroups.push(radioGroup);
        });
        return radioGroups;
      }
      /**
       * @memberof CaptionsStylePlugin
       */

    }, {
      key: "init",
      value: function init() {
        // Handle the features request
        this.client.on('features', function ($event) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.radios[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var radio = _step.value;
              radio.displayRadios($event.data);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }.bind(this));
        this.client.on('caption-set-style', function ($event) {
          this.setCaptionsStyles($event.data || {});
        }.bind(this));
      }
      /**
      * @memberof CaptionsStylePlugin
      */

    }, {
      key: "start",
      value: function start() {
        this.setCaptionsStyles(SavedData.read(CAPTIONS_STYLES));
        this.client.on('loaded', this.sendAllProperties);
        this.client.on('loadDone', this.sendAllProperties);
      }
      /**
      *
      * Sends initial caption properties to the application
      * @memberof CaptionsStylePlugin
      */

    }, {
      key: "sendAllProperties",
      value: function sendAllProperties() {
        this.sendProperty(CAPTIONS_STYLES, this.captionsStyles);
      }
      /**
       * Fired whenever the font size radios are updated
       * @param {Event} e
       * @memberof CaptionsStylePlugin
       */

    }, {
      key: "onFontSizeChange",
      value: function onFontSizeChange(e) {
        this.setCaptionsStyles('size', e.target.value);
        this.fontSizeRadios.forEach(function (group) {
          group.radioGroup[e.target.value].checked = true;
        });
      }
      /**
       * Fired whenever the alignment radios are updated
       * @param {Event} e
       * @memberof CaptionsStylePlugin
       */

    }, {
      key: "onAlignmentChange",
      value: function onAlignmentChange(e) {
        this.setCaptionsStyles('align', e.target.value);
        this.alignmentRadios.forEach(function (group) {
          group.radioGroup[e.target.value].checked = true;
        });
      }
      /**
       * Fired whenever the color radios are updated
       * @param {Event} e
       * @memberof CaptionsStylePlugin
       */

    }, {
      key: "onColorChange",
      value: function onColorChange(e) {
        var styles = e.target.value === 'default' ? DEFAULT_COLOR_STYLE : INVERTED_COLOR_STYLE;
        this.setCaptionsStyles(styles);
        this.colorRadios.forEach(function (group) {
          group.radioGroup[e.target.value].checked = true;
        });
      }
      /**
       * Reset the captions styles
       * @param {Event} e
       * @memberof CaptionsStylePlugin
       */

    }, {
      key: "clearCaptionsStyles",
      value: function clearCaptionsStyles() {
        this.captionsStyles = Object.assign({}, DEFAULT_CAPTIONS_STYLES);
        this.setCaptionsStyles();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.radios[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var radio = _step2.value;
            radio.resetState();
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
      /**
       * Get the captions styles
       * @param {string} [prop] The optional property, values are "size", "edge", "font", "background", "color"
       * @return {object | string} The collection of styles, see setCaptionsStyles for more info.
       * @memberof CaptionsStylePlugin
       */

    }, {
      key: "getCaptionsStyles",
      value: function getCaptionsStyles(prop) {
        return prop ? this.captionsStyles[prop] : this.captionsStyles;
      }
      /**
       * Set the captions styles
       *
       * @param {object} [styles] The style options or the name of the
       * property (e.g., "color", "edge", "font", "background", "size")
       * @param {string} [styles.color='white'] The text color, the default is white
       * @param {string} [styles.edge='none'] The edge style, default is none
       * @param {string} [styles.font='arial'] The font style, default is arial
       * @param {string} [styles.background='black'] The background style, black
       * @param {string} [styles.size='md'] The font style default is medium
       * @param {string} [styles.align='top'] The align style default is top of the window
       * @param {string} [value=''] If setting styles parameter as a string, this is the value of the property.
       * @memberof CaptionsStylePlugin
       */

    }, {
      key: "setCaptionsStyles",
      value: function setCaptionsStyles() {
        var styles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_CAPTIONS_STYLES;
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        if (_typeof(styles) === 'object') {
          Object.assign(this.captionsStyles, styles);
        } else if (typeof styles === 'string') {
          this.captionsStyles[styles] = value;
        }

        SavedData.write(CAPTIONS_STYLES, this.captionsStyles);

        if (this.client) {
          this.client.send(CAPTIONS_STYLES, this.captionsStyles);
        }
      }
      /**
       * @readonly
       * @returns {number}
       * @memberof RadioGroup
       */

    }, {
      key: "radios",
      get: function get() {
        return this.colorRadios.concat(this.alignmentRadios).concat(this.fontSizeRadios);
      }
    }]);

    return CaptionsStylePlugin;
  }(ButtonPlugin);

  var CAPTIONS_MUTED = 'captionsMuted';
  /**
   * @export
   * @class CaptionsTogglePlugin
   * @property {Button[]} _captionsButtons array of caption mute buttons
   * @property {number} captionsButtonsLength
   * @extends {ButtonPlugin}
   */

  var CaptionsTogglePlugin =
  /*#__PURE__*/
  function (_ButtonPlugin) {
    _inherits(CaptionsTogglePlugin, _ButtonPlugin);

    /**
     *Creates an instance of CaptionsTogglePlugin.
     * @param {string | HTMLElement} captionsButtons selector string for one or more captions mute buttons
     * @memberof CaptionsTogglePlugin
     */
    function CaptionsTogglePlugin(captionsButtons) {
      var _this;

      _classCallCheck(this, CaptionsTogglePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CaptionsTogglePlugin).call(this, 'Caption-Button-Plugin'));
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      _this._captionsButtons = [];

      if (captionsButtons instanceof HTMLElement) {
        _this._captionsButtons[0] = new Button({
          button: captionsButtons,
          onClick: _this.captionsButtonClick.bind(_assertThisInitialized(_this)),
          channel: 'captions'
        });
      } else {
        document.querySelectorAll(captionsButtons).forEach(function (button) {
          _this._captionsButtons.push(new Button({
            button: button,
            onClick: _this.captionsButtonClick.bind(_assertThisInitialized(_this)),
            channel: 'captions'
          }));
        });
      }

      _this._captionsMuted = false;
      _this.captionsButtonLength = _this._captionsButtons.length;

      if (0 >= _this.captionsButtonLength) {
        _this.warn('Plugin was not provided any valid button or input elements');

        return _possibleConstructorReturn(_this);
      }

      return _this;
    }
    /**
     * @memberof CaptionsTogglePlugin
     */


    _createClass(CaptionsTogglePlugin, [{
      key: "init",
      value: function init() {
        // Handle the features request
        this.client.on('features', function ($event) {
          for (var i = 0; i < this.captionsButtonLength; i++) {
            this._captionsButtons[i].displayButton($event.data);
          }

          if (null === SavedData.read(CAPTIONS_MUTED)) {
            return;
          }

          this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
        }.bind(this));
      }
      /**
      * @memberof CaptionsTogglePlugin
      */

    }, {
      key: "start",
      value: function start() {
        this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
        this.client.on('loaded', this.sendAllProperties);
        this.client.on('loadDone', this.sendAllProperties);
      }
      /**
      *
      * Sends initial caption properties to the application
      * @memberof CaptionsTogglePlugin
      */

    }, {
      key: "sendAllProperties",
      value: function sendAllProperties() {
        this.sendProperty(CAPTIONS_MUTED, this.captionsMuted);
      }
      /**
       * @memberof CaptionsTogglePlugin
       */

    }, {
      key: "captionsButtonClick",
      value: function captionsButtonClick() {
        this.captionsMuted = !this.captionsMuted;
      }
      /**
       * @readonly
       * @memberof CaptionsTogglePlugin
       */

    }, {
      key: "captionsMuted",
      get: function get() {
        return this._captionsMuted;
      }
      /**
       * @param {boolean} muted
       * @memberof CaptionsTogglePlugin
       */
      ,
      set: function set(muted) {
        this._captionsMuted = muted;

        this._setMuteProp('captionsMuted', this._captionsButtons, this._captionsMuted);
      }
    }]);

    return CaptionsTogglePlugin;
  }(ButtonPlugin);

  /**
   *
   *
   * @export
   * @class HelpPlugin
   * @extends {ButtonPlugin}
   */

  var HelpPlugin =
  /*#__PURE__*/
  function (_ButtonPlugin) {
    _inherits(HelpPlugin, _ButtonPlugin);

    /**
     *Creates an instance of HelpPlugin.
     * @param {string} helpButtons
     * @memberof HelpPlugin
     */
    function HelpPlugin(helpButtons) {
      var _this;

      _classCallCheck(this, HelpPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HelpPlugin).call(this, 'Help-Button-Plugin'));
      _this._helpButtons = [];

      if (helpButtons instanceof HTMLElement) {
        _this._helpButtons[0] = new Button({
          button: helpButtons,
          onClick: _this.helpButtonClick.bind(_assertThisInitialized(_this)),
          channel: 'hints' // the check to see if this feature exists is different than most so passing this ensures it'll work the same.

        });
      } else {
        document.querySelectorAll(helpButtons).forEach(function (button) {
          _this._helpButtons.push(new Button({
            button: button,
            onClick: _this.helpButtonClick.bind(_assertThisInitialized(_this)),
            channel: 'hints'
          }));
        });
      }

      _this.paused = false;
      _this._helpEnabled = false;
      _this.onPause = _this.onPause.bind(_assertThisInitialized(_this));
      _this.helpButtonsLength = _this._helpButtons.length;

      if (_this.helpButtonsLength <= 0) {
        _this.warn('Plugin was not provided any valid button elements');
      }

      return _this;
    }
    /**
     *  Called when the game is either paused or resumed
     * @param {object} $event
     * @memberof HelpPlugin
     */


    _createClass(HelpPlugin, [{
      key: "onPause",
      value: function onPause($event) {
        this.paused = $event.data.paused; // Disable the help button when paused if it's active

        if (this.paused && this.helpEnabled) {
          for (var i = 0; i < this.helpButtonsLength; i++) {
            this._helpButtons[i].button.setAttribute('data-paused', 'true');
          }

          this.helpEnabled = false;
        } else {
          for (var _i = 0; _i < this.helpButtonsLength; _i++) {
            if (this._helpButtons[_i].button.getAttribute('data-paused')) {
              this._helpButtons[_i].button.setAttribute('data-paused', '');

              this.helpEnabled = true;
            }
          }
        }
      }
      /**
       *
       *
       * @memberof HelpPlugin
       */

    }, {
      key: "helpButtonClick",
      value: function helpButtonClick() {
        if (!this.paused && this.helpEnabled) {
          this.client.send('playHelp');
        }
      }
      /**
       * @memberof HelpPlugin
       */

    }, {
      key: "init",
      value: function init() {
        // Handle pause
        this.client.on('paused', this.onPause); // Handle features changed

        this.client.on('features', function (features) {
          this.helpEnabled = features.data.hints;

          for (var i = 0; i < this.helpButtonsLength; i++) {
            this._helpButtons[i].displayButton(features.data);
          }
        }.bind(this));
        this.client.on('helpEnabled', function (event) {
          this._helpEnabled = !!event.data;
        }.bind(this));
      }
      /**
       * @memberof HelpPlugin
       */

    }, {
      key: "helpEnabled",
      get: function get() {
        return this._helpEnabled;
      }
      /**
       * Fired when the enabled status of the help button changes
       * @function helpEnabled
       * @param {boolean} enabled If the help button is enabled
       * @memberof HelpPlugin
       */
      ,
      set: function set(enabled) {
        this._helpEnabled = enabled;

        for (var i = 0; i < this.helpButtonsLength; i++) {
          this._helpButtons[i].button.classList.remove('disabled');

          this._helpButtons[i].button.classList.remove('enabled');

          this._helpButtons[i].button.classList.add(enabled ? 'enabled' : 'disabled');
        }

        this.client.trigger('helpEnabled');
      }
    }]);

    return HelpPlugin;
  }(ButtonPlugin);

  /**
   * @class Container
   */

  var PausePlugin =
  /*#__PURE__*/
  function (_ButtonPlugin) {
    _inherits(PausePlugin, _ButtonPlugin);

    /**
     *Creates an instance of PausePlugin.
     * @param {string} pauseButton
     * @memberof PausePlugin
     */
    function PausePlugin(pauseButton) {
      var _this;

      _classCallCheck(this, PausePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(PausePlugin).call(this, 'Pause-Button-plugin'));
      _this._appBlurred = false;
      _this._containerBlurred = false;
      _this._focusTimer = null;
      _this._isManualPause = false;
      _this._keepFocus = false;
      _this._paused = false;
      _this.iframe = null;
      _this.focusApp = _this.focusApp.bind(_assertThisInitialized(_this));
      _this.manageFocus = _this.manageFocus.bind(_assertThisInitialized(_this));
      _this.onKeepFocus = _this.onKeepFocus.bind(_assertThisInitialized(_this));
      _this.onFocus = _this.onFocus.bind(_assertThisInitialized(_this));

      var onPauseToggle = _this.onPauseToggle.bind(_assertThisInitialized(_this));

      _this.pauseDisabled = false;
      _this._pauseButton = [];
      _this.pageVisibility = new PageVisibility(_this.onContainerFocus.bind(_assertThisInitialized(_this)), _this.onContainerBlur.bind(_assertThisInitialized(_this))); //Set up the pause buttons

      _this.pauseButtons = document.querySelectorAll(pauseButton);

      if (0 < _this.pauseButtons.length) {
        for (var i = 0, l = _this.pauseButtons.length; i < l; i++) {
          _this._pauseButton.push(new Button({
            button: _this.pauseButtons[i],
            onClick: onPauseToggle,
            channel: 'pause'
          }));
        }
      }

      return _this;
    }
    /**
     * updates _paused and also sends the pause event to the application
     * @memberof PausePlugin
     * @param {Boolean} paused
     */


    _createClass(PausePlugin, [{
      key: "focusApp",

      /**
       * forces focus onto the iframe application window
       * @memberof PausePlugin
       */
      value: function focusApp() {
        if (!this.hasDom) {
          return;
        }

        this._containerBlurred = true;
        this.iframe.contentWindow.focus();
      }
      /**
       * blurs the application iframe window
       * @memberof PausePlugin
       */

    }, {
      key: "blurApp",
      value: function blurApp() {
        if (!this.hasDom) {
          return;
        }

        this.iframe.contentWindow.blur();
      }
      /**
       * Determines what pause state should be sent, if any, on focus or blur events.
       * @method manageFocus
       * @memberof PausePlugin
       */

    }, {
      key: "manageFocus",
      value: function manageFocus() {
        // Unfocus on the iframe
        if (this._keepFocus) {
          this.blurApp();
        } // we only need one delayed call, at the end of any
        // sequence of rapidly-fired blur/focus events


        if (this._focusTimer) {
          clearTimeout(this._focusTimer);
        } // Delay setting of 'paused' in case we get another focus event soon.
        // Focus events are sent to the container asynchronously, and this was
        // causing rapid toggling of the pause state and related issues,
        // especially in Internet Explorer


        this._focusTimer = setTimeout(function () {
          this._focusTimer = null; // A manual pause cannot be overriden by focus events.
          // User must click the resume button.

          if (this._isManualPause) {
            return;
          }

          this.pause = Boolean(this._containerBlurred && this._appBlurred); // Focus on the content window when blurring the app
          // but selecting the container

          if (this._keepFocus && !this._containerBlurred && this._appBlurred) {
            this.focusApp();
          }
        }.bind(this), 100);
      }
      /**
       * Handle the keep focus event for the window
       * @method onKeepFocus
       * @memberof PausePlugin
       * @private
       */

    }, {
      key: "onKeepFocus",
      value: function onKeepFocus($event) {
        this._keepFocus = !!$event.data;
        this.manageFocus();
      }
      /**
       * Handle focus events sent from iFrame children
       * @method onFocus
       * @memberof PausePlugin
       * @private
       */

    }, {
      key: "onFocus",
      value: function onFocus($event) {
        this._appBlurred = !$event.data;
        this.manageFocus();
      }
      /**
       * Handle focus events sent from container's window
       * @method onContainerFocus
       * @memberof PausePlugin
       * @private
       */

    }, {
      key: "onContainerFocus",
      value: function onContainerFocus() {
        this._containerBlurred = false;
        this.focusApp();
        this.manageFocus();
      }
      /**
       * Handle blur events sent from container's window
       * @method onContainerBlur
       * @memberof PausePlugin
       * @private
       */

    }, {
      key: "onContainerBlur",
      value: function onContainerBlur() {
        //Set both container and application to blurred,
        //because some blur events are only happening on the container.
        //If container is blurred because application area was just focused,
        //the application's focus event will override the blur imminently.
        this._containerBlurred = this._appBlurred = true;
        this.manageFocus();
      }
      /**
       * @memberof PausePlugin
       */

    }, {
      key: "onPauseToggle",
      value: function onPauseToggle() {
        this._isManualPause = !this._isManualPause;
        this.pause = !this.pause;
      }
      /**
       * @param {Container} container
       * @memberof PausePlugin
       */

    }, {
      key: "init",
      value: function init(_ref) {
        var iframe = _ref.iframe;
        this.iframe = iframe;
        this.client.on('features', function (features) {
          if (features.disablePause) {
            this.pauseDisabled = true;
          }

          for (var i = 0, l = this._pauseButton.length; i < l; i++) {
            this._pauseButton[i].displayButton(features.data);
          }
        }.bind(this));
        this.client.on('focus', this.onFocus);
        this.client.on('keepFocus', this.onKeepFocus);
        this.pause = this.pause; //ensure app has focus after setting up plugin

        this.focusApp();
      }
      /**
       * Function to check if we have a dom with a contentWindow
       * @readonly
       * @returns {boolean}
       * @memberof PausePlugin
       */

    }, {
      key: "pause",
      set: function set(paused) {
        paused = !!paused;

        if (this.pauseDisabled) {
          return;
        }

        this._paused = paused;
        this.client.send('pause', paused);
        this.client.trigger(paused ? 'paused' : 'resumed', {
          paused: paused
        });

        for (var i = 0, l = this._pauseButton.length; i < l; i++) {
          this._pauseButton[i].button.classList.remove('unpaused');

          this._pauseButton[i].button.classList.remove('paused');

          this._pauseButton[i].button.classList.add(paused ? 'paused' : 'unpaused');
        }
      }
      /**
       * @memberof PausePlugin
       * @returns {Boolean}
       */
      ,
      get: function get() {
        return this._paused;
      }
    }, {
      key: "hasDom",
      get: function get() {
        return Boolean(null !== this.iframe && this.iframe.contentWindow);
      }
      /**
       * @readonly
       * @memberof PausePlugin
       * @returns {HTMLButtonElement[]}
       */

    }, {
      key: "pauseButton",
      get: function get() {
        var buttons = [];

        for (var i = 0, l = this._pauseButton.length; i < l; i++) {
          buttons.push(this._pauseButton[i].button);
        }

        return buttons;
      }
    }]);

    return PausePlugin;
  }(ButtonPlugin);

  /**
   * @export
   * @class SoundPlugin
   * @extends {ButtonPlugin}
   *
   */

  var SoundPlugin =
  /*#__PURE__*/
  function (_ButtonPlugin) {
    _inherits(SoundPlugin, _ButtonPlugin);

    /**
     *Creates an instance of SoundPlugin.
     * @param {object} params
     * @param {string | HTMLElement} [params.soundButtons]
     * @param {string | HTMLElement} [params.musicButtons]
     * @param {string | HTMLElement} [params.voButtons]
     * @param {string | HTMLElement} [params.sfxButtons]
     * @param {string | HTMLElement} [params.soundSliders]
     * @param {string | HTMLElement} [params.musicSliders]
     * @param {string | HTMLElement} [params.sfxSliders]
     * @param {string | HTMLElement} [params.voSliders]
     * @memberof SoundPlugin
     */
    function SoundPlugin() {
      var _this;

      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          soundButtons = _ref.soundButtons,
          musicButtons = _ref.musicButtons,
          sfxButtons = _ref.sfxButtons,
          voButtons = _ref.voButtons,
          soundSliders = _ref.soundSliders,
          musicSliders = _ref.musicSliders,
          sfxSliders = _ref.sfxSliders,
          voSliders = _ref.voSliders;

      _classCallCheck(this, SoundPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(SoundPlugin).call(this, 'Sound-Button-Plugin'));
      var saved = SavedData.read(SoundPlugin.soundMutedKey);
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      _this._soundMuted = saved ? saved : false;
      _this._musicMuted = false;
      _this._voMuted = false;
      _this._sfxMuted = false;
      _this.soundVolume = 1;
      _this.musicVolume = 1;
      _this.sfxVolume = 1;
      _this.voVolume = 1;
      _this.soundSliders = [];
      _this.musicSliders = [];
      _this.sfxSliders = [];
      _this.voSliders = [];
      _this.soundButtons = [];
      _this.musicButtons = [];
      _this.sfxButtons = [];
      _this.voButtons = [];

      if (soundSliders instanceof HTMLElement) {
        _this.soundSliders[0] = new Slider({
          slider: soundSliders,
          control: SoundPlugin.soundVolumeKey,
          defaultValue: _this.soundVolume
        });
      } else {
        document.querySelectorAll(soundSliders).forEach(function (slider) {
          var newSlider = new Slider({
            slider: slider,
            control: SoundPlugin.soundVolumeKey,
            defaultValue: _this.soundVolume
          });

          if (newSlider.slider) {
            _this.soundSliders.push(newSlider);
          }
        });
      }

      if (musicSliders instanceof HTMLElement) {
        _this.musicSliders[0] = new Slider({
          slider: musicSliders,
          control: SoundPlugin.musicVolumeKey,
          defaultValue: _this.musicVolume
        });
      } else {
        document.querySelectorAll(musicSliders).forEach(function (slider) {
          var newSlider = new Slider({
            slider: slider,
            control: SoundPlugin.musicVolumeKey,
            defaultValue: _this.musicVolume
          });

          if (newSlider.slider) {
            _this.musicSliders.push(newSlider);
          }
        });
      }

      if (sfxSliders instanceof HTMLElement) {
        _this.sfxSliders[0] = new Slider({
          slider: sfxSliders,
          control: SoundPlugin.sfxVolumeKey,
          defaultValue: _this.sfxVolume
        });
      } else {
        document.querySelectorAll(sfxSliders).forEach(function (slider) {
          var newSlider = new Slider({
            slider: slider,
            control: SoundPlugin.sfxVolumeKey,
            defaultValue: _this.sfxVolume
          });

          if (newSlider.slider) {
            _this.sfxSliders.push(newSlider);
          }
        });
      }

      if (voSliders instanceof HTMLElement) {
        _this.voSliders[0] = new Slider({
          slider: voSliders,
          control: SoundPlugin.voVolumeKey,
          defaultValue: _this.voVolume
        });
      } else {
        document.querySelectorAll(voSliders).forEach(function (slider) {
          var newSlider = new Slider({
            slider: slider,
            control: SoundPlugin.voVolumeKey,
            defaultValue: _this.voVolume
          });

          if (newSlider.slider) {
            _this.voSliders.push(newSlider);
          }
        });
      }

      if (soundButtons instanceof HTMLElement) {
        _this.soundButtons[0] = new Button({
          button: soundButtons,
          onClick: _this.onSoundToggle.bind(_assertThisInitialized(_this)),
          channel: 'sound'
        });
      } else {
        document.querySelectorAll(soundButtons).forEach(function (button) {
          _this.soundButtons.push(new Button({
            button: button,
            onClick: _this.onSoundToggle.bind(_assertThisInitialized(_this)),
            channel: 'sound'
          }));
        });
      }

      if (musicButtons instanceof HTMLElement) {
        _this.musicButtons[0] = new Button({
          button: musicButtons,
          onClick: _this.onMusicToggle.bind(_assertThisInitialized(_this)),
          channel: 'music'
        });
      } else {
        document.querySelectorAll(musicButtons).forEach(function (button) {
          _this.musicButtons.push(new Button({
            button: button,
            onClick: _this.onMusicToggle.bind(_assertThisInitialized(_this)),
            channel: 'music'
          }));
        });
      }

      if (sfxButtons instanceof HTMLElement) {
        _this.sfxButtons[0] = new Button({
          button: sfxButtons,
          onClick: _this.onSFXToggle.bind(_assertThisInitialized(_this)),
          channel: 'sfx'
        });
      } else {
        document.querySelectorAll(sfxButtons).forEach(function (button) {
          _this.sfxButtons.push(new Button({
            button: button,
            onClick: _this.onSFXToggle.bind(_assertThisInitialized(_this)),
            channel: 'sfx'
          }));
        });
      }

      if (voButtons instanceof HTMLElement) {
        _this.voButtons[0] = new Button({
          button: voButtons,
          onClick: _this.onVOToggle.bind(_assertThisInitialized(_this)),
          channel: 'vo'
        });
      } else {
        document.querySelectorAll(voButtons).forEach(function (button) {
          _this.voButtons.push(new Button({
            button: button,
            onClick: _this.onVOToggle.bind(_assertThisInitialized(_this)),
            channel: 'vo'
          }));
        });
      }

      _this.soundSlidersLength = _this.soundSliders.length;
      _this.musicSlidersLength = _this.musicSliders.length;
      _this.sfxSlidersLength = _this.sfxSliders.length;
      _this.voSlidersLength = _this.voSliders.length;
      _this.soundButtonsLength = _this.soundButtons.length;
      _this.musicButtonsLength = _this.musicButtons.length;
      _this.sfxButtonsLength = _this.sfxButtons.length;
      _this.voButtonsLength = _this.voButtons.length;

      if (0 >= _this.soundSlidersLength + _this.musicSlidersLength + _this.sfxSlidersLength + _this.voSlidersLength + _this.soundButtonsLength + _this.musicButtonsLength + _this.sfxButtonsLength + _this.voButtonsLength) {
        _this.warn('Plugin was not provided any valid HTML Elements');

        return _possibleConstructorReturn(_this);
      }

      for (var i = 0; i < _this.soundSlidersLength; i++) {
        _this.soundSliders[i].enableSliderEvents(_this.onSoundVolumeChange.bind(_assertThisInitialized(_this)));
      }

      for (var _i = 0; _i < _this.musicSlidersLength; _i++) {
        _this.musicSliders[_i].enableSliderEvents(_this.onMusicVolumeChange.bind(_assertThisInitialized(_this)));
      }

      for (var _i2 = 0; _i2 < _this.sfxSlidersLength; _i2++) {
        _this.sfxSliders[_i2].enableSliderEvents(_this.onSFXVolumeChange.bind(_assertThisInitialized(_this)));
      }

      for (var _i3 = 0; _i3 < _this.voSlidersLength; _i3++) {
        _this.voSliders[_i3].enableSliderEvents(_this.onVOVolumeChange.bind(_assertThisInitialized(_this)));
      }

      if (_this.soundSliders[0] && _this.soundSliders[0].slider) {
        _this.soundVolume = _this.soundSliders[0].value;
      }

      if (_this.musicSliders[0] && _this.musicSliders[0].slider) {
        _this.musicVolume = _this.musicSliders[0].value;
      }

      if (_this.sfxSliders[0] && _this.sfxSliders[0].slider) {
        _this.sfxVolume = _this.sfxSliders[0].value;
      }

      if (_this.voSliders[0] && _this.voSliders[0].slider) {
        _this.voVolume = _this.voSliders[0].value;
      }

      return _this;
    }
    /**
     * @memberof SoundPlugin
     * @param {Event} e
     */


    _createClass(SoundPlugin, [{
      key: "onSoundVolumeChange",
      value: function onSoundVolumeChange(e) {
        this.soundVolume = this.soundSliders[0].sliderRange(Number(e.target.value));
        this.soundMuted = !this.soundVolume;

        this._checkSoundMute();

        this.sendProperty(SoundPlugin.soundVolumeKey, this.soundVolume);

        for (var i = 0; i < this.soundSlidersLength; i++) {
          this.soundSliders[i].value = this.soundVolume;
        }
      }
      /**
       * @memberof SoundPlugin
       * @param {Event} e
       */

    }, {
      key: "onMusicVolumeChange",
      value: function onMusicVolumeChange(e) {
        this.musicVolume = this.musicSliders[0].sliderRange(Number(e.target.value));
        this.musicMuted = !this.musicVolume;

        this._checkSoundMute();

        this.sendProperty(SoundPlugin.musicVolumeKey, this.musicVolume);

        for (var i = 0; i < this.musicSlidersLength; i++) {
          this.musicSliders[i].value = this.musicVolume;
        }
      }
      /**
       * @memberof SoundPlugin
       * @param {Event} e
       */

    }, {
      key: "onVOVolumeChange",
      value: function onVOVolumeChange(e) {
        this.voVolume = this.voSliders[0].sliderRange(Number(e.target.value));
        this.voMuted = !this.voVolume;

        this._checkSoundMute();

        this.sendProperty(SoundPlugin.voVolumeKey, this.voVolume);

        for (var i = 0; i < this.voSlidersLength; i++) {
          this.voSliders[i].value = this.voVolume;
        }
      }
      /**
       * @memberof SoundPlugin
       * @param {Event} e
       */

    }, {
      key: "onSFXVolumeChange",
      value: function onSFXVolumeChange(e) {
        this.sfxVolume = this.sfxSliders[0].sliderRange(Number(e.target.value));
        this.sfxMuted = !this.sfxVolume;

        this._checkSoundMute();

        this.sendProperty(SoundPlugin.sfxVolumeKey, this.sfxVolume);

        for (var i = 0; i < this.sfxSlidersLength; i++) {
          this.sfxSliders[i].value = this.sfxVolume;
        }
      }
      /**
       * @memberof SoundPlugin
       */

    }, {
      key: "onSoundToggle",
      value: function onSoundToggle() {
        var muted = !this.soundMuted;
        this.soundMuted = muted;
        this.musicMuted = muted;
        this.voMuted = muted;
        this.sfxMuted = muted;
      }
      /**
       * @memberof SoundPlugin
       */

    }, {
      key: "onMusicToggle",
      value: function onMusicToggle() {
        this.musicMuted = !this.musicMuted;

        this._checkSoundMute();
      }
      /**
       * @memberof SoundPlugin
       */

    }, {
      key: "onVOToggle",
      value: function onVOToggle() {
        this.voMuted = !this.voMuted;

        this._checkSoundMute();
      }
      /**
       * @memberof SoundPlugin
       */

    }, {
      key: "onSFXToggle",
      value: function onSFXToggle() {
        this.sfxMuted = !this.sfxMuted;

        this._checkSoundMute();
      }
      /**
       * @memberof SoundPlugin
       */

    }, {
      key: "_checkSoundMute",
      value: function _checkSoundMute() {
        this.soundMuted = this.sfxMuted && this.voMuted && this.musicMuted;
      }
      /**
       * @param {string} key
       * @param {*} value
       * @param {Element} element
       * @memberof SoundPlugin
       */

    }, {
      key: "setMuteProp",
      value: function setMuteProp(key, value, element) {
        this['_' + key] = value;

        this._setMuteProp(key, element, value);
      }
      /**
       * @memberof SoundPlugin
       */

    }, {
      key: "init",
      value: function init() {
        this.client.on('features', function (features) {
          if (!features.data) {
            return;
          }

          for (var i = 0; i < this.soundButtonsLength; i++) {
            this.soundButtons[i].displayButton(features.data);
          }

          for (var _i4 = 0; _i4 < this.musicButtonsLength; _i4++) {
            this.musicButtons[_i4].displayButton(features.data);
          }

          for (var _i5 = 0; _i5 < this.sfxButtonsLength; _i5++) {
            this.sfxButtons[_i5].displayButton(features.data);
          }

          for (var _i6 = 0; _i6 < this.voButtonsLength; _i6++) {
            this.voButtons[_i6].displayButton(features.data);
          }

          for (var _i7 = 0; _i7 < this.soundSlidersLength; _i7++) {
            this.soundSliders[_i7].displaySlider(features.data);
          }

          for (var _i8 = 0; _i8 < this.musicSlidersLength; _i8++) {
            this.musicSliders[_i8].displaySlider(features.data);
          }

          for (var _i9 = 0; _i9 < this.sfxSlidersLength; _i9++) {
            this.sfxSliders[_i9].displaySlider(features.data);
          }

          for (var _i10 = 0; _i10 < this.voSlidersLength; _i10++) {
            this.voSliders[_i10].displaySlider(features.data);
          }
        }.bind(this));
      }
      /**
       * @memberof SoundPlugin
       */

    }, {
      key: "start",
      value: function start() {
        for (var i = 0; i < this.soundButtonsLength; i++) {
          this.soundButtons[i].enableButton();
        }

        for (var _i11 = 0; _i11 < this.musicButtonsLength; _i11++) {
          this.musicButtons[_i11].enableButton();
        }

        for (var _i12 = 0; _i12 < this.sfxButtonsLength; _i12++) {
          this.sfxButtons[_i12].enableButton();
        }

        for (var _i13 = 0; _i13 < this.voButtonsLength; _i13++) {
          this.voButtons[_i13].enableButton();
        }

        this.soundMuted = !!SavedData.read(SoundPlugin.soundMutedKey);
        this.musicMuted = !!SavedData.read(SoundPlugin.musicMutedKey);
        this.sfxMuted = !!SavedData.read(SoundPlugin.sfxMutedKey);
        this.voMuted = !!SavedData.read(SoundPlugin.voMutedKey);
        this.client.on('loaded', this.sendAllProperties);
        this.client.on('loadDone', this.sendAllProperties);
      }
      /**
       *
       * Saves the current state of all volume properties, and then sends them to the game
       * @memberof SoundPlugin
       */

    }, {
      key: "sendAllProperties",
      value: function sendAllProperties() {
        this.sendProperty(SoundPlugin.soundVolumeKey, this.soundVolume);
        this.sendProperty(SoundPlugin.musicVolumeKey, this.musicVolume);
        this.sendProperty(SoundPlugin.voVolumeKey, this.voVolume);
        this.sendProperty(SoundPlugin.sfxVolumeKey, this.sfxVolume);
        this.sendProperty(SoundPlugin.voMutedKey, this.voMuted);
        this.sendProperty(SoundPlugin.soundMutedKey, this.soundMuted);
        this.sendProperty(SoundPlugin.musicMutedKey, this.musicMuted);
        this.sendProperty(SoundPlugin.sfxMutedKey, this.sfxMuted);
      }
      /**
       * @memberof SoundPlugin
       * @param {boolean} muted
       */

    }, {
      key: "soundMuted",
      set: function set(muted) {
        this.setMuteProp('soundMuted', muted, this.soundButtons);
      }
      /**
       * @memberof SoundPlugin
       */
      ,
      get: function get() {
        return this._soundMuted;
      }
      /**
       * @memberof SoundPlugin
       * @param {boolean} muted
       */

    }, {
      key: "voMuted",
      set: function set(muted) {
        this.setMuteProp('voMuted', muted, this.voButtons);
      }
      /**
       * @memberof SoundPlugin
       */
      ,
      get: function get() {
        return this._voMuted;
      }
      /**
       * @memberof SoundPlugin
       * @param {boolean} muted
       */

    }, {
      key: "musicMuted",
      set: function set(muted) {
        this.setMuteProp('musicMuted', muted, this.musicButtons);
      }
      /**
       * @memberof SoundPlugin
       */
      ,
      get: function get() {
        return this._musicMuted;
      }
      /**
       * @memberof SoundPlugin
       * @param {boolean} muted
       */

    }, {
      key: "sfxMuted",
      set: function set(muted) {
        this.setMuteProp('sfxMuted', muted, this.sfxButtons);
      }
      /**
       * @memberof SoundPlugin
       */
      ,
      get: function get() {
        return this._sfxMuted;
      }
      /**
       * @readonly
       * @static
       * @memberof SoundPlugin
       */

    }, {
      key: "soundButton",

      /**
       * @readonly
       * @memberof SoundPlugin
       */
      get: function get() {
        return this._soundButton.button;
      }
      /**
       * @readonly
       * @memberof SoundPlugin
       */

    }, {
      key: "musicButton",
      get: function get() {
        return this._musicButton.button;
      }
      /**
       * @readonly
       * @memberof SoundPlugin
       */

    }, {
      key: "sfxButton",
      get: function get() {
        return this._sfxButton.button;
      }
      /**
       * @readonly
       * @memberof SoundPlugin
       */

    }, {
      key: "voButton",
      get: function get() {
        return this._voButton.button;
      }
    }], [{
      key: "soundMutedKey",
      get: function get() {
        return 'soundMuted';
      }
      /**
       * @readonly
       * @static
       * @memberof SoundPlugin
       */

    }, {
      key: "voMutedKey",
      get: function get() {
        return 'voMuted';
      }
      /**
       * @readonly
       * @static
       * @memberof SoundPlugin
       */

    }, {
      key: "musicMutedKey",
      get: function get() {
        return 'musicMuted';
      }
      /**
       * @readonly
       * @static
       * @memberof SoundPlugin
       */

    }, {
      key: "sfxMutedKey",
      get: function get() {
        return 'sfxMuted';
      }
      /**
       * @readonly
       * @static
       * @memberof SoundPlugin
       */

    }, {
      key: "soundVolumeKey",
      get: function get() {
        return 'soundVolume';
      }
      /**
       * @readonly
       * @static
       * @memberof SoundPlugin
       */

    }, {
      key: "sfxVolumeKey",
      get: function get() {
        return 'sfxVolume';
      }
      /**
       * @readonly
       * @static
       * @memberof SoundPlugin
       */

    }, {
      key: "voVolumeKey",
      get: function get() {
        return 'voVolume';
      }
      /**
       * @readonly
       * @static
       * @memberof SoundPlugin
       */

    }, {
      key: "musicVolumeKey",
      get: function get() {
        return 'musicVolume';
      }
    }]);

    return SoundPlugin;
  }(ButtonPlugin);

  /**
   * Default user data handler for the {{#crossLink "springroll.Container"}}Container{{/crossLink}} to save data using
   * the {{#crossLink "springroll.SavedData"}}SavedData{{/crossLink}} class.
   * @class SavedDataHandler
   */

  var SavedDataHandler =
  /*#__PURE__*/
  function () {
    /**
     * 
     */
    function SavedDataHandler() {
      _classCallCheck(this, SavedDataHandler);

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


    _createClass(SavedDataHandler, [{
      key: "IDBOpen",
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
      value: function IDBOpen(dbName) {
        var dbVersion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var additions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var deletions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        // persisting the savedData object to keep the connection open
        this.savedData = new SavedData();
        this.savedData.IDBOpen(dbName, dbVersion, additions, deletions, callback);
      }
      /**
       * Add a record to a given store
       * @param {string} storeName The name of the store from which the record will be updated
       * @param {string} key the key of the record to be updated 
       * @param {*} value The value for the record with the given key to be updated
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBAdd",
      value: function IDBAdd(storeName, record, key, callback) {
        this.savedData.IDBAdd(storeName, record, key, callback);
      }
      /**
       * Update a record from a given store
       * @param {string} storeName The name of the store from which the record will be updated
       * @param {string} key the key of the record to be updated 
       * @param {*} value The value for the record with the given key to be updated
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBUpdate",
      value: function IDBUpdate(storeName, key, value, callback) {
        this.savedData.IDBUpdate(storeName, key, value, callback);
      }
      /**
       * Remove a record from a store
       * @param {*} storeName The name of the store from which the record will be removed
       * @param {*} key the key of the record to be removed 
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBRemove",
      value: function IDBRemove(storeName, key, callback) {
        this.savedData.IDBRemove(storeName, key, callback);
      }
      /**
       * Return a record from a given store with a given key
       * @param {string} storeName The name of the store to read from
       * @param {string} key The key for the record in the given store 
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBRead",
      value: function IDBRead(storeName, key, callback) {
        this.savedData.IDBRead(storeName, key, callback);
      }
      /**
       * Get all records from a store
       * @param {string} storeName The store to get all records from
       * @param {integer} count Optionally the count of records to return
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBReadAll",
      value: function IDBReadAll(storeName, count, callback) {
        this.savedData.IDBReadAll(storeName, count, callback);
      }
      /**
       * Get the version of a given database
       * @param {string} dbName The name of the database to return the version of
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBGetVersion",
      value: function IDBGetVersion(dbName, callback) {
        var savedData = new SavedData(dbName);
        savedData.IDBGetVersion(dbName, callback);
      }
      /**
       * Closes the connection to the database
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "IDBClose",
      value: function IDBClose(callback) {
        this.savedData.IDBClose(callback);
      }
    }], [{
      key: "remove",
      value: function remove(name, callback) {
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

    }, {
      key: "write",
      value: function write(name, value, callback) {
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

    }, {
      key: "read",
      value: function read(name, callback) {
        callback(SavedData.read(name));
      }
    }]);

    return SavedDataHandler;
  }();

  /**
   * @export
   * @class UserDataPlugin
   * @extends {BasePlugin}
   */

  var UserDataPlugin =
  /*#__PURE__*/
  function (_BasePlugin) {
    _inherits(UserDataPlugin, _BasePlugin);

    /**
     *Creates an instance of UserDataPlugin.
     * @memberof UserDataPlugin
     */
    function UserDataPlugin() {
      var _this;

      _classCallCheck(this, UserDataPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(UserDataPlugin).call(this, 'UserData-Plugin'));
      _this.onUserDataRemove = _this.onUserDataRemove.bind(_assertThisInitialized(_this));
      _this.onUserDataRead = _this.onUserDataRead.bind(_assertThisInitialized(_this));
      _this.onUserDataWrite = _this.onUserDataWrite.bind(_assertThisInitialized(_this));
      _this.onIDBAdd = _this.onIDBAdd.bind(_assertThisInitialized(_this));
      _this.onIDBOpen = _this.onIDBOpen.bind(_assertThisInitialized(_this));
      _this.onIDBRead = _this.onIDBRead.bind(_assertThisInitialized(_this));
      _this.onIDBRead = _this.onIDBRead.bind(_assertThisInitialized(_this));
      _this.onIDBRemove = _this.onIDBRemove.bind(_assertThisInitialized(_this));
      _this.onIDBUpdate = _this.onIDBUpdate.bind(_assertThisInitialized(_this));
      _this.onIDBUpdate = _this.onIDBUpdate.bind(_assertThisInitialized(_this));
      _this.onIDBClose = _this.onIDBClose.bind(_assertThisInitialized(_this));
      _this.IDBReadAll = _this.onIDBReadAll.bind(_assertThisInitialized(_this));
      _this.onIDBGetVersion = _this.onIDBGetVersion.bind(_assertThisInitialized(_this));
      _this.savedDataHandler = null;
      return _this;
    }
    /**
     *
     *
     * @memberof UserDataPlugin
     */


    _createClass(UserDataPlugin, [{
      key: "init",
      value: function init() {
        this.client.on('userDataRemove', this.onUserDataRemove);
        this.client.on('userDataRead', this.onUserDataRead);
        this.client.on('userDataWrite', this.onUserDataWrite);
        this.client.on('IDBOpen', this.onIDBOpen);
        this.client.on('IDBRead', this.onIDBRead);
        this.client.on('IDBAdd', this.onIDBAdd);
        this.client.on('IDBRemove', this.onIDBRemove);
        this.client.on('IDBUpdate', this.onIDBUpdate);
        this.client.on('IDBClose', this.onIDBClose);
        this.client.on('IDBGetVersion', this.onIDBGetVersion);
      }
      /**
       * Handler for the userDataRemove event 
       * @method onUserDataRemove
       * @private
       */

    }, {
      key: "onUserDataRemove",
      value: function onUserDataRemove(_ref) {
        var _this2 = this;

        var data = _ref.data,
            type = _ref.type;
        SavedDataHandler.remove(data, function () {
          _this2.client.send(type);
        });
      }
      /**
       * Handler for the userDataRead event
       * @method onUserDataRead
       * @private
       */

    }, {
      key: "onUserDataRead",
      value: function onUserDataRead(_ref2) {
        var _this3 = this;

        var data = _ref2.data,
            type = _ref2.type;
        SavedDataHandler.read(data, function (value) {
          return _this3.client.send(type, value);
        });
      }
      /**
       * Handler for the userDataWrite event
       * @method onUserDataWrite
       * @private
       */

    }, {
      key: "onUserDataWrite",
      value: function onUserDataWrite(_ref3) {
        var _this4 = this;

        var type = _ref3.type,
            _ref3$data = _ref3.data,
            name = _ref3$data.name,
            value = _ref3$data.value;
        SavedDataHandler.write(name, value, function () {
          return _this4.client.send(type);
        });
      } // ----------------------------------------------------------------
      //                      IndexedDB Manipulation        
      // ----------------------------------------------------------------

      /**
       * Open a connection with the IDB Database and optionally add or delete
       * Indexes and stores
       * @param {string} dbName The name of your IndexedDB database
       * @param {string} dbVersion The version number of the database
       * @param {JSON} additions Any additions to the structure of the database
       * @param {array} additions.stores Any stores to be added into the database syntax: 
       * {storeName: '[name]', options: {[optionally add options]}}
       * @param {array} additions.indexes Any Indexes to be added to the database syntax: 
       * {storeName: '[name]', options: {[optionally add options]}}
       */

    }, {
      key: "onIDBOpen",
      value: function onIDBOpen(_ref4) {
        var _this5 = this;

        var type = _ref4.type,
            _ref4$data = _ref4.data,
            dbName = _ref4$data.dbName,
            _ref4$data$dbVersion = _ref4$data.dbVersion,
            dbVersion = _ref4$data$dbVersion === void 0 ? null : _ref4$data$dbVersion,
            _ref4$data$additions = _ref4$data.additions,
            additions = _ref4$data$additions === void 0 ? {} : _ref4$data$additions,
            _ref4$data$deletions = _ref4$data.deletions,
            deletions = _ref4$data$deletions === void 0 ? {} : _ref4$data$deletions;
        // Keep an instance open to use on open
        this.savedDataHandler = new SavedDataHandler();
        this.savedDataHandler.IDBOpen(dbName, dbVersion, additions, deletions, function (value) {
          return _this5.client.send(type, value);
        });
      }
      /**
       * Add a record to a given store
       * @param {string} storeName The name of the store from which the record will be updated
       * @param {string} key the key of the record to be updated 
       * @param {*} value The value for the record with the given key to be updated
       */

    }, {
      key: "onIDBAdd",
      value: function onIDBAdd(_ref5) {
        var _this6 = this;

        var type = _ref5.type,
            _ref5$data = _ref5.data,
            storeName = _ref5$data.storeName,
            value = _ref5$data.value,
            key = _ref5$data.key;
        this.savedDataHandler.IDBAdd(storeName, value, key, function (value) {
          return _this6.client.send(type, value);
        });
      }
      /**
       * Update a record from a given store
       * @param {string} storeName 
       * @param {string} record 
       * @param {string} key 
       * @param {function} callback 
       */

    }, {
      key: "onIDBUpdate",
      value: function onIDBUpdate(_ref6) {
        var _this7 = this;

        var type = _ref6.type,
            _ref6$data = _ref6.data,
            storeName = _ref6$data.storeName,
            key = _ref6$data.key,
            value = _ref6$data.value;
        this.savedDataHandler.IDBUpdate(storeName, key, value, function (value) {
          return _this7.client.send(type, value);
        });
      }
      /**
       * Remove a record from a store
       * @param {*} storeName The name of the store from which the record will be removed
       * @param {*} key the key of the record to be removed 
       */

    }, {
      key: "onIDBRemove",
      value: function onIDBRemove(_ref7) {
        var _this8 = this;

        var type = _ref7.type,
            _ref7$data = _ref7.data,
            storeName = _ref7$data.storeName,
            key = _ref7$data.key;
        this.savedDataHandler.IDBRemove(storeName, key, function (value) {
          return _this8.client.send(type, value);
        });
      }
      /**
       * Return a record from a given store with a given key
       * @param {string} storeName 
       * @param {string} key The key for the record in the given store 
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */

    }, {
      key: "onIDBRead",
      value: function onIDBRead(_ref8) {
        var _this9 = this;

        var type = _ref8.type,
            _ref8$data = _ref8.data,
            storeName = _ref8$data.storeName,
            key = _ref8$data.key;
        this.savedDataHandler.IDBRead(storeName, key, function (value) {
          return _this9.client.send(type, value);
        });
      }
      /**
       * Get all records from a store
       * @param {string} storeName The store to get all records from
       * @param {integer} count Optionally the count of records to return
       */

    }, {
      key: "onIDBReadAll",
      value: function onIDBReadAll(_ref9) {
        var _this10 = this;

        var type = _ref9.type,
            _ref9$data = _ref9.data,
            storeName = _ref9$data.storeName,
            count = _ref9$data.count;
        this.savedData.IDBReadAll(storeName, count, function (value) {
          return _this10.client.send(type, value);
        });
      }
      /**
       * Get the version of a given database
       * @param {string} dbName The name of the database to return the version of
       */

    }, {
      key: "onIDBGetVersion",
      value: function onIDBGetVersion(_ref10) {
        var _this11 = this;

        var type = _ref10.type,
            dbName = _ref10.data.dbName;
        var savedDataHandler = new SavedDataHandler();
        savedDataHandler.IDBGetVersion(dbName, function (value) {
          return _this11.client.send(type, value);
        });
      }
      /**
       * 
       */

    }, {
      key: "onIDBClose",
      value: function onIDBClose(_ref11) {
        var _this12 = this;

        var type = _ref11.type;
        this.savedDataHandler.IDBClose(function (value) {
          return _this12.client.send(type, value);
        });
      }
    }]);

    return UserDataPlugin;
  }(BasePlugin);

  /**
   * @export
   * @class PointerSizePlugin
   * @extends {SliderPlugin}
   *
   */

  var PointerSizePlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(PointerSizePlugin, _SliderPlugin);

    /**
     *Creates an instance of PointerSizePlugin.
     * @param {object} options
     * @param {string | HTMLElement} [pointerSliders]
     * @param {number} [options.defaultPointerSize=0.5]
     * @memberof PointerSizePlugin
     */
    function PointerSizePlugin(pointerSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultPointerSi = _ref.defaultPointerSize,
          defaultPointerSize = _ref$defaultPointerSi === void 0 ? 0.5 : _ref$defaultPointerSi;

      _classCallCheck(this, PointerSizePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(PointerSizePlugin).call(this, pointerSliders, 'UISize-Pointer-Plugin', {
        defaultValue: defaultPointerSize,
        featureName: PointerSizePlugin.pointerSizeKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onPointerSizeChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof PointerSizePlugin
     * @param {Event} e
     */


    _createClass(PointerSizePlugin, [{
      key: "onPointerSizeChange",
      value: function onPointerSizeChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(PointerSizePlugin.pointerSizeKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof PointerSizePlugin
       */

    }], [{
      key: "pointerSizeKey",
      get: function get() {
        return 'pointerSize';
      }
    }]);

    return PointerSizePlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class ButtonSizePlugin
   * @extends {SliderPlugin}
   *
   */

  var ButtonSizePlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(ButtonSizePlugin, _SliderPlugin);

    /**
     *Creates an instance of ButtonSizePlugin.
     * @param {string | HTMLElement} buttonSliders selector string for the inputs
     * @param {object} options
     * @param {number} [options.defaultButtonSize=0.5]
     * @memberof ButtonSizePlugin
     */
    function ButtonSizePlugin(buttonSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultButtonSiz = _ref.defaultButtonSize,
          defaultButtonSize = _ref$defaultButtonSiz === void 0 ? 0.5 : _ref$defaultButtonSiz;

      _classCallCheck(this, ButtonSizePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ButtonSizePlugin).call(this, buttonSliders, 'UISize-Button-Plugin', {
        defaultValue: defaultButtonSize,
        featureName: ButtonSizePlugin.buttonSizeKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onButtonSizeChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof ButtonSizePlugin
     * @param {Event} e
     */


    _createClass(ButtonSizePlugin, [{
      key: "onButtonSizeChange",
      value: function onButtonSizeChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(ButtonSizePlugin.buttonSizeKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof ButtonSizePlugin
       */

    }], [{
      key: "buttonSizeKey",
      get: function get() {
        return 'buttonSize';
      }
    }]);

    return ButtonSizePlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class ControlSensitivityPlugin
   * @extends {SliderPlugin}
   */

  var ControlSensitivityPlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(ControlSensitivityPlugin, _SliderPlugin);

    /**
     *Creates an instance of ControlSensitivityPlugin.
     * @param {string | HTMLElement} sensitivitySliders
     * @param {object} options
     * @param {number} [options.defaultSensitivity=0.5]
     * @memberof ControlSensitivityPlugin
     */
    function ControlSensitivityPlugin(sensitivitySliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultSensitivi = _ref.defaultSensitivity,
          defaultSensitivity = _ref$defaultSensitivi === void 0 ? 0.5 : _ref$defaultSensitivi;

      _classCallCheck(this, ControlSensitivityPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ControlSensitivityPlugin).call(this, sensitivitySliders, 'Control-Sensitivity-Plugin', {
        defaultValue: defaultSensitivity,
        featureName: ControlSensitivityPlugin.controlSensitivityKey
      }));
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onControlSensitivityChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof ControlSensitivityPlugin
     * @param {Event} e
     */


    _createClass(ControlSensitivityPlugin, [{
      key: "onControlSensitivityChange",
      value: function onControlSensitivityChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(ControlSensitivityPlugin.controlSensitivityKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof ControlSensitivityPlugin
       */

    }], [{
      key: "controlSensitivityKey",
      get: function get() {
        return 'controlSensitivity';
      }
    }]);

    return ControlSensitivityPlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class KeyboardMapPlugin
   * @extends {BasePlugin}
   */

  var KeyboardMapPlugin =
  /*#__PURE__*/
  function (_BasePlugin) {
    _inherits(KeyboardMapPlugin, _BasePlugin);

    /**
     *Creates an instance of KeyboardMapPlugin.
     * @param {string | HTMLElement} keyContainers //div or similar container element that will contain the remappable keys
     * @param {object} [options]
     * @param {string} [options.customClassName='springrollContainerKeyBinding__button']
     * @memberof KeyboardMapPlugin
     */
    function KeyboardMapPlugin(keyContainers) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$customClassName = _ref.customClassName,
          customClassName = _ref$customClassName === void 0 ? 'springrollContainerKeyBinding__button' : _ref$customClassName;

      _classCallCheck(this, KeyboardMapPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(KeyboardMapPlugin).call(this, 'Keyboard-Map-Plugin'));
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this)); //Allows for removing and readding event listeners

      _this.bindKey = _this.bindKey.bind(_assertThisInitialized(_this));
      _this.onKeyButtonClick = _this.onKeyButtonClick.bind(_assertThisInitialized(_this));
      _this.className = customClassName;
      _this.keyContainers = keyContainers instanceof HTMLElement ? [keyContainers] : document.querySelectorAll(keyContainers);
      _this.keyBindings = {};
      _this.buttons = [];
      _this.activekeyButton;
      _this.sendAfterFetch = false;
      _this.canEmit = false;
      _this.keyContainersLength = _this.keyContainers.length;

      if (_this.keyContainersLength <= 0) {
        _this.warn('plugin was not provided any valid key binding container elements');

        return _possibleConstructorReturn(_this);
      }

      return _this;
    }
    /**
     * @memberof KeyboardMapPlugin
     * @param {MouseEvent} e
     * Sets up a rebinding of a key once a key button is clicked.
     */


    _createClass(KeyboardMapPlugin, [{
      key: "onKeyButtonClick",
      value: function onKeyButtonClick(e) {
        for (var i = 0, l = this.buttons.length; i < l; i++) {
          for (var j = 0; j < this.buttons[i].length; j++) {
            this.buttons[i][j].removeEventListener('click', this.onKeyButtonClick);
          }
        }

        this.activekeyButton = e.target;
        this.activekeyButton.textContent = 'Press Key to Map';
        document.addEventListener('keyup', this.bindKey);
      }
      /**
       * @memberof KeyboardMapPlugin
       * @param {KeyboardEvent} key
       * Actually updates the key binding and sends the value. Also
       * replicates the new key across the other keycontainers
       */

    }, {
      key: "bindKey",
      value: function bindKey(key) {
        key.preventDefault(); //prevents space bar from retriggering a keybinding when set.

        for (var actionName in this.keyBindings) {
          if (this.keyBindings[actionName].currentKey === key.key.toLowerCase()) {
            this.warn("".concat(key.key, " is already bound"));
            return;
          }
        }

        this.activekeyButton.textContent = key.key === ' ' ? 'space' : key.key;

        for (var i = 0; i < this.buttons.length; i++) {
          for (var j = 0; j < this.buttons[i].length; j++) {
            if (this.buttons[i][j].value === this.activekeyButton.value) {
              this.buttons[i][j].textContent = this.activekeyButton.textContent;
            }
          }
        }

        this.keyBindings[this.activekeyButton.value].currentKey = key.key;
        document.removeEventListener('keyup', this.bindKey);

        for (var _i = 0, l = this.buttons.length; _i < l; _i++) {
          for (var _j = 0; _j < this.buttons[_i].length; _j++) {
            this.buttons[_i][_j].addEventListener('click', this.onKeyButtonClick);
          }
        }

        this.sendProperty(KeyboardMapPlugin.keyBindingKey, this.keyBindings);
      }
      /**
       * @memberof KeyboardMapPlugin
       */

    }, {
      key: "init",
      value: function init() {
        this.client.on('features', function (features) {
          var _this2 = this;

          if (!features.data) {
            return;
          }

          if (!features.data.keyBinding) {
            return;
          }

          var data = SavedData.read(KeyboardMapPlugin.keyBindingKey);
          this.client.fetch('keyBindings', function (result) {
            for (var j = 0; j < _this2.keyContainersLength; j++) {
              _this2.buttons[j] = [];

              for (var i = 0, l = result.data.length; i < l; i++) {
                var currentKey = result.data[i].defaultKey.toLowerCase();

                if (data) {
                  if (data[result.data[i].actionName]) {
                    currentKey = data[result.data[i].actionName].currentKey;
                  }
                } //only needs to be set up once


                if (j === 0) {
                  _this2.keyBindings[result.data[i].actionName] = {
                    defaultKey: result.data[i].defaultKey.toLowerCase(),
                    currentKey: currentKey
                  };
                }

                _this2.buttons[j][i] = document.createElement('button');

                _this2.buttons[j][i].classList.add(_this2.className);

                _this2.buttons[j][i].id = "keyBoardMapPlugin-".concat(result.data[i].actionName);
                _this2.buttons[j][i].value = result.data[i].actionName;
                _this2.buttons[j][i].textContent = result.data[i].defaultKey;

                _this2.buttons[j][i].addEventListener('click', _this2.onKeyButtonClick);

                _this2.label = document.createElement('label');
                _this2.label.htmlFor = "keyBoardMapPlugin-".concat(result.data[i].actionName);
                _this2.label.textContent = result.data[i].actionName;

                _this2.keyContainers[j].appendChild(_this2.label);

                _this2.keyContainers[j].appendChild(_this2.buttons[j][i]);
              }
            }

            _this2.canEmit = true;

            if (_this2.sendAfterFetch) {
              _this2.sendAllProperties();
            }
          });
        }.bind(this));
      }
      /**
      *
      * Sends initial caption properties to the application
      * @memberof KeyboardMapPlugin
      */

    }, {
      key: "sendAllProperties",
      value: function sendAllProperties() {
        if (this.canEmit) {
          this.sendProperty(KeyboardMapPlugin.keyBindingKey, this.keyBindings);
        } else {
          this.sendAfterFetch = true;
        }
      }
      /**
       * @readonly
       * @static
       * @memberof KeyboardMapPlugin
       */

    }], [{
      key: "keyBindingKey",
      get: function get() {
        return 'keyBinding';
      }
    }]);

    return KeyboardMapPlugin;
  }(BasePlugin);

  /**
   * @export
   * @class LayersPlugin
   * @extends {SliderPlugin}
   */

  var LayersPlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(LayersPlugin, _SliderPlugin);

    /**
     *
     * @param {Object} options
     * @param {number} [options.defaultValue=0]
     * @param {string | HTMLInputElement} layersSliders selector string or HTML Element for the input(s)
     */
    function LayersPlugin(layersSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultValue = _ref.defaultValue,
          defaultValue = _ref$defaultValue === void 0 ? 0 : _ref$defaultValue;

      _classCallCheck(this, LayersPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(LayersPlugin).call(this, layersSliders, 'Layer-Plugin', {
        defaultValue: defaultValue,
        featureName: LayersPlugin.layersSliderKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onLayerValueChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof LayersPlugin
     * @param {Event} e
     */


    _createClass(LayersPlugin, [{
      key: "onLayerValueChange",
      value: function onLayerValueChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(LayersPlugin.layersSliderKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof LayersPlugin
       */

    }], [{
      key: "layersSliderKey",
      get: function get() {
        return 'removableLayers';
      }
    }]);

    return LayersPlugin;
  }(SliderPlugin);

  var SUPPORTED_POSITIONS = ['top', 'bottom', 'left', 'right'];
  /**
   * @export
   * @class HUDPlugin
   * @extends {BasePlugin}
   */

  var HUDPlugin =
  /*#__PURE__*/
  function (_RadioGroupPlugin) {
    _inherits(HUDPlugin, _RadioGroupPlugin);

    /**
     * Creates an instance of HUDPlugin
     * @param {string} hudSelectorRadios css selector for the radio buttons
     * @param {object} params
     * @param {string[]} [params.defaultValue='top'] default value for the HUD position. Top will usually be the default in most cases.
     * @memberof HUDPlugin
     */
    function HUDPlugin(hudSelectorRadios) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultValue = _ref.defaultValue,
          defaultValue = _ref$defaultValue === void 0 ? SUPPORTED_POSITIONS[0] : _ref$defaultValue;

      _classCallCheck(this, HUDPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HUDPlugin).call(this, hudSelectorRadios, 'HUD-Layout-Plugin', {
        supportedValues: SUPPORTED_POSITIONS,
        initialValue: defaultValue,
        controlName: 'Hud Selector',
        featureName: HUDPlugin.hudPositionKey,
        radioCount: SUPPORTED_POSITIONS.length
      }));
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      _this.sendAfterFetch = false;
      _this.canEmit = false;
      _this.positions = [];

      if (_this.radioGroupsLength <= 0) {
        _this.warn('Plugin was not provided any valid HTML elements');
      }

      for (var i = 0; i < _this.radioGroupsLength; i++) {
        _this.radioGroups[i].enableRadioEvents(_this.onHUDSelect.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof HUDPlugin
     * @param {Event} e
     */


    _createClass(HUDPlugin, [{
      key: "onHUDSelect",
      value: function onHUDSelect(e) {
        //return if a radio button is programattically clicked when it is hidden
        if (!this.positions.includes(e.target.value)) {
          for (var i = 0; i < this.radioGroupsLength; i++) {
            this.radioGroups[i].radioGroup[this.currentValue].checked = true;
          }

          return;
        }

        this.currentValue = e.target.value;
        this.sendProperty(HUDPlugin.hudPositionKey, this.currentValue);
      }
      /**
       * @memberof HUDPlugin
       */

    }, {
      key: "init",
      value: function init() {
        this.client.on('features', function (features) {
          var _this2 = this;

          if (!features.data || !features.data.hudPosition) {
            return;
          }

          if (this.radioGroupsLength <= 0) {
            return;
          } //get the game's reported HUD positions to build out positions array


          this.client.fetch('hudPositions', function (result) {
            for (var i = 0, l = result.data.length; i < l; i++) {
              if (!SUPPORTED_POSITIONS.includes(result.data[i].toLowerCase())) {
                _this2.warn("".concat(result.data[i], " is an invalid position name"));

                continue;
              }

              _this2.positions.push(result.data[i].toLowerCase());
            }

            for (var _i = 0; _i < _this2.radioGroupsLength; _i++) {
              //Hide any radio buttons that aren't in the game's position list.
              for (var key in _this2.radioGroups[_i].radioGroup) {
                _this2.radioGroups[_i].radioGroup[key].style.display = _this2.positions.includes(_this2.radioGroups[_i].radioGroup[key].value) ? '' : 'none';
              }
            }

            _this2.canEmit = true;

            if (_this2.sendAfterFetch) {
              _this2.sendAllProperties();
            }
          });
        }.bind(this));
      }
      /**
      * @memberof HUDPlugin
      */

    }, {
      key: "start",
      value: function start() {
        var data = SavedData.read(HUDPlugin.hudPositionKey);

        if (SUPPORTED_POSITIONS.includes(data)) {
          this.currentValue = data;
        }

        this.client.on('loaded', this.sendAllProperties);
        this.client.on('loadDone', this.sendAllProperties);
      }
      /**
      *
      * Sends initial HUD position properties to the application
      * @memberof HUDPlugin
      */

    }, {
      key: "sendAllProperties",
      value: function sendAllProperties() {
        if (this.canEmit) {
          this.sendProperty(HUDPlugin.hudPositionKey, this.currentValue);
        } else {
          this.sendAfterFetch = true;
        }
      }
      /**
       * @static
       * @readonly
       * @memberof HUDPlugin
       */

    }], [{
      key: "hudPositionKey",
      get: function get() {
        return 'hudPosition';
      }
    }]);

    return HUDPlugin;
  }(RadioGroupPlugin);

  var COLOR_BLIND_TYPES = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  /**
   * @export
   * @class ColorVisionPlugin
   * @extends {RadioGroupPlugin}
   */

  var ColorVisionPlugin =
  /*#__PURE__*/
  function (_RadioGroupPlugin) {
    _inherits(ColorVisionPlugin, _RadioGroupPlugin);

    /**
     *Creates an instance of ColorVisionPlugin.
     * @param {object} params
     * @param {string | HTMLElement} params.colorSelects
     * @memberof ColorVision
     */
    function ColorVisionPlugin(colorVisionRadios) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultValue = _ref.defaultValue,
          defaultValue = _ref$defaultValue === void 0 ? COLOR_BLIND_TYPES[0] : _ref$defaultValue;

      _classCallCheck(this, ColorVisionPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ColorVisionPlugin).call(this, colorVisionRadios, 'Color-Filter-Plugin', {
        supportedValues: COLOR_BLIND_TYPES,
        initialValue: defaultValue,
        controlName: 'Color Vision Selector',
        featureName: ColorVisionPlugin.colorVisionKey,
        radioCount: COLOR_BLIND_TYPES.length
      }));
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      _this.sendAfterFetch = false;
      _this.canEmit = false;
      _this.colors = [];

      if (_this.radioGroupsLength <= 0) {
        _this.warn('Plugin was not provided any valid HTML elements');

        return _possibleConstructorReturn(_this);
      }

      for (var i = 0; i < _this.radioGroupsLength; i++) {
        _this.radioGroups[i].enableRadioEvents(_this.onColorChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof ColorVisionPlugin
     * @param {Event} e
     */


    _createClass(ColorVisionPlugin, [{
      key: "onColorChange",
      value: function onColorChange(e) {
        //return if a radio button is programmatically clicked when it is hidden from the user
        if (!this.colors.includes(e.target.value)) {
          for (var i = 0; i < this.radioGroupsLength; i++) {
            this.radioGroups[i].radioGroup[this.currentValue].checked = true;
          }

          return;
        }

        this.currentValue = e.target.value;
        this.sendProperty(ColorVisionPlugin.colorVisionKey, this.currentValue);
      }
      /**
       * @memberof ColorVisionPlugin
       */

    }, {
      key: "init",
      value: function init() {
        this.client.on('features', function (features) {
          var _this2 = this;

          if (!features.data || !features.data.colorVision) {
            return;
          }

          if (this.colorDropdownsLength <= 0) {
            return;
          } //get the game's reported colors to build out accepted filters array


          this.client.fetch('colorFilters', function (result) {
            for (var i = 0, l = result.data.length; i < l; i++) {
              if (!COLOR_BLIND_TYPES.includes(result.data[i].toLowerCase())) {
                _this2.warn("".concat(result.data[i], " is an invalid color vision name"));

                continue;
              }

              _this2.colors.push(result.data[i].toLowerCase());
            }

            _this2.defaultValue = _this2.colors[0];

            for (var _i = 0; _i < _this2.radioGroupsLength; _i++) {
              //Hide any radio buttons that aren't in the game's filter list.
              for (var key in _this2.radioGroups[_i].radioGroup) {
                _this2.radioGroups[_i].radioGroup[key].style.display = _this2.colors.includes(_this2.radioGroups[_i].radioGroup[key].value.toLowerCase()) ? '' : 'none';
              }
            }

            _this2.canEmit = true;

            if (_this2.sendAfterFetch) {
              _this2.sendAllProperties();
            }
          });
        }.bind(this));
      }
      /**
      * @memberof ColorVisionPlugin
      */

    }, {
      key: "start",
      value: function start() {
        var data = SavedData.read(ColorVisionPlugin.colorVisionKey);

        if (COLOR_BLIND_TYPES.includes(data)) {
          this.currentValue = data;
        }

        this.client.on('loaded', this.sendAllProperties);
        this.client.on('loadDone', this.sendAllProperties);
      }
      /**
      *
      * Sends initial caption properties to the application
      * @memberof ColorVisionPlugin
      */

    }, {
      key: "sendAllProperties",
      value: function sendAllProperties() {
        if (this.canEmit) {
          this.sendProperty(ColorVisionPlugin.colorVisionKey, this.currentValue);
        } else {
          this.sendAfterFetch = true;
        }
      }
      /**
       * @readonly
       * @static
       * @memberof ColorVisionPlugin
       */

    }], [{
      key: "colorVisionKey",
      get: function get() {
        return 'colorVision';
      }
    }]);

    return ColorVisionPlugin;
  }(RadioGroupPlugin);

  /**
   * @export
   * @class HitAreaScalePlugin
   * @extends {SliderPlugin}
   */

  var HitAreaScalePlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(HitAreaScalePlugin, _SliderPlugin);

    /**
     *Creates an instance of HitAreaScalePlugin.
     * @param {object} params
     * @param {string | HTMLElement} params.hitAreaScaleSliders
     * @param {number} [params.defaultHitAreaScale=0.5]
     * @memberof HitAreaScalePlugin
     */
    function HitAreaScalePlugin(hitAreaScaleSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultHitAreaSc = _ref.defaultHitAreaScale,
          defaultHitAreaScale = _ref$defaultHitAreaSc === void 0 ? 0.5 : _ref$defaultHitAreaSc;

      _classCallCheck(this, HitAreaScalePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HitAreaScalePlugin).call(this, hitAreaScaleSliders, 'Hit-Area-Scale-Plugin', {
        defaultValue: defaultHitAreaScale,
        featureName: HitAreaScalePlugin.hitAreaScaleKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onHitAreaScaleChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof HitAreaScalePlugin
     * @param {Event} target
     * @param {string} control
     */


    _createClass(HitAreaScalePlugin, [{
      key: "onHitAreaScaleChange",
      value: function onHitAreaScaleChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(HitAreaScalePlugin.hitAreaScaleKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof HitAreaScalePlugin
       */

    }], [{
      key: "hitAreaScaleKey",
      get: function get() {
        return 'hitAreaScale';
      }
    }]);

    return HitAreaScalePlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class DragThresholdScalePlugin
   * @extends {SliderPlugin}
   */

  var DragThresholdScalePlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(DragThresholdScalePlugin, _SliderPlugin);

    /**
     *Creates an instance of DragThresholdScalePlugin.
     * @param {object} params
     * @param {string | HTMLElement} params.dragThresholdScaleSliders
     * @param {number} [params.defaultDragThresholdScale=0.5]
     * @memberof DragThresholdScalePlugin
     */
    function DragThresholdScalePlugin(dragThresholdScaleSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultDragThres = _ref.defaultDragThresholdScale,
          defaultDragThresholdScale = _ref$defaultDragThres === void 0 ? 0.5 : _ref$defaultDragThres;

      _classCallCheck(this, DragThresholdScalePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(DragThresholdScalePlugin).call(this, dragThresholdScaleSliders, 'Drag-Threshold-Scale-Plugin', {
        defaultValue: defaultDragThresholdScale,
        featureName: DragThresholdScalePlugin.dragThresholdScaleKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onDragThresholdScaleChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof DragThresholdScalePlugin
     * @param {Event} target
     * @param {string} control
     */


    _createClass(DragThresholdScalePlugin, [{
      key: "onDragThresholdScaleChange",
      value: function onDragThresholdScaleChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(DragThresholdScalePlugin.dragThresholdScaleKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof DragThresholdScalePlugin
       */

    }], [{
      key: "dragThresholdScaleKey",
      get: function get() {
        return 'dragThresholdScale';
      }
    }]);

    return DragThresholdScalePlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class HealthPlugin
   * @extends {SliderPlugin}
   */

  var HealthPlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(HealthPlugin, _SliderPlugin);

    /**
     *Creates an instance of HealthPlugin.
     * @param {object} params
     * @param {string | HTMLElement} params.healthSliders
     * @param {number} [params.defaultHealth=0.5]
     * @memberof HealthPlugin
     */
    function HealthPlugin(healthSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultHealth = _ref.defaultHealth,
          defaultHealth = _ref$defaultHealth === void 0 ? 0.5 : _ref$defaultHealth;

      _classCallCheck(this, HealthPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HealthPlugin).call(this, healthSliders, 'Health-Scale-Plugin', {
        defaultValue: defaultHealth,
        featureName: HealthPlugin.healthKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onHealthChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof HealthPlugin
     * @param {Event} target
     * @param {string} control
     */


    _createClass(HealthPlugin, [{
      key: "onHealthChange",
      value: function onHealthChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(HealthPlugin.healthKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof HealthPlugin
       */

    }], [{
      key: "healthKey",
      get: function get() {
        return 'health';
      }
    }]);

    return HealthPlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class ObjectCountPlugin
   * @extends {SliderPlugin}
   */

  var ObjectCountPlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(ObjectCountPlugin, _SliderPlugin);

    /**
     *Creates an instance of ObjectCountPlugin.
     * @param {object} params
     * @param {string | HTMLElement} params.objectCountSliders
     * @param {number} [params.defaultObjectCount=0.5]
     * @memberof ObjectCountPlugin
     */
    function ObjectCountPlugin(objectCountSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultObjectCou = _ref.defaultObjectCount,
          defaultObjectCount = _ref$defaultObjectCou === void 0 ? 0.5 : _ref$defaultObjectCou;

      _classCallCheck(this, ObjectCountPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ObjectCountPlugin).call(this, objectCountSliders, 'Object-Count-Plugin', {
        defaultValue: defaultObjectCount,
        featureName: ObjectCountPlugin.objectCountKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onObjectCountChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof ObjectCountPlugin
     * @param {Event} target
     * @param {string} control
     */


    _createClass(ObjectCountPlugin, [{
      key: "onObjectCountChange",
      value: function onObjectCountChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(ObjectCountPlugin.objectCountKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof ObjectCountPlugin
       */

    }], [{
      key: "objectCountKey",
      get: function get() {
        return 'objectCount';
      }
    }]);

    return ObjectCountPlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class CompletionPercentagePlugin
   * @extends {SliderPlugin}
   */

  var CompletionPercentagePlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(CompletionPercentagePlugin, _SliderPlugin);

    /**
     *Creates an instance of CompletionPercentagePlugin.
     * @param {object} params
     * @param {string | HTMLElement} params.completionPercentageSliders
     * @param {number} [params.defaultCompletionPercentage=0.5]
     * @memberof CompletionPercentagePlugin
     */
    function CompletionPercentagePlugin(completionPercentageSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultCompletio = _ref.defaultCompletionPercentage,
          defaultCompletionPercentage = _ref$defaultCompletio === void 0 ? 0.5 : _ref$defaultCompletio;

      _classCallCheck(this, CompletionPercentagePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CompletionPercentagePlugin).call(this, completionPercentageSliders, 'Completion-Percentage-Plugin', {
        defaultValue: defaultCompletionPercentage,
        featureName: CompletionPercentagePlugin.completionPercentageKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onCompletionPercentageChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof CompletionPercentagePlugin
     * @param {Event} target
     * @param {string} control
     */


    _createClass(CompletionPercentagePlugin, [{
      key: "onCompletionPercentageChange",
      value: function onCompletionPercentageChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(CompletionPercentagePlugin.completionPercentageKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof CompletionPercentagePlugin
       */

    }], [{
      key: "completionPercentageKey",
      get: function get() {
        return 'completionPercentage';
      }
    }]);

    return CompletionPercentagePlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class SpeedScalePlugin
   * @extends {SliderPlugin}
   */

  var SpeedScalePlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(SpeedScalePlugin, _SliderPlugin);

    /**
     *Creates an instance of SpeedScalePlugin.
     * @param {object} params
     * @param {string | HTMLElement} params.speedScaleSliders
     * @param {number} [params.defaultSpeedScale=0.5]
     * @memberof SpeedScalePlugin
     */
    function SpeedScalePlugin(speedScaleSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultSpeedScal = _ref.defaultSpeedScale,
          defaultSpeedScale = _ref$defaultSpeedScal === void 0 ? 0.5 : _ref$defaultSpeedScal;

      _classCallCheck(this, SpeedScalePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(SpeedScalePlugin).call(this, speedScaleSliders, 'Speed-Scale-Plugin', {
        defaultValue: defaultSpeedScale,
        featureName: SpeedScalePlugin.speedScaleKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onSpeedScaleChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof SpeedScalePlugin
     * @param {Event} target
     * @param {string} control
     */


    _createClass(SpeedScalePlugin, [{
      key: "onSpeedScaleChange",
      value: function onSpeedScaleChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(SpeedScalePlugin.speedScaleKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof SpeedScalePlugin
       */

    }], [{
      key: "speedScaleKey",
      get: function get() {
        return 'speedScale';
      }
    }]);

    return SpeedScalePlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class TimersScalePlugin
   * @extends {SliderPlugin}
   */

  var TimersScalePlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(TimersScalePlugin, _SliderPlugin);

    /**
     *Creates an instance of TimersScalePlugin.
     * @param {object} params
     * @param {string | HTMLElement} params.timersScaleSliders
     * @param {number} [params.defaultTimersScale=0.5]
     * @memberof TimersScalePlugin
     */
    function TimersScalePlugin(timersScaleSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultTimersSca = _ref.defaultTimersScale,
          defaultTimersScale = _ref$defaultTimersSca === void 0 ? 0.5 : _ref$defaultTimersSca;

      _classCallCheck(this, TimersScalePlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(TimersScalePlugin).call(this, timersScaleSliders, 'Timers-Scale-Plugin', {
        defaultValue: defaultTimersScale,
        featureName: TimersScalePlugin.timersScaleKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onTimersScaleChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof TimersScalePlugin
     * @param {Event} target
     * @param {string} control
     */


    _createClass(TimersScalePlugin, [{
      key: "onTimersScaleChange",
      value: function onTimersScaleChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(TimersScalePlugin.timersScaleKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof TimersScalePlugin
       */

    }], [{
      key: "timersScaleKey",
      get: function get() {
        return 'timersScale';
      }
    }]);

    return TimersScalePlugin;
  }(SliderPlugin);

  /**
   * @export
   * @class InputCountPlugin
   * @extends {SliderPlugin}
   */

  var InputCountPlugin =
  /*#__PURE__*/
  function (_SliderPlugin) {
    _inherits(InputCountPlugin, _SliderPlugin);

    /**
     *Creates an instance of InputCountPlugin.
     * @param {object} params
     * @param {string | HTMLElement} params.inputCountSliders
     * @param {number} [params.defaultInputCount=0.5]
     * @memberof InputCountPlugin
     */
    function InputCountPlugin(inputCountSliders) {
      var _this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$defaultInputCoun = _ref.defaultInputCount,
          defaultInputCount = _ref$defaultInputCoun === void 0 ? 0.5 : _ref$defaultInputCoun;

      _classCallCheck(this, InputCountPlugin);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(InputCountPlugin).call(this, inputCountSliders, 'Input-Count-Plugin', {
        defaultValue: defaultInputCount,
        featureName: InputCountPlugin.inputCountKey
      }));

      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onInputCountChange.bind(_assertThisInitialized(_this)));
      }

      return _this;
    }
    /**
     * @memberof InputCountPlugin
     * @param {Event} target
     * @param {string} control
     */


    _createClass(InputCountPlugin, [{
      key: "onInputCountChange",
      value: function onInputCountChange(e) {
        this.currentValue = e.target.value;
        this.sendProperty(InputCountPlugin.inputCountKey, this.currentValue);
      }
      /**
       * @readonly
       * @static
       * @memberof InputCountPlugin
       */

    }], [{
      key: "inputCountKey",
      get: function get() {
        return 'inputCount';
      }
    }]);

    return InputCountPlugin;
  }(SliderPlugin);

  //Polyfills for IE11

  exports.BasePlugin = BasePlugin;
  exports.Button = Button;
  exports.ButtonPlugin = ButtonPlugin;
  exports.ButtonSizePlugin = ButtonSizePlugin;
  exports.CaptionsStylePlugin = CaptionsStylePlugin;
  exports.CaptionsTogglePlugin = CaptionsTogglePlugin;
  exports.ColorVisionPlugin = ColorVisionPlugin;
  exports.CompletionPercentagePlugin = CompletionPercentagePlugin;
  exports.Container = Container;
  exports.ControlSensitivityPlugin = ControlSensitivityPlugin;
  exports.DragThresholdScalePlugin = DragThresholdScalePlugin;
  exports.Features = Features;
  exports.HUDPlugin = HUDPlugin;
  exports.HealthPlugin = HealthPlugin;
  exports.HelpPlugin = HelpPlugin;
  exports.HitAreaScalePlugin = HitAreaScalePlugin;
  exports.InputCountPlugin = InputCountPlugin;
  exports.KeyboardMapPlugin = KeyboardMapPlugin;
  exports.LayersPlugin = LayersPlugin;
  exports.ObjectCountPlugin = ObjectCountPlugin;
  exports.PageVisibility = PageVisibility;
  exports.PausePlugin = PausePlugin;
  exports.PointerSizePlugin = PointerSizePlugin;
  exports.RadioGroup = RadioGroup;
  exports.RadioGroupPlugin = RadioGroupPlugin;
  exports.SavedData = SavedData;
  exports.SavedDataHandler = SavedDataHandler;
  exports.Slider = Slider;
  exports.SliderPlugin = SliderPlugin;
  exports.SoundPlugin = SoundPlugin;
  exports.SpeedScalePlugin = SpeedScalePlugin;
  exports.TimersScalePlugin = TimersScalePlugin;
  exports.UserDataPlugin = UserDataPlugin;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
