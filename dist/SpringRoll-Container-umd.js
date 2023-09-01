(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.springroll = global.springroll || {}));
})(this, (function (exports) { 'use strict';

  var global$o = typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof global$o !== 'undefined' && global$o;
  var support = {
    searchParams: 'URLSearchParams' in global$o,
    iterable: 'Symbol' in global$o && 'iterator' in Symbol,
    blob: 'FileReader' in global$o && 'Blob' in global$o && function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    }(),
    formData: 'FormData' in global$o,
    arrayBuffer: 'ArrayBuffer' in global$o
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
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
      throw new TypeError('Invalid character in header field name: "' + name + '"');
    }
    return name.toLowerCase();
  }
  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value;
  }

  // Build a destructive iterator for the value list
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
      /*
        fetch-mock wraps the Response object in an ES6 Proxy to
        provide useful test harness features such as flush. However, on
        ES5 browsers without fetch or Proxy support pollyfills must be used;
        the proxy-pollyfill is unable to proxy an attribute unless it exists
        on the object before the Proxy is created. This change ensures
        Response.bodyUsed exists on the instance, while maintaining the
        semantic of setting Request.bodyUsed in the constructor before
        _initBody is called.
      */
      this.bodyUsed = this.bodyUsed;
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
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
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
          var isConsumed = consumed(this);
          if (isConsumed) {
            return isConsumed;
          }
          if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
            return Promise.resolve(this._bodyArrayBuffer.buffer.slice(this._bodyArrayBuffer.byteOffset, this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength));
          } else {
            return Promise.resolve(this._bodyArrayBuffer);
          }
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
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }
  function Request(input, options) {
    if (!(this instanceof Request)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
    }
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
    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        // Search for a '_' parameter in the query string
        var reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          // If it already exists then set the value with the current time
          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
        } else {
          // Otherwise add a new '_' parameter to the end with the current time
          var reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
        }
      }
    }
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
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
    // https://github.com/github/fetch/issues/748
    // https://github.com/zloirock/core-js/issues/751
    preProcessedHeaders.split('\r').map(function (header) {
      return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header;
    }).forEach(function (line) {
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
    if (!(this instanceof Response)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
    }
    if (!options) {
      options = {};
    }
    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
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
  var DOMException = global$o.DOMException;
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
        setTimeout(function () {
          resolve(new Response(body, options));
        }, 0);
      };
      xhr.onerror = function () {
        setTimeout(function () {
          reject(new TypeError('Network request failed'));
        }, 0);
      };
      xhr.ontimeout = function () {
        setTimeout(function () {
          reject(new TypeError('Network request failed'));
        }, 0);
      };
      xhr.onabort = function () {
        setTimeout(function () {
          reject(new DOMException('Aborted', 'AbortError'));
        }, 0);
      };
      function fixUrl(url) {
        try {
          return url === '' && global$o.location.href ? global$o.location.href : url;
        } catch (e) {
          return url;
        }
      }
      xhr.open(request.method, fixUrl(request.url), true);
      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }
      if ('responseType' in xhr) {
        if (support.blob) {
          xhr.responseType = 'blob';
        } else if (support.arrayBuffer && request.headers.get('Content-Type') && request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1) {
          xhr.responseType = 'arraybuffer';
        }
      }
      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        Object.getOwnPropertyNames(init.headers).forEach(function (name) {
          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
        });
      } else {
        request.headers.forEach(function (value, name) {
          xhr.setRequestHeader(name, value);
        });
      }
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
  if (!global$o.fetch) {
    global$o.fetch = fetch$1;
    global$o.Headers = Headers;
    global$o.Request = Request;
    global$o.Response = Response;
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var check = function (it) {
    return it && it.Math == Math && it;
  };

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global$n =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  function () {
    return this;
  }() || Function('return this')();

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

  var documentAll$2 = typeof document == 'object' && document.all;

  // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
  // eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
  var IS_HTMLDDA = typeof documentAll$2 == 'undefined' && documentAll$2 !== undefined;
  var documentAll_1 = {
    all: documentAll$2,
    IS_HTMLDDA: IS_HTMLDDA
  };

  var $documentAll$1 = documentAll_1;
  var documentAll$1 = $documentAll$1.all;

  // `IsCallable` abstract operation
  // https://tc39.es/ecma262/#sec-iscallable
  var isCallable$m = $documentAll$1.IS_HTMLDDA ? function (argument) {
    return typeof argument == 'function' || argument === documentAll$1;
  } : function (argument) {
    return typeof argument == 'function';
  };

  var isCallable$l = isCallable$m;
  var $documentAll = documentAll_1;
  var documentAll = $documentAll.all;
  var isObject$f = $documentAll.IS_HTMLDDA ? function (it) {
    return typeof it == 'object' ? it !== null : isCallable$l(it) || it === documentAll;
  } : function (it) {
    return typeof it == 'object' ? it !== null : isCallable$l(it);
  };

  var global$m = global$n;
  var isObject$e = isObject$f;
  var document$3 = global$m.document;
  // typeof document.createElement is 'object' in old IE
  var EXISTS$1 = isObject$e(document$3) && isObject$e(document$3.createElement);
  var documentCreateElement$2 = function (it) {
    return EXISTS$1 ? document$3.createElement(it) : {};
  };

  // in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
  var documentCreateElement$1 = documentCreateElement$2;
  var classList = documentCreateElement$1('span').classList;
  var DOMTokenListPrototype$2 = classList && classList.constructor && classList.constructor.prototype;
  var domTokenListPrototype = DOMTokenListPrototype$2 === Object.prototype ? undefined : DOMTokenListPrototype$2;

  var fails$s = function (exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  var fails$r = fails$s;
  var functionBindNative = !fails$r(function () {
    // eslint-disable-next-line es/no-function-prototype-bind -- safe
    var test = function () {/* empty */}.bind();
    // eslint-disable-next-line no-prototype-builtins -- safe
    return typeof test != 'function' || test.hasOwnProperty('prototype');
  });

  var NATIVE_BIND$3 = functionBindNative;
  var FunctionPrototype$2 = Function.prototype;
  var call$g = FunctionPrototype$2.call;
  var uncurryThisWithBind = NATIVE_BIND$3 && FunctionPrototype$2.bind.bind(call$g, call$g);
  var functionUncurryThis = NATIVE_BIND$3 ? uncurryThisWithBind : function (fn) {
    return function () {
      return call$g.apply(fn, arguments);
    };
  };

  var uncurryThis$p = functionUncurryThis;
  var toString$8 = uncurryThis$p({}.toString);
  var stringSlice$4 = uncurryThis$p(''.slice);
  var classofRaw$2 = function (it) {
    return stringSlice$4(toString$8(it), 8, -1);
  };

  var classofRaw$1 = classofRaw$2;
  var uncurryThis$o = functionUncurryThis;
  var functionUncurryThisClause = function (fn) {
    // Nashorn bug:
    //   https://github.com/zloirock/core-js/issues/1128
    //   https://github.com/zloirock/core-js/issues/1130
    if (classofRaw$1(fn) === 'Function') return uncurryThis$o(fn);
  };

  var $String$4 = String;
  var tryToString$4 = function (argument) {
    try {
      return $String$4(argument);
    } catch (error) {
      return 'Object';
    }
  };

  var isCallable$k = isCallable$m;
  var tryToString$3 = tryToString$4;
  var $TypeError$e = TypeError;

  // `Assert: IsCallable(argument) is true`
  var aCallable$8 = function (argument) {
    if (isCallable$k(argument)) return argument;
    throw $TypeError$e(tryToString$3(argument) + ' is not a function');
  };

  var uncurryThis$n = functionUncurryThisClause;
  var aCallable$7 = aCallable$8;
  var NATIVE_BIND$2 = functionBindNative;
  var bind$6 = uncurryThis$n(uncurryThis$n.bind);

  // optional / simple context binding
  var functionBindContext = function (fn, that) {
    aCallable$7(fn);
    return that === undefined ? fn : NATIVE_BIND$2 ? bind$6(fn, that) : function /* ...args */
    () {
      return fn.apply(that, arguments);
    };
  };

  var uncurryThis$m = functionUncurryThis;
  var fails$q = fails$s;
  var classof$a = classofRaw$2;
  var $Object$4 = Object;
  var split = uncurryThis$m(''.split);

  // fallback for non-array-like ES3 and non-enumerable old V8 strings
  var indexedObject = fails$q(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins -- safe
    return !$Object$4('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classof$a(it) == 'String' ? split(it, '') : $Object$4(it);
  } : $Object$4;

  // we can't use just `it == null` since of `document.all` special case
  // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
  var isNullOrUndefined$6 = function (it) {
    return it === null || it === undefined;
  };

  var isNullOrUndefined$5 = isNullOrUndefined$6;
  var $TypeError$d = TypeError;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.es/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible$5 = function (it) {
    if (isNullOrUndefined$5(it)) throw $TypeError$d("Can't call method on " + it);
    return it;
  };

  var requireObjectCoercible$4 = requireObjectCoercible$5;
  var $Object$3 = Object;

  // `ToObject` abstract operation
  // https://tc39.es/ecma262/#sec-toobject
  var toObject$6 = function (argument) {
    return $Object$3(requireObjectCoercible$4(argument));
  };

  var ceil = Math.ceil;
  var floor = Math.floor;

  // `Math.trunc` method
  // https://tc39.es/ecma262/#sec-math.trunc
  // eslint-disable-next-line es/no-math-trunc -- safe
  var mathTrunc = Math.trunc || function trunc(x) {
    var n = +x;
    return (n > 0 ? floor : ceil)(n);
  };

  var trunc = mathTrunc;

  // `ToIntegerOrInfinity` abstract operation
  // https://tc39.es/ecma262/#sec-tointegerorinfinity
  var toIntegerOrInfinity$3 = function (argument) {
    var number = +argument;
    // eslint-disable-next-line no-self-compare -- NaN check
    return number !== number || number === 0 ? 0 : trunc(number);
  };

  var toIntegerOrInfinity$2 = toIntegerOrInfinity$3;
  var min$1 = Math.min;

  // `ToLength` abstract operation
  // https://tc39.es/ecma262/#sec-tolength
  var toLength$1 = function (argument) {
    return argument > 0 ? min$1(toIntegerOrInfinity$2(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var toLength = toLength$1;

  // `LengthOfArrayLike` abstract operation
  // https://tc39.es/ecma262/#sec-lengthofarraylike
  var lengthOfArrayLike$5 = function (obj) {
    return toLength(obj.length);
  };

  var classof$9 = classofRaw$2;

  // `IsArray` abstract operation
  // https://tc39.es/ecma262/#sec-isarray
  // eslint-disable-next-line es/no-array-isarray -- safe
  var isArray$2 = Array.isArray || function isArray(argument) {
    return classof$9(argument) == 'Array';
  };

  var shared$4 = {exports: {}};

  var isPure = false;

  var global$l = global$n;

  // eslint-disable-next-line es/no-object-defineproperty -- safe
  var defineProperty$8 = Object.defineProperty;
  var defineGlobalProperty$3 = function (key, value) {
    try {
      defineProperty$8(global$l, key, {
        value: value,
        configurable: true,
        writable: true
      });
    } catch (error) {
      global$l[key] = value;
    }
    return value;
  };

  var global$k = global$n;
  var defineGlobalProperty$2 = defineGlobalProperty$3;
  var SHARED = '__core-js_shared__';
  var store$3 = global$k[SHARED] || defineGlobalProperty$2(SHARED, {});
  var sharedStore = store$3;

  var store$2 = sharedStore;
  (shared$4.exports = function (key, value) {
    return store$2[key] || (store$2[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.28.0',
    mode: 'global',
    copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
    license: 'https://github.com/zloirock/core-js/blob/v3.28.0/LICENSE',
    source: 'https://github.com/zloirock/core-js'
  });
  var sharedExports = shared$4.exports;

  var uncurryThis$l = functionUncurryThis;
  var toObject$5 = toObject$6;
  var hasOwnProperty = uncurryThis$l({}.hasOwnProperty);

  // `HasOwnProperty` abstract operation
  // https://tc39.es/ecma262/#sec-hasownproperty
  // eslint-disable-next-line es/no-object-hasown -- safe
  var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
    return hasOwnProperty(toObject$5(it), key);
  };

  var uncurryThis$k = functionUncurryThis;
  var id$1 = 0;
  var postfix = Math.random();
  var toString$7 = uncurryThis$k(1.0.toString);
  var uid$3 = function (key) {
    return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$7(++id$1 + postfix, 36);
  };

  var engineUserAgent = typeof navigator != 'undefined' && String(navigator.userAgent) || '';

  var global$j = global$n;
  var userAgent$3 = engineUserAgent;
  var process$4 = global$j.process;
  var Deno$1 = global$j.Deno;
  var versions = process$4 && process$4.versions || Deno$1 && Deno$1.version;
  var v8 = versions && versions.v8;
  var match, version$1;
  if (v8) {
    match = v8.split('.');
    // in old Chrome, versions of V8 isn't V8 = Chrome / 10
    // but their correct versions are not interesting for us
    version$1 = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
  }

  // BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
  // so check `userAgent` even if `.v8` exists, but 0
  if (!version$1 && userAgent$3) {
    match = userAgent$3.match(/Edge\/(\d+)/);
    if (!match || match[1] >= 74) {
      match = userAgent$3.match(/Chrome\/(\d+)/);
      if (match) version$1 = +match[1];
    }
  }
  var engineV8Version = version$1;

  /* eslint-disable es/no-symbol -- required for testing */
  var V8_VERSION$3 = engineV8Version;
  var fails$p = fails$s;

  // eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
  var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails$p(function () {
    var symbol = Symbol();
    // Chrome 38 Symbol has incorrect toString conversion
    // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
    return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION$3 && V8_VERSION$3 < 41;
  });

  /* eslint-disable es/no-symbol -- required for testing */
  var NATIVE_SYMBOL$1 = symbolConstructorDetection;
  var useSymbolAsUid = NATIVE_SYMBOL$1 && !Symbol.sham && typeof Symbol.iterator == 'symbol';

  var global$i = global$n;
  var shared$3 = sharedExports;
  var hasOwn$c = hasOwnProperty_1;
  var uid$2 = uid$3;
  var NATIVE_SYMBOL = symbolConstructorDetection;
  var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;
  var Symbol$1 = global$i.Symbol;
  var WellKnownSymbolsStore = shared$3('wks');
  var createWellKnownSymbol = USE_SYMBOL_AS_UID$1 ? Symbol$1['for'] || Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$2;
  var wellKnownSymbol$j = function (name) {
    if (!hasOwn$c(WellKnownSymbolsStore, name)) {
      WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn$c(Symbol$1, name) ? Symbol$1[name] : createWellKnownSymbol('Symbol.' + name);
    }
    return WellKnownSymbolsStore[name];
  };

  var wellKnownSymbol$i = wellKnownSymbol$j;
  var TO_STRING_TAG$3 = wellKnownSymbol$i('toStringTag');
  var test = {};
  test[TO_STRING_TAG$3] = 'z';
  var toStringTagSupport = String(test) === '[object z]';

  var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
  var isCallable$j = isCallable$m;
  var classofRaw = classofRaw$2;
  var wellKnownSymbol$h = wellKnownSymbol$j;
  var TO_STRING_TAG$2 = wellKnownSymbol$h('toStringTag');
  var $Object$2 = Object;

  // ES3 wrong here
  var CORRECT_ARGUMENTS = classofRaw(function () {
    return arguments;
  }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (error) {/* empty */}
  };

  // getting tag from ES6+ `Object.prototype.toString`
  var classof$8 = TO_STRING_TAG_SUPPORT$2 ? classofRaw : function (it) {
    var O, tag, result;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object$2(it), TO_STRING_TAG$2)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && isCallable$j(O.callee) ? 'Arguments' : result;
  };

  var global$h = global$n;
  var isCallable$i = isCallable$m;
  var aFunction = function (argument) {
    return isCallable$i(argument) ? argument : undefined;
  };
  var getBuiltIn$7 = function (namespace, method) {
    return arguments.length < 2 ? aFunction(global$h[namespace]) : global$h[namespace] && global$h[namespace][method];
  };

  var uncurryThis$j = functionUncurryThis;
  var isCallable$h = isCallable$m;
  var store$1 = sharedStore;
  var functionToString = uncurryThis$j(Function.toString);

  // this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
  if (!isCallable$h(store$1.inspectSource)) {
    store$1.inspectSource = function (it) {
      return functionToString(it);
    };
  }
  var inspectSource$3 = store$1.inspectSource;

  var uncurryThis$i = functionUncurryThis;
  var fails$o = fails$s;
  var isCallable$g = isCallable$m;
  var classof$7 = classof$8;
  var getBuiltIn$6 = getBuiltIn$7;
  var inspectSource$2 = inspectSource$3;
  var noop = function () {/* empty */};
  var empty = [];
  var construct = getBuiltIn$6('Reflect', 'construct');
  var constructorRegExp = /^\s*(?:class|function)\b/;
  var exec$1 = uncurryThis$i(constructorRegExp.exec);
  var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);
  var isConstructorModern = function isConstructor(argument) {
    if (!isCallable$g(argument)) return false;
    try {
      construct(noop, empty, argument);
      return true;
    } catch (error) {
      return false;
    }
  };
  var isConstructorLegacy = function isConstructor(argument) {
    if (!isCallable$g(argument)) return false;
    switch (classof$7(argument)) {
      case 'AsyncFunction':
      case 'GeneratorFunction':
      case 'AsyncGeneratorFunction':
        return false;
    }
    try {
      // we can't check .prototype since constructors produced by .bind haven't it
      // `Function#toString` throws on some built-it function in some legacy engines
      // (for example, `DOMQuad` and similar in FF41-)
      return INCORRECT_TO_STRING || !!exec$1(constructorRegExp, inspectSource$2(argument));
    } catch (error) {
      return true;
    }
  };
  isConstructorLegacy.sham = true;

  // `IsConstructor` abstract operation
  // https://tc39.es/ecma262/#sec-isconstructor
  var isConstructor$2 = !construct || fails$o(function () {
    var called;
    return isConstructorModern(isConstructorModern.call) || !isConstructorModern(Object) || !isConstructorModern(function () {
      called = true;
    }) || called;
  }) ? isConstructorLegacy : isConstructorModern;

  var isArray$1 = isArray$2;
  var isConstructor$1 = isConstructor$2;
  var isObject$d = isObject$f;
  var wellKnownSymbol$g = wellKnownSymbol$j;
  var SPECIES$4 = wellKnownSymbol$g('species');
  var $Array$1 = Array;

  // a part of `ArraySpeciesCreate` abstract operation
  // https://tc39.es/ecma262/#sec-arrayspeciescreate
  var arraySpeciesConstructor$1 = function (originalArray) {
    var C;
    if (isArray$1(originalArray)) {
      C = originalArray.constructor;
      // cross-realm fallback
      if (isConstructor$1(C) && (C === $Array$1 || isArray$1(C.prototype))) C = undefined;else if (isObject$d(C)) {
        C = C[SPECIES$4];
        if (C === null) C = undefined;
      }
    }
    return C === undefined ? $Array$1 : C;
  };

  var arraySpeciesConstructor = arraySpeciesConstructor$1;

  // `ArraySpeciesCreate` abstract operation
  // https://tc39.es/ecma262/#sec-arrayspeciescreate
  var arraySpeciesCreate$2 = function (originalArray, length) {
    return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
  };

  var bind$5 = functionBindContext;
  var uncurryThis$h = functionUncurryThis;
  var IndexedObject$2 = indexedObject;
  var toObject$4 = toObject$6;
  var lengthOfArrayLike$4 = lengthOfArrayLike$5;
  var arraySpeciesCreate$1 = arraySpeciesCreate$2;
  var push$2 = uncurryThis$h([].push);

  // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
  var createMethod$4 = function (TYPE) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var IS_FILTER_REJECT = TYPE == 7;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    return function ($this, callbackfn, that, specificCreate) {
      var O = toObject$4($this);
      var self = IndexedObject$2(O);
      var boundFunction = bind$5(callbackfn, that);
      var length = lengthOfArrayLike$4(self);
      var index = 0;
      var create = specificCreate || arraySpeciesCreate$1;
      var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
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
              push$2(target, value);
            // filter
          } else switch (TYPE) {
            case 4:
              return false;
            // every
            case 7:
              push$2(target, value);
            // filterReject
          }
        }
      }

      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
    };
  };
  var arrayIteration = {
    // `Array.prototype.forEach` method
    // https://tc39.es/ecma262/#sec-array.prototype.foreach
    forEach: createMethod$4(0),
    // `Array.prototype.map` method
    // https://tc39.es/ecma262/#sec-array.prototype.map
    map: createMethod$4(1),
    // `Array.prototype.filter` method
    // https://tc39.es/ecma262/#sec-array.prototype.filter
    filter: createMethod$4(2),
    // `Array.prototype.some` method
    // https://tc39.es/ecma262/#sec-array.prototype.some
    some: createMethod$4(3),
    // `Array.prototype.every` method
    // https://tc39.es/ecma262/#sec-array.prototype.every
    every: createMethod$4(4),
    // `Array.prototype.find` method
    // https://tc39.es/ecma262/#sec-array.prototype.find
    find: createMethod$4(5),
    // `Array.prototype.findIndex` method
    // https://tc39.es/ecma262/#sec-array.prototype.findIndex
    findIndex: createMethod$4(6),
    // `Array.prototype.filterReject` method
    // https://github.com/tc39/proposal-array-filtering
    filterReject: createMethod$4(7)
  };

  var fails$n = fails$s;
  var arrayMethodIsStrict$2 = function (METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return !!method && fails$n(function () {
      // eslint-disable-next-line no-useless-call -- required for testing
      method.call(null, argument || function () {
        return 1;
      }, 1);
    });
  };

  var $forEach = arrayIteration.forEach;
  var arrayMethodIsStrict$1 = arrayMethodIsStrict$2;
  var STRICT_METHOD = arrayMethodIsStrict$1('forEach');

  // `Array.prototype.forEach` method implementation
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  var arrayForEach = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
    return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    // eslint-disable-next-line es/no-array-prototype-foreach -- safe
  } : [].forEach;

  var fails$m = fails$s;

  // Detect IE8's incomplete defineProperty implementation
  var descriptors = !fails$m(function () {
    // eslint-disable-next-line es/no-object-defineproperty -- required for testing
    return Object.defineProperty({}, 1, {
      get: function () {
        return 7;
      }
    })[1] != 7;
  });

  var objectDefineProperty = {};

  var DESCRIPTORS$d = descriptors;
  var fails$l = fails$s;
  var createElement$1 = documentCreateElement$2;

  // Thanks to IE8 for its funny defineProperty
  var ie8DomDefine = !DESCRIPTORS$d && !fails$l(function () {
    // eslint-disable-next-line es/no-object-defineproperty -- required for testing
    return Object.defineProperty(createElement$1('div'), 'a', {
      get: function () {
        return 7;
      }
    }).a != 7;
  });

  var DESCRIPTORS$c = descriptors;
  var fails$k = fails$s;

  // V8 ~ Chrome 36-
  // https://bugs.chromium.org/p/v8/issues/detail?id=3334
  var v8PrototypeDefineBug = DESCRIPTORS$c && fails$k(function () {
    // eslint-disable-next-line es/no-object-defineproperty -- required for testing
    return Object.defineProperty(function () {/* empty */}, 'prototype', {
      value: 42,
      writable: false
    }).prototype != 42;
  });

  var isObject$c = isObject$f;
  var $String$3 = String;
  var $TypeError$c = TypeError;

  // `Assert: Type(argument) is Object`
  var anObject$c = function (argument) {
    if (isObject$c(argument)) return argument;
    throw $TypeError$c($String$3(argument) + ' is not an object');
  };

  var NATIVE_BIND$1 = functionBindNative;
  var call$f = Function.prototype.call;
  var functionCall = NATIVE_BIND$1 ? call$f.bind(call$f) : function () {
    return call$f.apply(call$f, arguments);
  };

  var uncurryThis$g = functionUncurryThis;
  var objectIsPrototypeOf = uncurryThis$g({}.isPrototypeOf);

  var getBuiltIn$5 = getBuiltIn$7;
  var isCallable$f = isCallable$m;
  var isPrototypeOf$4 = objectIsPrototypeOf;
  var USE_SYMBOL_AS_UID = useSymbolAsUid;
  var $Object$1 = Object;
  var isSymbol$3 = USE_SYMBOL_AS_UID ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    var $Symbol = getBuiltIn$5('Symbol');
    return isCallable$f($Symbol) && isPrototypeOf$4($Symbol.prototype, $Object$1(it));
  };

  var aCallable$6 = aCallable$8;
  var isNullOrUndefined$4 = isNullOrUndefined$6;

  // `GetMethod` abstract operation
  // https://tc39.es/ecma262/#sec-getmethod
  var getMethod$3 = function (V, P) {
    var func = V[P];
    return isNullOrUndefined$4(func) ? undefined : aCallable$6(func);
  };

  var call$e = functionCall;
  var isCallable$e = isCallable$m;
  var isObject$b = isObject$f;
  var $TypeError$b = TypeError;

  // `OrdinaryToPrimitive` abstract operation
  // https://tc39.es/ecma262/#sec-ordinarytoprimitive
  var ordinaryToPrimitive$1 = function (input, pref) {
    var fn, val;
    if (pref === 'string' && isCallable$e(fn = input.toString) && !isObject$b(val = call$e(fn, input))) return val;
    if (isCallable$e(fn = input.valueOf) && !isObject$b(val = call$e(fn, input))) return val;
    if (pref !== 'string' && isCallable$e(fn = input.toString) && !isObject$b(val = call$e(fn, input))) return val;
    throw $TypeError$b("Can't convert object to primitive value");
  };

  var call$d = functionCall;
  var isObject$a = isObject$f;
  var isSymbol$2 = isSymbol$3;
  var getMethod$2 = getMethod$3;
  var ordinaryToPrimitive = ordinaryToPrimitive$1;
  var wellKnownSymbol$f = wellKnownSymbol$j;
  var $TypeError$a = TypeError;
  var TO_PRIMITIVE = wellKnownSymbol$f('toPrimitive');

  // `ToPrimitive` abstract operation
  // https://tc39.es/ecma262/#sec-toprimitive
  var toPrimitive$2 = function (input, pref) {
    if (!isObject$a(input) || isSymbol$2(input)) return input;
    var exoticToPrim = getMethod$2(input, TO_PRIMITIVE);
    var result;
    if (exoticToPrim) {
      if (pref === undefined) pref = 'default';
      result = call$d(exoticToPrim, input, pref);
      if (!isObject$a(result) || isSymbol$2(result)) return result;
      throw $TypeError$a("Can't convert object to primitive value");
    }
    if (pref === undefined) pref = 'number';
    return ordinaryToPrimitive(input, pref);
  };

  var toPrimitive$1 = toPrimitive$2;
  var isSymbol$1 = isSymbol$3;

  // `ToPropertyKey` abstract operation
  // https://tc39.es/ecma262/#sec-topropertykey
  var toPropertyKey$3 = function (argument) {
    var key = toPrimitive$1(argument, 'string');
    return isSymbol$1(key) ? key : key + '';
  };

  var DESCRIPTORS$b = descriptors;
  var IE8_DOM_DEFINE$1 = ie8DomDefine;
  var V8_PROTOTYPE_DEFINE_BUG$1 = v8PrototypeDefineBug;
  var anObject$b = anObject$c;
  var toPropertyKey$2 = toPropertyKey$3;
  var $TypeError$9 = TypeError;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  var $defineProperty = Object.defineProperty;
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
  var ENUMERABLE = 'enumerable';
  var CONFIGURABLE$1 = 'configurable';
  var WRITABLE = 'writable';

  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  objectDefineProperty.f = DESCRIPTORS$b ? V8_PROTOTYPE_DEFINE_BUG$1 ? function defineProperty(O, P, Attributes) {
    anObject$b(O);
    P = toPropertyKey$2(P);
    anObject$b(Attributes);
    if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
      var current = $getOwnPropertyDescriptor$1(O, P);
      if (current && current[WRITABLE]) {
        O[P] = Attributes.value;
        Attributes = {
          configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
          enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
          writable: false
        };
      }
    }
    return $defineProperty(O, P, Attributes);
  } : $defineProperty : function defineProperty(O, P, Attributes) {
    anObject$b(O);
    P = toPropertyKey$2(P);
    anObject$b(Attributes);
    if (IE8_DOM_DEFINE$1) try {
      return $defineProperty(O, P, Attributes);
    } catch (error) {/* empty */}
    if ('get' in Attributes || 'set' in Attributes) throw $TypeError$9('Accessors not supported');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var createPropertyDescriptor$4 = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var DESCRIPTORS$a = descriptors;
  var definePropertyModule$4 = objectDefineProperty;
  var createPropertyDescriptor$3 = createPropertyDescriptor$4;
  var createNonEnumerableProperty$5 = DESCRIPTORS$a ? function (object, key, value) {
    return definePropertyModule$4.f(object, key, createPropertyDescriptor$3(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var global$g = global$n;
  var DOMIterables$1 = domIterables;
  var DOMTokenListPrototype$1 = domTokenListPrototype;
  var forEach = arrayForEach;
  var createNonEnumerableProperty$4 = createNonEnumerableProperty$5;
  var handlePrototype$1 = function (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
      createNonEnumerableProperty$4(CollectionPrototype, 'forEach', forEach);
    } catch (error) {
      CollectionPrototype.forEach = forEach;
    }
  };
  for (var COLLECTION_NAME$1 in DOMIterables$1) {
    if (DOMIterables$1[COLLECTION_NAME$1]) {
      handlePrototype$1(global$g[COLLECTION_NAME$1] && global$g[COLLECTION_NAME$1].prototype);
    }
  }
  handlePrototype$1(DOMTokenListPrototype$1);

  // toObject with fallback for non-array-like ES3 strings
  var IndexedObject$1 = indexedObject;
  var requireObjectCoercible$3 = requireObjectCoercible$5;
  var toIndexedObject$7 = function (it) {
    return IndexedObject$1(requireObjectCoercible$3(it));
  };

  var objectDefineProperties = {};

  var toIntegerOrInfinity$1 = toIntegerOrInfinity$3;
  var max$1 = Math.max;
  var min = Math.min;

  // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
  var toAbsoluteIndex$2 = function (index, length) {
    var integer = toIntegerOrInfinity$1(index);
    return integer < 0 ? max$1(integer + length, 0) : min(integer, length);
  };

  var toIndexedObject$6 = toIndexedObject$7;
  var toAbsoluteIndex$1 = toAbsoluteIndex$2;
  var lengthOfArrayLike$3 = lengthOfArrayLike$5;

  // `Array.prototype.{ indexOf, includes }` methods implementation
  var createMethod$3 = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject$6($this);
      var length = lengthOfArrayLike$3(O);
      var index = toAbsoluteIndex$1(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare -- NaN check
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare -- NaN check
        if (value != value) return true;
        // Array#indexOf ignores holes, Array#includes - not
      } else for (; length > index; index++) {
        if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
      }
      return !IS_INCLUDES && -1;
    };
  };
  var arrayIncludes = {
    // `Array.prototype.includes` method
    // https://tc39.es/ecma262/#sec-array.prototype.includes
    includes: createMethod$3(true),
    // `Array.prototype.indexOf` method
    // https://tc39.es/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod$3(false)
  };

  var hiddenKeys$5 = {};

  var uncurryThis$f = functionUncurryThis;
  var hasOwn$b = hasOwnProperty_1;
  var toIndexedObject$5 = toIndexedObject$7;
  var indexOf$1 = arrayIncludes.indexOf;
  var hiddenKeys$4 = hiddenKeys$5;
  var push$1 = uncurryThis$f([].push);
  var objectKeysInternal = function (object, names) {
    var O = toIndexedObject$5(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) !hasOwn$b(hiddenKeys$4, key) && hasOwn$b(O, key) && push$1(result, key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (hasOwn$b(O, key = names[i++])) {
      ~indexOf$1(result, key) || push$1(result, key);
    }
    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys$3 = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

  var internalObjectKeys$1 = objectKeysInternal;
  var enumBugKeys$2 = enumBugKeys$3;

  // `Object.keys` method
  // https://tc39.es/ecma262/#sec-object.keys
  // eslint-disable-next-line es/no-object-keys -- safe
  var objectKeys$3 = Object.keys || function keys(O) {
    return internalObjectKeys$1(O, enumBugKeys$2);
  };

  var DESCRIPTORS$9 = descriptors;
  var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
  var definePropertyModule$3 = objectDefineProperty;
  var anObject$a = anObject$c;
  var toIndexedObject$4 = toIndexedObject$7;
  var objectKeys$2 = objectKeys$3;

  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  // eslint-disable-next-line es/no-object-defineproperties -- safe
  objectDefineProperties.f = DESCRIPTORS$9 && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject$a(O);
    var props = toIndexedObject$4(Properties);
    var keys = objectKeys$2(Properties);
    var length = keys.length;
    var index = 0;
    var key;
    while (length > index) definePropertyModule$3.f(O, key = keys[index++], props[key]);
    return O;
  };

  var getBuiltIn$4 = getBuiltIn$7;
  var html$2 = getBuiltIn$4('document', 'documentElement');

  var shared$2 = sharedExports;
  var uid$1 = uid$3;
  var keys = shared$2('keys');
  var sharedKey$3 = function (key) {
    return keys[key] || (keys[key] = uid$1(key));
  };

  /* global ActiveXObject -- old IE, WSH */
  var anObject$9 = anObject$c;
  var definePropertiesModule = objectDefineProperties;
  var enumBugKeys$1 = enumBugKeys$3;
  var hiddenKeys$3 = hiddenKeys$5;
  var html$1 = html$2;
  var documentCreateElement = documentCreateElement$2;
  var sharedKey$2 = sharedKey$3;
  var GT = '>';
  var LT = '<';
  var PROTOTYPE = 'prototype';
  var SCRIPT = 'script';
  var IE_PROTO$1 = sharedKey$2('IE_PROTO');
  var EmptyConstructor = function () {/* empty */};
  var scriptTag = function (content) {
    return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
  };

  // Create object with fake `null` prototype: use ActiveX Object with cleared prototype
  var NullProtoObjectViaActiveX = function (activeXDocument) {
    activeXDocument.write(scriptTag(''));
    activeXDocument.close();
    var temp = activeXDocument.parentWindow.Object;
    activeXDocument = null; // avoid memory leak
    return temp;
  };

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var NullProtoObjectViaIFrame = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = documentCreateElement('iframe');
    var JS = 'java' + SCRIPT + ':';
    var iframeDocument;
    iframe.style.display = 'none';
    html$1.appendChild(iframe);
    // https://github.com/zloirock/core-js/issues/475
    iframe.src = String(JS);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(scriptTag('document.F=Object'));
    iframeDocument.close();
    return iframeDocument.F;
  };

  // Check for document.domain and active x support
  // No need to use active x approach when document.domain is not set
  // see https://github.com/es-shims/es5-shim/issues/150
  // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
  // avoid IE GC bug
  var activeXDocument;
  var NullProtoObject = function () {
    try {
      activeXDocument = new ActiveXObject('htmlfile');
    } catch (error) {/* ignore */}
    NullProtoObject = typeof document != 'undefined' ? document.domain && activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) // old IE
    : NullProtoObjectViaIFrame() : NullProtoObjectViaActiveX(activeXDocument); // WSH
    var length = enumBugKeys$1.length;
    while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys$1[length]];
    return NullProtoObject();
  };
  hiddenKeys$3[IE_PROTO$1] = true;

  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  // eslint-disable-next-line es/no-object-create -- safe
  var objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      EmptyConstructor[PROTOTYPE] = anObject$9(O);
      result = new EmptyConstructor();
      EmptyConstructor[PROTOTYPE] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = NullProtoObject();
    return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
  };

  var wellKnownSymbol$e = wellKnownSymbol$j;
  var create$3 = objectCreate;
  var defineProperty$7 = objectDefineProperty.f;
  var UNSCOPABLES = wellKnownSymbol$e('unscopables');
  var ArrayPrototype$1 = Array.prototype;

  // Array.prototype[@@unscopables]
  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
    defineProperty$7(ArrayPrototype$1, UNSCOPABLES, {
      configurable: true,
      value: create$3(null)
    });
  }

  // add a key to Array.prototype[@@unscopables]
  var addToUnscopables$3 = function (key) {
    ArrayPrototype$1[UNSCOPABLES][key] = true;
  };

  var iterators = {};

  var global$f = global$n;
  var isCallable$d = isCallable$m;
  var WeakMap$1 = global$f.WeakMap;
  var weakMapBasicDetection = isCallable$d(WeakMap$1) && /native code/.test(String(WeakMap$1));

  var NATIVE_WEAK_MAP = weakMapBasicDetection;
  var global$e = global$n;
  var isObject$9 = isObject$f;
  var createNonEnumerableProperty$3 = createNonEnumerableProperty$5;
  var hasOwn$a = hasOwnProperty_1;
  var shared$1 = sharedStore;
  var sharedKey$1 = sharedKey$3;
  var hiddenKeys$2 = hiddenKeys$5;
  var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
  var TypeError$3 = global$e.TypeError;
  var WeakMap = global$e.WeakMap;
  var set$1, get, has;
  var enforce = function (it) {
    return has(it) ? get(it) : set$1(it, {});
  };
  var getterFor = function (TYPE) {
    return function (it) {
      var state;
      if (!isObject$9(it) || (state = get(it)).type !== TYPE) {
        throw TypeError$3('Incompatible receiver, ' + TYPE + ' required');
      }
      return state;
    };
  };
  if (NATIVE_WEAK_MAP || shared$1.state) {
    var store = shared$1.state || (shared$1.state = new WeakMap());
    /* eslint-disable no-self-assign -- prototype methods protection */
    store.get = store.get;
    store.has = store.has;
    store.set = store.set;
    /* eslint-enable no-self-assign -- prototype methods protection */
    set$1 = function (it, metadata) {
      if (store.has(it)) throw TypeError$3(OBJECT_ALREADY_INITIALIZED);
      metadata.facade = it;
      store.set(it, metadata);
      return metadata;
    };
    get = function (it) {
      return store.get(it) || {};
    };
    has = function (it) {
      return store.has(it);
    };
  } else {
    var STATE = sharedKey$1('state');
    hiddenKeys$2[STATE] = true;
    set$1 = function (it, metadata) {
      if (hasOwn$a(it, STATE)) throw TypeError$3(OBJECT_ALREADY_INITIALIZED);
      metadata.facade = it;
      createNonEnumerableProperty$3(it, STATE, metadata);
      return metadata;
    };
    get = function (it) {
      return hasOwn$a(it, STATE) ? it[STATE] : {};
    };
    has = function (it) {
      return hasOwn$a(it, STATE);
    };
  }
  var internalState = {
    set: set$1,
    get: get,
    has: has,
    enforce: enforce,
    getterFor: getterFor
  };

  var objectGetOwnPropertyDescriptor = {};

  var objectPropertyIsEnumerable = {};

  var $propertyIsEnumerable$1 = {}.propertyIsEnumerable;
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var getOwnPropertyDescriptor$3 = Object.getOwnPropertyDescriptor;

  // Nashorn ~ JDK8 bug
  var NASHORN_BUG = getOwnPropertyDescriptor$3 && !$propertyIsEnumerable$1.call({
    1: 2
  }, 1);

  // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
  objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
    var descriptor = getOwnPropertyDescriptor$3(this, V);
    return !!descriptor && descriptor.enumerable;
  } : $propertyIsEnumerable$1;

  var DESCRIPTORS$8 = descriptors;
  var call$c = functionCall;
  var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
  var createPropertyDescriptor$2 = createPropertyDescriptor$4;
  var toIndexedObject$3 = toIndexedObject$7;
  var toPropertyKey$1 = toPropertyKey$3;
  var hasOwn$9 = hasOwnProperty_1;
  var IE8_DOM_DEFINE = ie8DomDefine;

  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
  objectGetOwnPropertyDescriptor.f = DESCRIPTORS$8 ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject$3(O);
    P = toPropertyKey$1(P);
    if (IE8_DOM_DEFINE) try {
      return $getOwnPropertyDescriptor(O, P);
    } catch (error) {/* empty */}
    if (hasOwn$9(O, P)) return createPropertyDescriptor$2(!call$c(propertyIsEnumerableModule$1.f, O, P), O[P]);
  };

  var makeBuiltIn$3 = {exports: {}};

  var DESCRIPTORS$7 = descriptors;
  var hasOwn$8 = hasOwnProperty_1;
  var FunctionPrototype$1 = Function.prototype;
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var getDescriptor = DESCRIPTORS$7 && Object.getOwnPropertyDescriptor;
  var EXISTS = hasOwn$8(FunctionPrototype$1, 'name');
  // additional protection from minified / mangled / dropped function names
  var PROPER = EXISTS && function something() {/* empty */}.name === 'something';
  var CONFIGURABLE = EXISTS && (!DESCRIPTORS$7 || DESCRIPTORS$7 && getDescriptor(FunctionPrototype$1, 'name').configurable);
  var functionName = {
    EXISTS: EXISTS,
    PROPER: PROPER,
    CONFIGURABLE: CONFIGURABLE
  };

  var uncurryThis$e = functionUncurryThis;
  var fails$j = fails$s;
  var isCallable$c = isCallable$m;
  var hasOwn$7 = hasOwnProperty_1;
  var DESCRIPTORS$6 = descriptors;
  var CONFIGURABLE_FUNCTION_NAME$1 = functionName.CONFIGURABLE;
  var inspectSource$1 = inspectSource$3;
  var InternalStateModule$4 = internalState;
  var enforceInternalState = InternalStateModule$4.enforce;
  var getInternalState$3 = InternalStateModule$4.get;
  var $String$2 = String;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  var defineProperty$6 = Object.defineProperty;
  var stringSlice$3 = uncurryThis$e(''.slice);
  var replace$2 = uncurryThis$e(''.replace);
  var join = uncurryThis$e([].join);
  var CONFIGURABLE_LENGTH = DESCRIPTORS$6 && !fails$j(function () {
    return defineProperty$6(function () {/* empty */}, 'length', {
      value: 8
    }).length !== 8;
  });
  var TEMPLATE = String(String).split('String');
  var makeBuiltIn$2 = makeBuiltIn$3.exports = function (value, name, options) {
    if (stringSlice$3($String$2(name), 0, 7) === 'Symbol(') {
      name = '[' + replace$2($String$2(name), /^Symbol\(([^)]*)\)/, '$1') + ']';
    }
    if (options && options.getter) name = 'get ' + name;
    if (options && options.setter) name = 'set ' + name;
    if (!hasOwn$7(value, 'name') || CONFIGURABLE_FUNCTION_NAME$1 && value.name !== name) {
      if (DESCRIPTORS$6) defineProperty$6(value, 'name', {
        value: name,
        configurable: true
      });else value.name = name;
    }
    if (CONFIGURABLE_LENGTH && options && hasOwn$7(options, 'arity') && value.length !== options.arity) {
      defineProperty$6(value, 'length', {
        value: options.arity
      });
    }
    try {
      if (options && hasOwn$7(options, 'constructor') && options.constructor) {
        if (DESCRIPTORS$6) defineProperty$6(value, 'prototype', {
          writable: false
        });
        // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
      } else if (value.prototype) value.prototype = undefined;
    } catch (error) {/* empty */}
    var state = enforceInternalState(value);
    if (!hasOwn$7(state, 'source')) {
      state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
    }
    return value;
  };

  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  // eslint-disable-next-line no-extend-native -- required
  Function.prototype.toString = makeBuiltIn$2(function toString() {
    return isCallable$c(this) && getInternalState$3(this).source || inspectSource$1(this);
  }, 'toString');
  var makeBuiltInExports = makeBuiltIn$3.exports;

  var isCallable$b = isCallable$m;
  var definePropertyModule$2 = objectDefineProperty;
  var makeBuiltIn$1 = makeBuiltInExports;
  var defineGlobalProperty$1 = defineGlobalProperty$3;
  var defineBuiltIn$9 = function (O, key, value, options) {
    if (!options) options = {};
    var simple = options.enumerable;
    var name = options.name !== undefined ? options.name : key;
    if (isCallable$b(value)) makeBuiltIn$1(value, name, options);
    if (options.global) {
      if (simple) O[key] = value;else defineGlobalProperty$1(key, value);
    } else {
      try {
        if (!options.unsafe) delete O[key];else if (O[key]) simple = true;
      } catch (error) {/* empty */}
      if (simple) O[key] = value;else definePropertyModule$2.f(O, key, {
        value: value,
        enumerable: false,
        configurable: !options.nonConfigurable,
        writable: !options.nonWritable
      });
    }
    return O;
  };

  var objectGetOwnPropertyNames = {};

  var internalObjectKeys = objectKeysInternal;
  var enumBugKeys = enumBugKeys$3;
  var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  // eslint-disable-next-line es/no-object-getownpropertynames -- safe
  objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return internalObjectKeys(O, hiddenKeys$1);
  };

  var objectGetOwnPropertySymbols = {};

  // eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
  objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

  var getBuiltIn$3 = getBuiltIn$7;
  var uncurryThis$d = functionUncurryThis;
  var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
  var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
  var anObject$8 = anObject$c;
  var concat$1 = uncurryThis$d([].concat);

  // all object keys, includes non-enumerable and symbols
  var ownKeys$1 = getBuiltIn$3('Reflect', 'ownKeys') || function ownKeys(it) {
    var keys = getOwnPropertyNamesModule$1.f(anObject$8(it));
    var getOwnPropertySymbols = getOwnPropertySymbolsModule$1.f;
    return getOwnPropertySymbols ? concat$1(keys, getOwnPropertySymbols(it)) : keys;
  };

  var hasOwn$6 = hasOwnProperty_1;
  var ownKeys = ownKeys$1;
  var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
  var definePropertyModule$1 = objectDefineProperty;
  var copyConstructorProperties$2 = function (target, source, exceptions) {
    var keys = ownKeys(source);
    var defineProperty = definePropertyModule$1.f;
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!hasOwn$6(target, key) && !(exceptions && hasOwn$6(exceptions, key))) {
        defineProperty(target, key, getOwnPropertyDescriptor(source, key));
      }
    }
  };

  var fails$i = fails$s;
  var isCallable$a = isCallable$m;
  var replacement = /#|\.prototype\./;
  var isForced$4 = function (feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL ? true : value == NATIVE ? false : isCallable$a(detection) ? fails$i(detection) : !!detection;
  };
  var normalize = isForced$4.normalize = function (string) {
    return String(string).replace(replacement, '.').toLowerCase();
  };
  var data = isForced$4.data = {};
  var NATIVE = isForced$4.NATIVE = 'N';
  var POLYFILL = isForced$4.POLYFILL = 'P';
  var isForced_1 = isForced$4;

  var global$d = global$n;
  var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
  var createNonEnumerableProperty$2 = createNonEnumerableProperty$5;
  var defineBuiltIn$8 = defineBuiltIn$9;
  var defineGlobalProperty = defineGlobalProperty$3;
  var copyConstructorProperties$1 = copyConstructorProperties$2;
  var isForced$3 = isForced_1;

  /*
    options.target         - name of the target object
    options.global         - target is the global object
    options.stat           - export as static methods of target
    options.proto          - export as prototype methods of target
    options.real           - real prototype method for the `pure` version
    options.forced         - export even if the native feature is available
    options.bind           - bind methods to the target, required for the `pure` version
    options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
    options.unsafe         - use the simple assignment of property instead of delete + defineProperty
    options.sham           - add a flag to not completely full polyfills
    options.enumerable     - export as enumerable property
    options.dontCallGetSet - prevent calling a getter on target
    options.name           - the .name of the function if it does not match the key
  */
  var _export = function (options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;
    if (GLOBAL) {
      target = global$d;
    } else if (STATIC) {
      target = global$d[TARGET] || defineGlobalProperty(TARGET, {});
    } else {
      target = (global$d[TARGET] || {}).prototype;
    }
    if (target) for (key in source) {
      sourceProperty = source[key];
      if (options.dontCallGetSet) {
        descriptor = getOwnPropertyDescriptor$2(target, key);
        targetProperty = descriptor && descriptor.value;
      } else targetProperty = target[key];
      FORCED = isForced$3(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
      // contained in target
      if (!FORCED && targetProperty !== undefined) {
        if (typeof sourceProperty == typeof targetProperty) continue;
        copyConstructorProperties$1(sourceProperty, targetProperty);
      }
      // add a flag to not completely full polyfills
      if (options.sham || targetProperty && targetProperty.sham) {
        createNonEnumerableProperty$2(sourceProperty, 'sham', true);
      }
      defineBuiltIn$8(target, key, sourceProperty, options);
    }
  };

  var fails$h = fails$s;
  var correctPrototypeGetter = !fails$h(function () {
    function F() {/* empty */}
    F.prototype.constructor = null;
    // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
    return Object.getPrototypeOf(new F()) !== F.prototype;
  });

  var hasOwn$5 = hasOwnProperty_1;
  var isCallable$9 = isCallable$m;
  var toObject$3 = toObject$6;
  var sharedKey = sharedKey$3;
  var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;
  var IE_PROTO = sharedKey('IE_PROTO');
  var $Object = Object;
  var ObjectPrototype = $Object.prototype;

  // `Object.getPrototypeOf` method
  // https://tc39.es/ecma262/#sec-object.getprototypeof
  // eslint-disable-next-line es/no-object-getprototypeof -- safe
  var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
    var object = toObject$3(O);
    if (hasOwn$5(object, IE_PROTO)) return object[IE_PROTO];
    var constructor = object.constructor;
    if (isCallable$9(constructor) && object instanceof constructor) {
      return constructor.prototype;
    }
    return object instanceof $Object ? ObjectPrototype : null;
  };

  var fails$g = fails$s;
  var isCallable$8 = isCallable$m;
  var isObject$8 = isObject$f;
  var getPrototypeOf$1 = objectGetPrototypeOf;
  var defineBuiltIn$7 = defineBuiltIn$9;
  var wellKnownSymbol$d = wellKnownSymbol$j;
  var ITERATOR$5 = wellKnownSymbol$d('iterator');
  var BUGGY_SAFARI_ITERATORS$1 = false;

  // `%IteratorPrototype%` object
  // https://tc39.es/ecma262/#sec-%iteratorprototype%-object
  var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

  /* eslint-disable es/no-array-prototype-keys -- safe */
  if ([].keys) {
    arrayIterator = [].keys();
    // Safari 8 has buggy iterators w/o `next`
    if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;else {
      PrototypeOfArrayIteratorPrototype = getPrototypeOf$1(getPrototypeOf$1(arrayIterator));
      if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
    }
  }
  var NEW_ITERATOR_PROTOTYPE = !isObject$8(IteratorPrototype$2) || fails$g(function () {
    var test = {};
    // FF44- legacy iterators case
    return IteratorPrototype$2[ITERATOR$5].call(test) !== test;
  });
  if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

  // `%IteratorPrototype%[@@iterator]()` method
  // https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
  if (!isCallable$8(IteratorPrototype$2[ITERATOR$5])) {
    defineBuiltIn$7(IteratorPrototype$2, ITERATOR$5, function () {
      return this;
    });
  }
  var iteratorsCore = {
    IteratorPrototype: IteratorPrototype$2,
    BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
  };

  var defineProperty$5 = objectDefineProperty.f;
  var hasOwn$4 = hasOwnProperty_1;
  var wellKnownSymbol$c = wellKnownSymbol$j;
  var TO_STRING_TAG$1 = wellKnownSymbol$c('toStringTag');
  var setToStringTag$4 = function (target, TAG, STATIC) {
    if (target && !STATIC) target = target.prototype;
    if (target && !hasOwn$4(target, TO_STRING_TAG$1)) {
      defineProperty$5(target, TO_STRING_TAG$1, {
        configurable: true,
        value: TAG
      });
    }
  };

  var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
  var create$2 = objectCreate;
  var createPropertyDescriptor$1 = createPropertyDescriptor$4;
  var setToStringTag$3 = setToStringTag$4;
  var Iterators$4 = iterators;
  var returnThis$1 = function () {
    return this;
  };
  var iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
    var TO_STRING_TAG = NAME + ' Iterator';
    IteratorConstructor.prototype = create$2(IteratorPrototype$1, {
      next: createPropertyDescriptor$1(+!ENUMERABLE_NEXT, next)
    });
    setToStringTag$3(IteratorConstructor, TO_STRING_TAG, false);
    Iterators$4[TO_STRING_TAG] = returnThis$1;
    return IteratorConstructor;
  };

  var uncurryThis$c = functionUncurryThis;
  var aCallable$5 = aCallable$8;
  var functionUncurryThisAccessor = function (object, key, method) {
    try {
      // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
      return uncurryThis$c(aCallable$5(Object.getOwnPropertyDescriptor(object, key)[method]));
    } catch (error) {/* empty */}
  };

  var isCallable$7 = isCallable$m;
  var $String$1 = String;
  var $TypeError$8 = TypeError;
  var aPossiblePrototype$1 = function (argument) {
    if (typeof argument == 'object' || isCallable$7(argument)) return argument;
    throw $TypeError$8("Can't set " + $String$1(argument) + ' as a prototype');
  };

  /* eslint-disable no-proto -- safe */
  var uncurryThisAccessor = functionUncurryThisAccessor;
  var anObject$7 = anObject$c;
  var aPossiblePrototype = aPossiblePrototype$1;

  // `Object.setPrototypeOf` method
  // https://tc39.es/ecma262/#sec-object.setprototypeof
  // Works with __proto__ only. Old v8 can't work with null proto objects.
  // eslint-disable-next-line es/no-object-setprototypeof -- safe
  var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
    var CORRECT_SETTER = false;
    var test = {};
    var setter;
    try {
      setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
      setter(test, []);
      CORRECT_SETTER = test instanceof Array;
    } catch (error) {/* empty */}
    return function setPrototypeOf(O, proto) {
      anObject$7(O);
      aPossiblePrototype(proto);
      if (CORRECT_SETTER) setter(O, proto);else O.__proto__ = proto;
      return O;
    };
  }() : undefined);

  var $$l = _export;
  var call$b = functionCall;
  var FunctionName = functionName;
  var isCallable$6 = isCallable$m;
  var createIteratorConstructor = iteratorCreateConstructor;
  var getPrototypeOf = objectGetPrototypeOf;
  var setPrototypeOf$2 = objectSetPrototypeOf;
  var setToStringTag$2 = setToStringTag$4;
  var createNonEnumerableProperty$1 = createNonEnumerableProperty$5;
  var defineBuiltIn$6 = defineBuiltIn$9;
  var wellKnownSymbol$b = wellKnownSymbol$j;
  var Iterators$3 = iterators;
  var IteratorsCore = iteratorsCore;
  var PROPER_FUNCTION_NAME$2 = FunctionName.PROPER;
  var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
  var IteratorPrototype = IteratorsCore.IteratorPrototype;
  var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
  var ITERATOR$4 = wellKnownSymbol$b('iterator');
  var KEYS = 'keys';
  var VALUES = 'values';
  var ENTRIES = 'entries';
  var returnThis = function () {
    return this;
  };
  var iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
    createIteratorConstructor(IteratorConstructor, NAME, next);
    var getIterationMethod = function (KIND) {
      if (KIND === DEFAULT && defaultIterator) return defaultIterator;
      if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
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
    var nativeIterator = IterablePrototype[ITERATOR$4] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
    var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
    var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
    var CurrentIteratorPrototype, methods, KEY;

    // fix native
    if (anyNativeIterator) {
      CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
      if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
        if (getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
          if (setPrototypeOf$2) {
            setPrototypeOf$2(CurrentIteratorPrototype, IteratorPrototype);
          } else if (!isCallable$6(CurrentIteratorPrototype[ITERATOR$4])) {
            defineBuiltIn$6(CurrentIteratorPrototype, ITERATOR$4, returnThis);
          }
        }
        // Set @@toStringTag to native iterators
        setToStringTag$2(CurrentIteratorPrototype, TO_STRING_TAG, true);
      }
    }

    // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
    if (PROPER_FUNCTION_NAME$2 && DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
      if (CONFIGURABLE_FUNCTION_NAME) {
        createNonEnumerableProperty$1(IterablePrototype, 'name', VALUES);
      } else {
        INCORRECT_VALUES_NAME = true;
        defaultIterator = function values() {
          return call$b(nativeIterator, this);
        };
      }
    }

    // export additional methods
    if (DEFAULT) {
      methods = {
        values: getIterationMethod(VALUES),
        keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
        entries: getIterationMethod(ENTRIES)
      };
      if (FORCED) for (KEY in methods) {
        if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
          defineBuiltIn$6(IterablePrototype, KEY, methods[KEY]);
        }
      } else $$l({
        target: NAME,
        proto: true,
        forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME
      }, methods);
    }

    // define iterator
    if (IterablePrototype[ITERATOR$4] !== defaultIterator) {
      defineBuiltIn$6(IterablePrototype, ITERATOR$4, defaultIterator, {
        name: DEFAULT
      });
    }
    Iterators$3[NAME] = defaultIterator;
    return methods;
  };

  // `CreateIterResultObject` abstract operation
  // https://tc39.es/ecma262/#sec-createiterresultobject
  var createIterResultObject$3 = function (value, done) {
    return {
      value: value,
      done: done
    };
  };

  var toIndexedObject$2 = toIndexedObject$7;
  var addToUnscopables$2 = addToUnscopables$3;
  var Iterators$2 = iterators;
  var InternalStateModule$3 = internalState;
  var defineProperty$4 = objectDefineProperty.f;
  var defineIterator$2 = iteratorDefine;
  var createIterResultObject$2 = createIterResultObject$3;
  var DESCRIPTORS$5 = descriptors;
  var ARRAY_ITERATOR = 'Array Iterator';
  var setInternalState$3 = InternalStateModule$3.set;
  var getInternalState$2 = InternalStateModule$3.getterFor(ARRAY_ITERATOR);

  // `Array.prototype.entries` method
  // https://tc39.es/ecma262/#sec-array.prototype.entries
  // `Array.prototype.keys` method
  // https://tc39.es/ecma262/#sec-array.prototype.keys
  // `Array.prototype.values` method
  // https://tc39.es/ecma262/#sec-array.prototype.values
  // `Array.prototype[@@iterator]` method
  // https://tc39.es/ecma262/#sec-array.prototype-@@iterator
  // `CreateArrayIterator` internal method
  // https://tc39.es/ecma262/#sec-createarrayiterator
  var es_array_iterator = defineIterator$2(Array, 'Array', function (iterated, kind) {
    setInternalState$3(this, {
      type: ARRAY_ITERATOR,
      target: toIndexedObject$2(iterated),
      // target
      index: 0,
      // next index
      kind: kind // kind
    });
    // `%ArrayIteratorPrototype%.next` method
    // https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
  }, function () {
    var state = getInternalState$2(this);
    var target = state.target;
    var kind = state.kind;
    var index = state.index++;
    if (!target || index >= target.length) {
      state.target = undefined;
      return createIterResultObject$2(undefined, true);
    }
    if (kind == 'keys') return createIterResultObject$2(index, false);
    if (kind == 'values') return createIterResultObject$2(target[index], false);
    return createIterResultObject$2([index, target[index]], false);
  }, 'values');

  // argumentsList[@@iterator] is %ArrayProto_values%
  // https://tc39.es/ecma262/#sec-createunmappedargumentsobject
  // https://tc39.es/ecma262/#sec-createmappedargumentsobject
  var values = Iterators$2.Arguments = Iterators$2.Array;

  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables$2('keys');
  addToUnscopables$2('values');
  addToUnscopables$2('entries');

  // V8 ~ Chrome 45- bug
  if (DESCRIPTORS$5 && values.name !== 'values') try {
    defineProperty$4(values, 'name', {
      value: 'values'
    });
  } catch (error) {/* empty */}

  var global$c = global$n;
  var DOMIterables = domIterables;
  var DOMTokenListPrototype = domTokenListPrototype;
  var ArrayIteratorMethods = es_array_iterator;
  var createNonEnumerableProperty = createNonEnumerableProperty$5;
  var wellKnownSymbol$a = wellKnownSymbol$j;
  var ITERATOR$3 = wellKnownSymbol$a('iterator');
  var TO_STRING_TAG = wellKnownSymbol$a('toStringTag');
  var ArrayValues = ArrayIteratorMethods.values;
  var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
    if (CollectionPrototype) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[ITERATOR$3] !== ArrayValues) try {
        createNonEnumerableProperty(CollectionPrototype, ITERATOR$3, ArrayValues);
      } catch (error) {
        CollectionPrototype[ITERATOR$3] = ArrayValues;
      }
      if (!CollectionPrototype[TO_STRING_TAG]) {
        createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
      }
      if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
        // some Chrome versions have non-configurable methods on DOMTokenList
        if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
          createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
        } catch (error) {
          CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
        }
      }
    }
  };
  for (var COLLECTION_NAME in DOMIterables) {
    handlePrototype(global$c[COLLECTION_NAME] && global$c[COLLECTION_NAME].prototype, COLLECTION_NAME);
  }
  handlePrototype(DOMTokenListPrototype, 'DOMTokenList');

  var global$b = global$n;
  var path$1 = global$b;

  function _regeneratorRuntime() {
    _regeneratorRuntime = function () {
      return exports;
    };
    var exports = {},
      Op = Object.prototype,
      hasOwn = Op.hasOwnProperty,
      defineProperty = Object.defineProperty || function (obj, key, desc) {
        obj[key] = desc.value;
      },
      $Symbol = "function" == typeof Symbol ? Symbol : {},
      iteratorSymbol = $Symbol.iterator || "@@iterator",
      asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
      toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
    function define(obj, key, value) {
      return Object.defineProperty(obj, key, {
        value: value,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }), obj[key];
    }
    try {
      define({}, "");
    } catch (err) {
      define = function (obj, key, value) {
        return obj[key] = value;
      };
    }
    function wrap(innerFn, outerFn, self, tryLocsList) {
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
        generator = Object.create(protoGenerator.prototype),
        context = new Context(tryLocsList || []);
      return defineProperty(generator, "_invoke", {
        value: makeInvokeMethod(innerFn, self, context)
      }), generator;
    }
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
    exports.wrap = wrap;
    var ContinueSentinel = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    var IteratorPrototype = {};
    define(IteratorPrototype, iteratorSymbol, function () {
      return this;
    });
    var getProto = Object.getPrototypeOf,
      NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        define(prototype, method, function (arg) {
          return this._invoke(method, arg);
        });
      });
    }
    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if ("throw" !== record.type) {
          var result = record.arg,
            value = result.value;
          return value && "object" == typeof value && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          }) : PromiseImpl.resolve(value).then(function (unwrapped) {
            result.value = unwrapped, resolve(result);
          }, function (error) {
            return invoke("throw", error, resolve, reject);
          });
        }
        reject(record.arg);
      }
      var previousPromise;
      defineProperty(this, "_invoke", {
        value: function (method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }
          return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }
      });
    }
    function makeInvokeMethod(innerFn, self, context) {
      var state = "suspendedStart";
      return function (method, arg) {
        if ("executing" === state) throw new Error("Generator is already running");
        if ("completed" === state) {
          if ("throw" === method) throw arg;
          return doneResult();
        }
        for (context.method = method, context.arg = arg;;) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }
          if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
            if ("suspendedStart" === state) throw state = "completed", context.arg;
            context.dispatchException(context.arg);
          } else "return" === context.method && context.abrupt("return", context.arg);
          state = "executing";
          var record = tryCatch(innerFn, self, context);
          if ("normal" === record.type) {
            if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
            return {
              value: record.arg,
              done: context.done
            };
          }
          "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
        }
      };
    }
    function maybeInvokeDelegate(delegate, context) {
      var methodName = context.method,
        method = delegate.iterator[methodName];
      if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
      var record = tryCatch(method, delegate.iterator, context.arg);
      if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
      var info = record.arg;
      return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
    }
    function pushTryEntry(locs) {
      var entry = {
        tryLoc: locs[0]
      };
      1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
    }
    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal", delete record.arg, entry.completion = record;
    }
    function Context(tryLocsList) {
      this.tryEntries = [{
        tryLoc: "root"
      }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
    }
    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) return iteratorMethod.call(iterable);
        if ("function" == typeof iterable.next) return iterable;
        if (!isNaN(iterable.length)) {
          var i = -1,
            next = function next() {
              for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
              return next.value = undefined, next.done = !0, next;
            };
          return next.next = next;
        }
      }
      return {
        next: doneResult
      };
    }
    function doneResult() {
      return {
        value: undefined,
        done: !0
      };
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
      value: GeneratorFunctionPrototype,
      configurable: !0
    }), defineProperty(GeneratorFunctionPrototype, "constructor", {
      value: GeneratorFunction,
      configurable: !0
    }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
      var ctor = "function" == typeof genFun && genFun.constructor;
      return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
    }, exports.mark = function (genFun) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
    }, exports.awrap = function (arg) {
      return {
        __await: arg
      };
    }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
      return this;
    }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      void 0 === PromiseImpl && (PromiseImpl = Promise);
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
      return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
      return this;
    }), define(Gp, "toString", function () {
      return "[object Generator]";
    }), exports.keys = function (val) {
      var object = Object(val),
        keys = [];
      for (var key in object) keys.push(key);
      return keys.reverse(), function next() {
        for (; keys.length;) {
          var key = keys.pop();
          if (key in object) return next.value = key, next.done = !1, next;
        }
        return next.done = !0, next;
      };
    }, exports.values = values, Context.prototype = {
      constructor: Context,
      reset: function (skipTempReset) {
        if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
      },
      stop: function () {
        this.done = !0;
        var rootRecord = this.tryEntries[0].completion;
        if ("throw" === rootRecord.type) throw rootRecord.arg;
        return this.rval;
      },
      dispatchException: function (exception) {
        if (this.done) throw exception;
        var context = this;
        function handle(loc, caught) {
          return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
        }
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i],
            record = entry.completion;
          if ("root" === entry.tryLoc) return handle("end");
          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc"),
              hasFinally = hasOwn.call(entry, "finallyLoc");
            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
              if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            } else {
              if (!hasFinally) throw new Error("try statement without catch or finally");
              if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
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
        finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
        var record = finallyEntry ? finallyEntry.completion : {};
        return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
      },
      complete: function (record, afterLoc) {
        if ("throw" === record.type) throw record.arg;
        return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
      },
      finish: function (finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
        }
      },
      catch: function (tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if ("throw" === record.type) {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }
        throw new Error("illegal catch attempt");
      },
      delegateYield: function (iterable, resultName, nextLoc) {
        return this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
      }
    }, exports;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
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
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
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
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  /* eslint-disable es/no-array-prototype-indexof -- required for testing */
  var $$k = _export;
  var uncurryThis$b = functionUncurryThisClause;
  var $indexOf = arrayIncludes.indexOf;
  var arrayMethodIsStrict = arrayMethodIsStrict$2;
  var nativeIndexOf = uncurryThis$b([].indexOf);
  var NEGATIVE_ZERO = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
  var FORCED$2 = NEGATIVE_ZERO || !arrayMethodIsStrict('indexOf');

  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  $$k({
    target: 'Array',
    proto: true,
    forced: FORCED$2
  }, {
    indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
      var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
      return NEGATIVE_ZERO
      // convert -0 to +0
      ? nativeIndexOf(this, searchElement, fromIndex) || 0 : $indexOf(this, searchElement, fromIndex);
    }
  });

  var $TypeError$7 = TypeError;
  var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

  var doesNotExceedSafeInteger$1 = function (it) {
    if (it > MAX_SAFE_INTEGER) throw $TypeError$7('Maximum allowed index exceeded');
    return it;
  };

  var toPropertyKey = toPropertyKey$3;
  var definePropertyModule = objectDefineProperty;
  var createPropertyDescriptor = createPropertyDescriptor$4;
  var createProperty$2 = function (object, key, value) {
    var propertyKey = toPropertyKey(key);
    if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
  };

  var fails$f = fails$s;
  var wellKnownSymbol$9 = wellKnownSymbol$j;
  var V8_VERSION$2 = engineV8Version;
  var SPECIES$3 = wellKnownSymbol$9('species');
  var arrayMethodHasSpeciesSupport$3 = function (METHOD_NAME) {
    // We can't use this feature detection in V8 since it causes
    // deoptimization and serious performance degradation
    // https://github.com/zloirock/core-js/issues/677
    return V8_VERSION$2 >= 51 || !fails$f(function () {
      var array = [];
      var constructor = array.constructor = {};
      constructor[SPECIES$3] = function () {
        return {
          foo: 1
        };
      };
      return array[METHOD_NAME](Boolean).foo !== 1;
    });
  };

  var $$j = _export;
  var fails$e = fails$s;
  var isArray = isArray$2;
  var isObject$7 = isObject$f;
  var toObject$2 = toObject$6;
  var lengthOfArrayLike$2 = lengthOfArrayLike$5;
  var doesNotExceedSafeInteger = doesNotExceedSafeInteger$1;
  var createProperty$1 = createProperty$2;
  var arraySpeciesCreate = arraySpeciesCreate$2;
  var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport$3;
  var wellKnownSymbol$8 = wellKnownSymbol$j;
  var V8_VERSION$1 = engineV8Version;
  var IS_CONCAT_SPREADABLE = wellKnownSymbol$8('isConcatSpreadable');

  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/679
  var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION$1 >= 51 || !fails$e(function () {
    var array = [];
    array[IS_CONCAT_SPREADABLE] = false;
    return array.concat()[0] !== array;
  });
  var isConcatSpreadable = function (O) {
    if (!isObject$7(O)) return false;
    var spreadable = O[IS_CONCAT_SPREADABLE];
    return spreadable !== undefined ? !!spreadable : isArray(O);
  };
  var FORCED$1 = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport$2('concat');

  // `Array.prototype.concat` method
  // https://tc39.es/ecma262/#sec-array.prototype.concat
  // with adding support of @@isConcatSpreadable and @@species
  $$j({
    target: 'Array',
    proto: true,
    arity: 1,
    forced: FORCED$1
  }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    concat: function concat(arg) {
      var O = toObject$2(this);
      var A = arraySpeciesCreate(O, 0);
      var n = 0;
      var i, k, length, len, E;
      for (i = -1, length = arguments.length; i < length; i++) {
        E = i === -1 ? O : arguments[i];
        if (isConcatSpreadable(E)) {
          len = lengthOfArrayLike$2(E);
          doesNotExceedSafeInteger(n + len);
          for (k = 0; k < len; k++, n++) if (k in E) createProperty$1(A, n, E[k]);
        } else {
          doesNotExceedSafeInteger(n + 1);
          createProperty$1(A, n++, E);
        }
      }
      A.length = n;
      return A;
    }
  });

  var DESCRIPTORS$4 = descriptors;
  var uncurryThis$a = functionUncurryThis;
  var call$a = functionCall;
  var fails$d = fails$s;
  var objectKeys$1 = objectKeys$3;
  var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
  var propertyIsEnumerableModule = objectPropertyIsEnumerable;
  var toObject$1 = toObject$6;
  var IndexedObject = indexedObject;

  // eslint-disable-next-line es/no-object-assign -- safe
  var $assign = Object.assign;
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  var defineProperty$3 = Object.defineProperty;
  var concat = uncurryThis$a([].concat);

  // `Object.assign` method
  // https://tc39.es/ecma262/#sec-object.assign
  var objectAssign = !$assign || fails$d(function () {
    // should have correct order of operations (Edge bug)
    if (DESCRIPTORS$4 && $assign({
      b: 1
    }, $assign(defineProperty$3({}, 'a', {
      enumerable: true,
      get: function () {
        defineProperty$3(this, 'b', {
          value: 3,
          enumerable: false
        });
      }
    }), {
      b: 2
    })).b !== 1) return true;
    // should work with symbols and should have deterministic property order (V8 bug)
    var A = {};
    var B = {};
    // eslint-disable-next-line es/no-symbol -- safe
    var symbol = Symbol();
    var alphabet = 'abcdefghijklmnopqrst';
    A[symbol] = 7;
    alphabet.split('').forEach(function (chr) {
      B[chr] = chr;
    });
    return $assign({}, A)[symbol] != 7 || objectKeys$1($assign({}, B)).join('') != alphabet;
  }) ? function assign(target, source) {
    // eslint-disable-line no-unused-vars -- required for `.length`
    var T = toObject$1(target);
    var argumentsLength = arguments.length;
    var index = 1;
    var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
    var propertyIsEnumerable = propertyIsEnumerableModule.f;
    while (argumentsLength > index) {
      var S = IndexedObject(arguments[index++]);
      var keys = getOwnPropertySymbols ? concat(objectKeys$1(S), getOwnPropertySymbols(S)) : objectKeys$1(S);
      var length = keys.length;
      var j = 0;
      var key;
      while (length > j) {
        key = keys[j++];
        if (!DESCRIPTORS$4 || call$a(propertyIsEnumerable, S, key)) T[key] = S[key];
      }
    }
    return T;
  } : $assign;

  var $$i = _export;
  var assign = objectAssign;

  // `Object.assign` method
  // https://tc39.es/ecma262/#sec-object.assign
  // eslint-disable-next-line es/no-object-assign -- required for testing
  $$i({
    target: 'Object',
    stat: true,
    arity: 2,
    forced: Object.assign !== assign
  }, {
    assign: assign
  });

  var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
  var classof$6 = classof$8;

  // `Object.prototype.toString` method implementation
  // https://tc39.es/ecma262/#sec-object.prototype.tostring
  var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
    return '[object ' + classof$6(this) + ']';
  };

  var TO_STRING_TAG_SUPPORT = toStringTagSupport;
  var defineBuiltIn$5 = defineBuiltIn$9;
  var toString$6 = objectToString;

  // `Object.prototype.toString` method
  // https://tc39.es/ecma262/#sec-object.prototype.tostring
  if (!TO_STRING_TAG_SUPPORT) {
    defineBuiltIn$5(Object.prototype, 'toString', toString$6, {
      unsafe: true
    });
  }

  var classof$5 = classofRaw$2;
  var engineIsNode = typeof process != 'undefined' && classof$5(process) == 'process';

  var makeBuiltIn = makeBuiltInExports;
  var defineProperty$2 = objectDefineProperty;
  var defineBuiltInAccessor$2 = function (target, name, descriptor) {
    if (descriptor.get) makeBuiltIn(descriptor.get, name, {
      getter: true
    });
    if (descriptor.set) makeBuiltIn(descriptor.set, name, {
      setter: true
    });
    return defineProperty$2.f(target, name, descriptor);
  };

  var getBuiltIn$2 = getBuiltIn$7;
  var defineBuiltInAccessor$1 = defineBuiltInAccessor$2;
  var wellKnownSymbol$7 = wellKnownSymbol$j;
  var DESCRIPTORS$3 = descriptors;
  var SPECIES$2 = wellKnownSymbol$7('species');
  var setSpecies$2 = function (CONSTRUCTOR_NAME) {
    var Constructor = getBuiltIn$2(CONSTRUCTOR_NAME);
    if (DESCRIPTORS$3 && Constructor && !Constructor[SPECIES$2]) {
      defineBuiltInAccessor$1(Constructor, SPECIES$2, {
        configurable: true,
        get: function () {
          return this;
        }
      });
    }
  };

  var isPrototypeOf$3 = objectIsPrototypeOf;
  var $TypeError$6 = TypeError;
  var anInstance$3 = function (it, Prototype) {
    if (isPrototypeOf$3(Prototype, it)) return it;
    throw $TypeError$6('Incorrect invocation');
  };

  var isConstructor = isConstructor$2;
  var tryToString$2 = tryToString$4;
  var $TypeError$5 = TypeError;

  // `Assert: IsConstructor(argument) is true`
  var aConstructor$1 = function (argument) {
    if (isConstructor(argument)) return argument;
    throw $TypeError$5(tryToString$2(argument) + ' is not a constructor');
  };

  var anObject$6 = anObject$c;
  var aConstructor = aConstructor$1;
  var isNullOrUndefined$3 = isNullOrUndefined$6;
  var wellKnownSymbol$6 = wellKnownSymbol$j;
  var SPECIES$1 = wellKnownSymbol$6('species');

  // `SpeciesConstructor` abstract operation
  // https://tc39.es/ecma262/#sec-speciesconstructor
  var speciesConstructor$1 = function (O, defaultConstructor) {
    var C = anObject$6(O).constructor;
    var S;
    return C === undefined || isNullOrUndefined$3(S = anObject$6(C)[SPECIES$1]) ? defaultConstructor : aConstructor(S);
  };

  var NATIVE_BIND = functionBindNative;
  var FunctionPrototype = Function.prototype;
  var apply$1 = FunctionPrototype.apply;
  var call$9 = FunctionPrototype.call;

  // eslint-disable-next-line es/no-reflect -- safe
  var functionApply = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call$9.bind(apply$1) : function () {
    return call$9.apply(apply$1, arguments);
  });

  var uncurryThis$9 = functionUncurryThis;
  var arraySlice$2 = uncurryThis$9([].slice);

  var $TypeError$4 = TypeError;
  var validateArgumentsLength$1 = function (passed, required) {
    if (passed < required) throw $TypeError$4('Not enough arguments');
    return passed;
  };

  var userAgent$2 = engineUserAgent;

  // eslint-disable-next-line redos/no-vulnerable -- safe
  var engineIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent$2);

  var global$a = global$n;
  var apply = functionApply;
  var bind$4 = functionBindContext;
  var isCallable$5 = isCallable$m;
  var hasOwn$3 = hasOwnProperty_1;
  var fails$c = fails$s;
  var html = html$2;
  var arraySlice$1 = arraySlice$2;
  var createElement = documentCreateElement$2;
  var validateArgumentsLength = validateArgumentsLength$1;
  var IS_IOS$1 = engineIsIos;
  var IS_NODE$3 = engineIsNode;
  var set = global$a.setImmediate;
  var clear = global$a.clearImmediate;
  var process$3 = global$a.process;
  var Dispatch = global$a.Dispatch;
  var Function$1 = global$a.Function;
  var MessageChannel = global$a.MessageChannel;
  var String$1 = global$a.String;
  var counter = 0;
  var queue$2 = {};
  var ONREADYSTATECHANGE = 'onreadystatechange';
  var $location, defer, channel, port;
  fails$c(function () {
    // Deno throws a ReferenceError on `location` access without `--location` flag
    $location = global$a.location;
  });
  var run = function (id) {
    if (hasOwn$3(queue$2, id)) {
      var fn = queue$2[id];
      delete queue$2[id];
      fn();
    }
  };
  var runner = function (id) {
    return function () {
      run(id);
    };
  };
  var eventListener = function (event) {
    run(event.data);
  };
  var globalPostMessageDefer = function (id) {
    // old engines have not location.origin
    global$a.postMessage(String$1(id), $location.protocol + '//' + $location.host);
  };

  // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
  if (!set || !clear) {
    set = function setImmediate(handler) {
      validateArgumentsLength(arguments.length, 1);
      var fn = isCallable$5(handler) ? handler : Function$1(handler);
      var args = arraySlice$1(arguments, 1);
      queue$2[++counter] = function () {
        apply(fn, undefined, args);
      };
      defer(counter);
      return counter;
    };
    clear = function clearImmediate(id) {
      delete queue$2[id];
    };
    // Node.js 0.8-
    if (IS_NODE$3) {
      defer = function (id) {
        process$3.nextTick(runner(id));
      };
      // Sphere (JS game engine) Dispatch API
    } else if (Dispatch && Dispatch.now) {
      defer = function (id) {
        Dispatch.now(runner(id));
      };
      // Browsers with MessageChannel, includes WebWorkers
      // except iOS - https://github.com/zloirock/core-js/issues/624
    } else if (MessageChannel && !IS_IOS$1) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = eventListener;
      defer = bind$4(port.postMessage, port);
      // Browsers with postMessage, skip WebWorkers
      // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (global$a.addEventListener && isCallable$5(global$a.postMessage) && !global$a.importScripts && $location && $location.protocol !== 'file:' && !fails$c(globalPostMessageDefer)) {
      defer = globalPostMessageDefer;
      global$a.addEventListener('message', eventListener, false);
      // IE8-
    } else if (ONREADYSTATECHANGE in createElement('script')) {
      defer = function (id) {
        html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
          html.removeChild(this);
          run(id);
        };
      };
      // Rest old browsers
    } else {
      defer = function (id) {
        setTimeout(runner(id), 0);
      };
    }
  }
  var task$1 = {
    set: set,
    clear: clear
  };

  var Queue$2 = function () {
    this.head = null;
    this.tail = null;
  };
  Queue$2.prototype = {
    add: function (item) {
      var entry = {
        item: item,
        next: null
      };
      var tail = this.tail;
      if (tail) tail.next = entry;else this.head = entry;
      this.tail = entry;
    },
    get: function () {
      var entry = this.head;
      if (entry) {
        var next = this.head = entry.next;
        if (next === null) this.tail = null;
        return entry.item;
      }
    }
  };
  var queue$1 = Queue$2;

  var userAgent$1 = engineUserAgent;
  var engineIsIosPebble = /ipad|iphone|ipod/i.test(userAgent$1) && typeof Pebble != 'undefined';

  var userAgent = engineUserAgent;
  var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent);

  var global$9 = global$n;
  var bind$3 = functionBindContext;
  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
  var macrotask = task$1.set;
  var Queue$1 = queue$1;
  var IS_IOS = engineIsIos;
  var IS_IOS_PEBBLE = engineIsIosPebble;
  var IS_WEBOS_WEBKIT = engineIsWebosWebkit;
  var IS_NODE$2 = engineIsNode;
  var MutationObserver = global$9.MutationObserver || global$9.WebKitMutationObserver;
  var document$2 = global$9.document;
  var process$2 = global$9.process;
  var Promise$1 = global$9.Promise;
  // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
  var queueMicrotaskDescriptor = getOwnPropertyDescriptor$1(global$9, 'queueMicrotask');
  var microtask$1 = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;
  var notify$1, toggle, node, promise, then;

  // modern engines have queueMicrotask method
  if (!microtask$1) {
    var queue = new Queue$1();
    var flush = function () {
      var parent, fn;
      if (IS_NODE$2 && (parent = process$2.domain)) parent.exit();
      while (fn = queue.get()) try {
        fn();
      } catch (error) {
        if (queue.head) notify$1();
        throw error;
      }
      if (parent) parent.enter();
    };

    // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
    // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
    if (!IS_IOS && !IS_NODE$2 && !IS_WEBOS_WEBKIT && MutationObserver && document$2) {
      toggle = true;
      node = document$2.createTextNode('');
      new MutationObserver(flush).observe(node, {
        characterData: true
      });
      notify$1 = function () {
        node.data = toggle = !toggle;
      };
      // environments with maybe non-completely correct, but existent Promise
    } else if (!IS_IOS_PEBBLE && Promise$1 && Promise$1.resolve) {
      // Promise.resolve without an argument throws an error in LG WebOS 2
      promise = Promise$1.resolve(undefined);
      // workaround of WebKit ~ iOS Safari 10.1 bug
      promise.constructor = Promise$1;
      then = bind$3(promise.then, promise);
      notify$1 = function () {
        then(flush);
      };
      // Node.js without promises
    } else if (IS_NODE$2) {
      notify$1 = function () {
        process$2.nextTick(flush);
      };
      // for other environments - macrotask based on:
      // - setImmediate
      // - MessageChannel
      // - window.postMessage
      // - onreadystatechange
      // - setTimeout
    } else {
      // `webpack` dev server bug on IE global methods - use bind(fn, global)
      macrotask = bind$3(macrotask, global$9);
      notify$1 = function () {
        macrotask(flush);
      };
    }
    microtask$1 = function (fn) {
      if (!queue.head) notify$1();
      queue.add(fn);
    };
  }
  var microtask_1 = microtask$1;

  var hostReportErrors$1 = function (a, b) {
    try {
      // eslint-disable-next-line no-console -- safe
      arguments.length == 1 ? console.error(a) : console.error(a, b);
    } catch (error) {/* empty */}
  };

  var perform$3 = function (exec) {
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

  var global$8 = global$n;
  var promiseNativeConstructor = global$8.Promise;

  /* global Deno -- Deno case */
  var engineIsDeno = typeof Deno == 'object' && Deno && typeof Deno.version == 'object';

  var IS_DENO$1 = engineIsDeno;
  var IS_NODE$1 = engineIsNode;
  var engineIsBrowser = !IS_DENO$1 && !IS_NODE$1 && typeof window == 'object' && typeof document == 'object';

  var global$7 = global$n;
  var NativePromiseConstructor$3 = promiseNativeConstructor;
  var isCallable$4 = isCallable$m;
  var isForced$2 = isForced_1;
  var inspectSource = inspectSource$3;
  var wellKnownSymbol$5 = wellKnownSymbol$j;
  var IS_BROWSER = engineIsBrowser;
  var IS_DENO = engineIsDeno;
  var V8_VERSION = engineV8Version;
  NativePromiseConstructor$3 && NativePromiseConstructor$3.prototype;
  var SPECIES = wellKnownSymbol$5('species');
  var SUBCLASSING = false;
  var NATIVE_PROMISE_REJECTION_EVENT$1 = isCallable$4(global$7.PromiseRejectionEvent);
  var FORCED_PROMISE_CONSTRUCTOR$5 = isForced$2('Promise', function () {
    var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(NativePromiseConstructor$3);
    var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(NativePromiseConstructor$3);
    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // We can't detect it synchronously, so just check versions
    if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
    // We can't use @@species feature detection in V8 since it causes
    // deoptimization and performance degradation
    // https://github.com/zloirock/core-js/issues/679
    if (!V8_VERSION || V8_VERSION < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
      // Detect correctness of subclassing with @@species support
      var promise = new NativePromiseConstructor$3(function (resolve) {
        resolve(1);
      });
      var FakePromise = function (exec) {
        exec(function () {/* empty */}, function () {/* empty */});
      };
      var constructor = promise.constructor = {};
      constructor[SPECIES] = FakePromise;
      SUBCLASSING = promise.then(function () {/* empty */}) instanceof FakePromise;
      if (!SUBCLASSING) return true;
      // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    }
    return !GLOBAL_CORE_JS_PROMISE && (IS_BROWSER || IS_DENO) && !NATIVE_PROMISE_REJECTION_EVENT$1;
  });
  var promiseConstructorDetection = {
    CONSTRUCTOR: FORCED_PROMISE_CONSTRUCTOR$5,
    REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT$1,
    SUBCLASSING: SUBCLASSING
  };

  var newPromiseCapability$2 = {};

  var aCallable$4 = aCallable$8;
  var $TypeError$3 = TypeError;
  var PromiseCapability = function (C) {
    var resolve, reject;
    this.promise = new C(function ($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined) throw $TypeError$3('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = aCallable$4(resolve);
    this.reject = aCallable$4(reject);
  };

  // `NewPromiseCapability` abstract operation
  // https://tc39.es/ecma262/#sec-newpromisecapability
  newPromiseCapability$2.f = function (C) {
    return new PromiseCapability(C);
  };

  var $$h = _export;
  var IS_NODE = engineIsNode;
  var global$6 = global$n;
  var call$8 = functionCall;
  var defineBuiltIn$4 = defineBuiltIn$9;
  var setPrototypeOf$1 = objectSetPrototypeOf;
  var setToStringTag$1 = setToStringTag$4;
  var setSpecies$1 = setSpecies$2;
  var aCallable$3 = aCallable$8;
  var isCallable$3 = isCallable$m;
  var isObject$6 = isObject$f;
  var anInstance$2 = anInstance$3;
  var speciesConstructor = speciesConstructor$1;
  var task = task$1.set;
  var microtask = microtask_1;
  var hostReportErrors = hostReportErrors$1;
  var perform$2 = perform$3;
  var Queue = queue$1;
  var InternalStateModule$2 = internalState;
  var NativePromiseConstructor$2 = promiseNativeConstructor;
  var PromiseConstructorDetection = promiseConstructorDetection;
  var newPromiseCapabilityModule$3 = newPromiseCapability$2;
  var PROMISE = 'Promise';
  var FORCED_PROMISE_CONSTRUCTOR$4 = PromiseConstructorDetection.CONSTRUCTOR;
  var NATIVE_PROMISE_REJECTION_EVENT = PromiseConstructorDetection.REJECTION_EVENT;
  var NATIVE_PROMISE_SUBCLASSING = PromiseConstructorDetection.SUBCLASSING;
  var getInternalPromiseState = InternalStateModule$2.getterFor(PROMISE);
  var setInternalState$2 = InternalStateModule$2.set;
  var NativePromisePrototype$1 = NativePromiseConstructor$2 && NativePromiseConstructor$2.prototype;
  var PromiseConstructor = NativePromiseConstructor$2;
  var PromisePrototype = NativePromisePrototype$1;
  var TypeError$2 = global$6.TypeError;
  var document$1 = global$6.document;
  var process$1 = global$6.process;
  var newPromiseCapability$1 = newPromiseCapabilityModule$3.f;
  var newGenericPromiseCapability = newPromiseCapability$1;
  var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && global$6.dispatchEvent);
  var UNHANDLED_REJECTION = 'unhandledrejection';
  var REJECTION_HANDLED = 'rejectionhandled';
  var PENDING = 0;
  var FULFILLED = 1;
  var REJECTED = 2;
  var HANDLED = 1;
  var UNHANDLED = 2;
  var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

  // helpers
  var isThenable = function (it) {
    var then;
    return isObject$6(it) && isCallable$3(then = it.then) ? then : false;
  };
  var callReaction = function (reaction, state) {
    var value = state.value;
    var ok = state.state == FULFILLED;
    var handler = ok ? reaction.ok : reaction.fail;
    var resolve = reaction.resolve;
    var reject = reaction.reject;
    var domain = reaction.domain;
    var result, then, exited;
    try {
      if (handler) {
        if (!ok) {
          if (state.rejection === UNHANDLED) onHandleUnhandled(state);
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
          reject(TypeError$2('Promise-chain cycle'));
        } else if (then = isThenable(result)) {
          call$8(then, result, resolve, reject);
        } else resolve(result);
      } else reject(value);
    } catch (error) {
      if (domain && !exited) domain.exit();
      reject(error);
    }
  };
  var notify = function (state, isReject) {
    if (state.notified) return;
    state.notified = true;
    microtask(function () {
      var reactions = state.reactions;
      var reaction;
      while (reaction = reactions.get()) {
        callReaction(reaction, state);
      }
      state.notified = false;
      if (isReject && !state.rejection) onUnhandled(state);
    });
  };
  var dispatchEvent = function (name, promise, reason) {
    var event, handler;
    if (DISPATCH_EVENT) {
      event = document$1.createEvent('Event');
      event.promise = promise;
      event.reason = reason;
      event.initEvent(name, false, true);
      global$6.dispatchEvent(event);
    } else event = {
      promise: promise,
      reason: reason
    };
    if (!NATIVE_PROMISE_REJECTION_EVENT && (handler = global$6['on' + name])) handler(event);else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
  };
  var onUnhandled = function (state) {
    call$8(task, global$6, function () {
      var promise = state.facade;
      var value = state.value;
      var IS_UNHANDLED = isUnhandled(state);
      var result;
      if (IS_UNHANDLED) {
        result = perform$2(function () {
          if (IS_NODE) {
            process$1.emit('unhandledRejection', value, promise);
          } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
        });
        // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
        state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
        if (result.error) throw result.value;
      }
    });
  };
  var isUnhandled = function (state) {
    return state.rejection !== HANDLED && !state.parent;
  };
  var onHandleUnhandled = function (state) {
    call$8(task, global$6, function () {
      var promise = state.facade;
      if (IS_NODE) {
        process$1.emit('rejectionHandled', promise);
      } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
    });
  };
  var bind$2 = function (fn, state, unwrap) {
    return function (value) {
      fn(state, value, unwrap);
    };
  };
  var internalReject = function (state, value, unwrap) {
    if (state.done) return;
    state.done = true;
    if (unwrap) state = unwrap;
    state.value = value;
    state.state = REJECTED;
    notify(state, true);
  };
  var internalResolve = function (state, value, unwrap) {
    if (state.done) return;
    state.done = true;
    if (unwrap) state = unwrap;
    try {
      if (state.facade === value) throw TypeError$2("Promise can't be resolved itself");
      var then = isThenable(value);
      if (then) {
        microtask(function () {
          var wrapper = {
            done: false
          };
          try {
            call$8(then, value, bind$2(internalResolve, wrapper, state), bind$2(internalReject, wrapper, state));
          } catch (error) {
            internalReject(wrapper, error, state);
          }
        });
      } else {
        state.value = value;
        state.state = FULFILLED;
        notify(state, false);
      }
    } catch (error) {
      internalReject({
        done: false
      }, error, state);
    }
  };

  // constructor polyfill
  if (FORCED_PROMISE_CONSTRUCTOR$4) {
    // 25.4.3.1 Promise(executor)
    PromiseConstructor = function Promise(executor) {
      anInstance$2(this, PromisePrototype);
      aCallable$3(executor);
      call$8(Internal, this);
      var state = getInternalPromiseState(this);
      try {
        executor(bind$2(internalResolve, state), bind$2(internalReject, state));
      } catch (error) {
        internalReject(state, error);
      }
    };
    PromisePrototype = PromiseConstructor.prototype;

    // eslint-disable-next-line no-unused-vars -- required for `.length`
    Internal = function Promise(executor) {
      setInternalState$2(this, {
        type: PROMISE,
        done: false,
        notified: false,
        parent: false,
        reactions: new Queue(),
        rejection: false,
        state: PENDING,
        value: undefined
      });
    };

    // `Promise.prototype.then` method
    // https://tc39.es/ecma262/#sec-promise.prototype.then
    Internal.prototype = defineBuiltIn$4(PromisePrototype, 'then', function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
      state.parent = true;
      reaction.ok = isCallable$3(onFulfilled) ? onFulfilled : true;
      reaction.fail = isCallable$3(onRejected) && onRejected;
      reaction.domain = IS_NODE ? process$1.domain : undefined;
      if (state.state == PENDING) state.reactions.add(reaction);else microtask(function () {
        callReaction(reaction, state);
      });
      return reaction.promise;
    });
    OwnPromiseCapability = function () {
      var promise = new Internal();
      var state = getInternalPromiseState(promise);
      this.promise = promise;
      this.resolve = bind$2(internalResolve, state);
      this.reject = bind$2(internalReject, state);
    };
    newPromiseCapabilityModule$3.f = newPromiseCapability$1 = function (C) {
      return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
    };
    if (isCallable$3(NativePromiseConstructor$2) && NativePromisePrototype$1 !== Object.prototype) {
      nativeThen = NativePromisePrototype$1.then;
      if (!NATIVE_PROMISE_SUBCLASSING) {
        // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
        defineBuiltIn$4(NativePromisePrototype$1, 'then', function then(onFulfilled, onRejected) {
          var that = this;
          return new PromiseConstructor(function (resolve, reject) {
            call$8(nativeThen, that, resolve, reject);
          }).then(onFulfilled, onRejected);
          // https://github.com/zloirock/core-js/issues/640
        }, {
          unsafe: true
        });
      }

      // make `.constructor === Promise` work for native promise-based APIs
      try {
        delete NativePromisePrototype$1.constructor;
      } catch (error) {/* empty */}

      // make `instanceof Promise` work for native promise-based APIs
      if (setPrototypeOf$1) {
        setPrototypeOf$1(NativePromisePrototype$1, PromisePrototype);
      }
    }
  }
  $$h({
    global: true,
    constructor: true,
    wrap: true,
    forced: FORCED_PROMISE_CONSTRUCTOR$4
  }, {
    Promise: PromiseConstructor
  });
  setToStringTag$1(PromiseConstructor, PROMISE, false);
  setSpecies$1(PROMISE);

  var wellKnownSymbol$4 = wellKnownSymbol$j;
  var Iterators$1 = iterators;
  var ITERATOR$2 = wellKnownSymbol$4('iterator');
  var ArrayPrototype = Array.prototype;

  // check on default Array iterator
  var isArrayIteratorMethod$1 = function (it) {
    return it !== undefined && (Iterators$1.Array === it || ArrayPrototype[ITERATOR$2] === it);
  };

  var classof$4 = classof$8;
  var getMethod$1 = getMethod$3;
  var isNullOrUndefined$2 = isNullOrUndefined$6;
  var Iterators = iterators;
  var wellKnownSymbol$3 = wellKnownSymbol$j;
  var ITERATOR$1 = wellKnownSymbol$3('iterator');
  var getIteratorMethod$2 = function (it) {
    if (!isNullOrUndefined$2(it)) return getMethod$1(it, ITERATOR$1) || getMethod$1(it, '@@iterator') || Iterators[classof$4(it)];
  };

  var call$7 = functionCall;
  var aCallable$2 = aCallable$8;
  var anObject$5 = anObject$c;
  var tryToString$1 = tryToString$4;
  var getIteratorMethod$1 = getIteratorMethod$2;
  var $TypeError$2 = TypeError;
  var getIterator$1 = function (argument, usingIterator) {
    var iteratorMethod = arguments.length < 2 ? getIteratorMethod$1(argument) : usingIterator;
    if (aCallable$2(iteratorMethod)) return anObject$5(call$7(iteratorMethod, argument));
    throw $TypeError$2(tryToString$1(argument) + ' is not iterable');
  };

  var call$6 = functionCall;
  var anObject$4 = anObject$c;
  var getMethod = getMethod$3;
  var iteratorClose$1 = function (iterator, kind, value) {
    var innerResult, innerError;
    anObject$4(iterator);
    try {
      innerResult = getMethod(iterator, 'return');
      if (!innerResult) {
        if (kind === 'throw') throw value;
        return value;
      }
      innerResult = call$6(innerResult, iterator);
    } catch (error) {
      innerError = true;
      innerResult = error;
    }
    if (kind === 'throw') throw value;
    if (innerError) throw innerResult;
    anObject$4(innerResult);
    return value;
  };

  var bind$1 = functionBindContext;
  var call$5 = functionCall;
  var anObject$3 = anObject$c;
  var tryToString = tryToString$4;
  var isArrayIteratorMethod = isArrayIteratorMethod$1;
  var lengthOfArrayLike$1 = lengthOfArrayLike$5;
  var isPrototypeOf$2 = objectIsPrototypeOf;
  var getIterator = getIterator$1;
  var getIteratorMethod = getIteratorMethod$2;
  var iteratorClose = iteratorClose$1;
  var $TypeError$1 = TypeError;
  var Result = function (stopped, result) {
    this.stopped = stopped;
    this.result = result;
  };
  var ResultPrototype = Result.prototype;
  var iterate$4 = function (iterable, unboundFunction, options) {
    var that = options && options.that;
    var AS_ENTRIES = !!(options && options.AS_ENTRIES);
    var IS_RECORD = !!(options && options.IS_RECORD);
    var IS_ITERATOR = !!(options && options.IS_ITERATOR);
    var INTERRUPTED = !!(options && options.INTERRUPTED);
    var fn = bind$1(unboundFunction, that);
    var iterator, iterFn, index, length, result, next, step;
    var stop = function (condition) {
      if (iterator) iteratorClose(iterator, 'normal', condition);
      return new Result(true, condition);
    };
    var callFn = function (value) {
      if (AS_ENTRIES) {
        anObject$3(value);
        return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
      }
      return INTERRUPTED ? fn(value, stop) : fn(value);
    };
    if (IS_RECORD) {
      iterator = iterable.iterator;
    } else if (IS_ITERATOR) {
      iterator = iterable;
    } else {
      iterFn = getIteratorMethod(iterable);
      if (!iterFn) throw $TypeError$1(tryToString(iterable) + ' is not iterable');
      // optimisation for array iterators
      if (isArrayIteratorMethod(iterFn)) {
        for (index = 0, length = lengthOfArrayLike$1(iterable); length > index; index++) {
          result = callFn(iterable[index]);
          if (result && isPrototypeOf$2(ResultPrototype, result)) return result;
        }
        return new Result(false);
      }
      iterator = getIterator(iterable, iterFn);
    }
    next = IS_RECORD ? iterable.next : iterator.next;
    while (!(step = call$5(next, iterator)).done) {
      try {
        result = callFn(step.value);
      } catch (error) {
        iteratorClose(iterator, 'throw', error);
      }
      if (typeof result == 'object' && result && isPrototypeOf$2(ResultPrototype, result)) return result;
    }
    return new Result(false);
  };

  var wellKnownSymbol$2 = wellKnownSymbol$j;
  var ITERATOR = wellKnownSymbol$2('iterator');
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
    iteratorWithReturn[ITERATOR] = function () {
      return this;
    };
    // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
    Array.from(iteratorWithReturn, function () {
      throw 2;
    });
  } catch (error) {/* empty */}
  var checkCorrectnessOfIteration$2 = function (exec, SKIP_CLOSING) {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
    var ITERATION_SUPPORT = false;
    try {
      var object = {};
      object[ITERATOR] = function () {
        return {
          next: function () {
            return {
              done: ITERATION_SUPPORT = true
            };
          }
        };
      };
      exec(object);
    } catch (error) {/* empty */}
    return ITERATION_SUPPORT;
  };

  var NativePromiseConstructor$1 = promiseNativeConstructor;
  var checkCorrectnessOfIteration$1 = checkCorrectnessOfIteration$2;
  var FORCED_PROMISE_CONSTRUCTOR$3 = promiseConstructorDetection.CONSTRUCTOR;
  var promiseStaticsIncorrectIteration = FORCED_PROMISE_CONSTRUCTOR$3 || !checkCorrectnessOfIteration$1(function (iterable) {
    NativePromiseConstructor$1.all(iterable).then(undefined, function () {/* empty */});
  });

  var $$g = _export;
  var call$4 = functionCall;
  var aCallable$1 = aCallable$8;
  var newPromiseCapabilityModule$2 = newPromiseCapability$2;
  var perform$1 = perform$3;
  var iterate$3 = iterate$4;
  var PROMISE_STATICS_INCORRECT_ITERATION$1 = promiseStaticsIncorrectIteration;

  // `Promise.all` method
  // https://tc39.es/ecma262/#sec-promise.all
  $$g({
    target: 'Promise',
    stat: true,
    forced: PROMISE_STATICS_INCORRECT_ITERATION$1
  }, {
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapabilityModule$2.f(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      var result = perform$1(function () {
        var $promiseResolve = aCallable$1(C.resolve);
        var values = [];
        var counter = 0;
        var remaining = 1;
        iterate$3(iterable, function (promise) {
          var index = counter++;
          var alreadyCalled = false;
          remaining++;
          call$4($promiseResolve, C, promise).then(function (value) {
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
    }
  });

  var $$f = _export;
  var FORCED_PROMISE_CONSTRUCTOR$2 = promiseConstructorDetection.CONSTRUCTOR;
  var NativePromiseConstructor = promiseNativeConstructor;
  var getBuiltIn$1 = getBuiltIn$7;
  var isCallable$2 = isCallable$m;
  var defineBuiltIn$3 = defineBuiltIn$9;
  var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;

  // `Promise.prototype.catch` method
  // https://tc39.es/ecma262/#sec-promise.prototype.catch
  $$f({
    target: 'Promise',
    proto: true,
    forced: FORCED_PROMISE_CONSTRUCTOR$2,
    real: true
  }, {
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });

  // makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
  if (isCallable$2(NativePromiseConstructor)) {
    var method = getBuiltIn$1('Promise').prototype['catch'];
    if (NativePromisePrototype['catch'] !== method) {
      defineBuiltIn$3(NativePromisePrototype, 'catch', method, {
        unsafe: true
      });
    }
  }

  var $$e = _export;
  var call$3 = functionCall;
  var aCallable = aCallable$8;
  var newPromiseCapabilityModule$1 = newPromiseCapability$2;
  var perform = perform$3;
  var iterate$2 = iterate$4;
  var PROMISE_STATICS_INCORRECT_ITERATION = promiseStaticsIncorrectIteration;

  // `Promise.race` method
  // https://tc39.es/ecma262/#sec-promise.race
  $$e({
    target: 'Promise',
    stat: true,
    forced: PROMISE_STATICS_INCORRECT_ITERATION
  }, {
    race: function race(iterable) {
      var C = this;
      var capability = newPromiseCapabilityModule$1.f(C);
      var reject = capability.reject;
      var result = perform(function () {
        var $promiseResolve = aCallable(C.resolve);
        iterate$2(iterable, function (promise) {
          call$3($promiseResolve, C, promise).then(capability.resolve, reject);
        });
      });
      if (result.error) reject(result.value);
      return capability.promise;
    }
  });

  var $$d = _export;
  var call$2 = functionCall;
  var newPromiseCapabilityModule = newPromiseCapability$2;
  var FORCED_PROMISE_CONSTRUCTOR$1 = promiseConstructorDetection.CONSTRUCTOR;

  // `Promise.reject` method
  // https://tc39.es/ecma262/#sec-promise.reject
  $$d({
    target: 'Promise',
    stat: true,
    forced: FORCED_PROMISE_CONSTRUCTOR$1
  }, {
    reject: function reject(r) {
      var capability = newPromiseCapabilityModule.f(this);
      call$2(capability.reject, undefined, r);
      return capability.promise;
    }
  });

  var anObject$2 = anObject$c;
  var isObject$5 = isObject$f;
  var newPromiseCapability = newPromiseCapability$2;
  var promiseResolve$1 = function (C, x) {
    anObject$2(C);
    if (isObject$5(x) && x.constructor === C) return x;
    var promiseCapability = newPromiseCapability.f(C);
    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var $$c = _export;
  var getBuiltIn = getBuiltIn$7;
  var FORCED_PROMISE_CONSTRUCTOR = promiseConstructorDetection.CONSTRUCTOR;
  var promiseResolve = promiseResolve$1;
  getBuiltIn('Promise');

  // `Promise.resolve` method
  // https://tc39.es/ecma262/#sec-promise.resolve
  $$c({
    target: 'Promise',
    stat: true,
    forced: FORCED_PROMISE_CONSTRUCTOR
  }, {
    resolve: function resolve(x) {
      return promiseResolve(this, x);
    }
  });

  var classof$3 = classof$8;
  var $String = String;
  var toString$5 = function (argument) {
    if (classof$3(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
    return $String(argument);
  };

  var anObject$1 = anObject$c;

  // `RegExp.prototype.flags` getter implementation
  // https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
  var regexpFlags$1 = function () {
    var that = anObject$1(this);
    var result = '';
    if (that.hasIndices) result += 'd';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.dotAll) result += 's';
    if (that.unicode) result += 'u';
    if (that.unicodeSets) result += 'v';
    if (that.sticky) result += 'y';
    return result;
  };

  var fails$b = fails$s;
  var global$5 = global$n;

  // babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var $RegExp$2 = global$5.RegExp;
  var UNSUPPORTED_Y$1 = fails$b(function () {
    var re = $RegExp$2('a', 'y');
    re.lastIndex = 2;
    return re.exec('abcd') != null;
  });

  // UC Browser bug
  // https://github.com/zloirock/core-js/issues/1008
  var MISSED_STICKY = UNSUPPORTED_Y$1 || fails$b(function () {
    return !$RegExp$2('a', 'y').sticky;
  });
  var BROKEN_CARET = UNSUPPORTED_Y$1 || fails$b(function () {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
    var re = $RegExp$2('^r', 'gy');
    re.lastIndex = 2;
    return re.exec('str') != null;
  });
  var regexpStickyHelpers = {
    BROKEN_CARET: BROKEN_CARET,
    MISSED_STICKY: MISSED_STICKY,
    UNSUPPORTED_Y: UNSUPPORTED_Y$1
  };

  var fails$a = fails$s;
  var global$4 = global$n;

  // babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
  var $RegExp$1 = global$4.RegExp;
  var regexpUnsupportedDotAll = fails$a(function () {
    var re = $RegExp$1('.', 's');
    return !(re.dotAll && re.exec('\n') && re.flags === 's');
  });

  var fails$9 = fails$s;
  var global$3 = global$n;

  // babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
  var $RegExp = global$3.RegExp;
  var regexpUnsupportedNcg = fails$9(function () {
    var re = $RegExp('(?<a>b)', 'g');
    return re.exec('b').groups.a !== 'b' || 'b'.replace(re, '$<a>c') !== 'bc';
  });

  /* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
  /* eslint-disable regexp/no-useless-quantifier -- testing */
  var call$1 = functionCall;
  var uncurryThis$8 = functionUncurryThis;
  var toString$4 = toString$5;
  var regexpFlags = regexpFlags$1;
  var stickyHelpers = regexpStickyHelpers;
  var shared = sharedExports;
  var create$1 = objectCreate;
  var getInternalState$1 = internalState.get;
  var UNSUPPORTED_DOT_ALL = regexpUnsupportedDotAll;
  var UNSUPPORTED_NCG = regexpUnsupportedNcg;
  var nativeReplace = shared('native-string-replace', String.prototype.replace);
  var nativeExec = RegExp.prototype.exec;
  var patchedExec = nativeExec;
  var charAt$2 = uncurryThis$8(''.charAt);
  var indexOf = uncurryThis$8(''.indexOf);
  var replace$1 = uncurryThis$8(''.replace);
  var stringSlice$2 = uncurryThis$8(''.slice);
  var UPDATES_LAST_INDEX_WRONG = function () {
    var re1 = /a/;
    var re2 = /b*/g;
    call$1(nativeExec, re1, 'a');
    call$1(nativeExec, re2, 'a');
    return re1.lastIndex !== 0 || re2.lastIndex !== 0;
  }();
  var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;

  // nonparticipating capturing group, copied from es5-shim's String#split patch.
  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;
  if (PATCH) {
    patchedExec = function exec(string) {
      var re = this;
      var state = getInternalState$1(re);
      var str = toString$4(string);
      var raw = state.raw;
      var result, reCopy, lastIndex, match, i, object, group;
      if (raw) {
        raw.lastIndex = re.lastIndex;
        result = call$1(patchedExec, raw, str);
        re.lastIndex = raw.lastIndex;
        return result;
      }
      var groups = state.groups;
      var sticky = UNSUPPORTED_Y && re.sticky;
      var flags = call$1(regexpFlags, re);
      var source = re.source;
      var charsAdded = 0;
      var strCopy = str;
      if (sticky) {
        flags = replace$1(flags, 'y', '');
        if (indexOf(flags, 'g') === -1) {
          flags += 'g';
        }
        strCopy = stringSlice$2(str, re.lastIndex);
        // Support anchored sticky behavior.
        if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$2(str, re.lastIndex - 1) !== '\n')) {
          source = '(?: ' + source + ')';
          strCopy = ' ' + strCopy;
          charsAdded++;
        }
        // ^(? + rx + ) is needed, in combination with some str slicing, to
        // simulate the 'y' flag.
        reCopy = new RegExp('^(?:' + source + ')', flags);
      }
      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
      }
      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
      match = call$1(nativeExec, sticky ? reCopy : re, strCopy);
      if (sticky) {
        if (match) {
          match.input = stringSlice$2(match.input, charsAdded);
          match[0] = stringSlice$2(match[0], charsAdded);
          match.index = re.lastIndex;
          re.lastIndex += match[0].length;
        } else re.lastIndex = 0;
      } else if (UPDATES_LAST_INDEX_WRONG && match) {
        re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
      }
      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
        call$1(nativeReplace, match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }
      if (match && groups) {
        match.groups = object = create$1(null);
        for (i = 0; i < groups.length; i++) {
          group = groups[i];
          object[group[0]] = match[group[1]];
        }
      }
      return match;
    };
  }
  var regexpExec = patchedExec;

  var $$b = _export;
  var exec = regexpExec;

  // `RegExp.prototype.exec` method
  // https://tc39.es/ecma262/#sec-regexp.prototype.exec
  $$b({
    target: 'RegExp',
    proto: true,
    forced: /./.exec !== exec
  }, {
    exec: exec
  });

  /**
   * Provide feature detection
   * @class Features
   */
  var Features = /*#__PURE__*/function () {
    function Features() {
      _classCallCheck(this, Features);
    }
    _createClass(Features, null, [{
      key: "webgl",
      get:
      /**
       * If the browser has WebGL support
       * @property {boolean} webgl
       */
      function get() {
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
        return !!('ontouchstart' in window ||
        // iOS & Android
        navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 ||
        // IE10
        navigator.pointerEnabled && navigator.maxTouchPoints > 0); // IE11+
      }

      /**
       * Test for basic browser compatiliblity
       * @method basic
       * @static
       * @return {String} The error message, if fails
       */
    }, {
      key: "basic",
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
        }

        // Failed negative touch requirement
        if (!ui.touch && Features.touch) {
          return 'Game does not support touch input';
        }

        // Check the sizes
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
      key: "info",
      get: function get() {
        return "Browser Feature Detection\n\t\t\t\tCanvas support ".concat(Features.canvas ? "\u2713" : "\xD7", "\n\t\t\t\tWebGL support ").concat(Features.webgl ? "\u2713" : "\xD7", "\n\t\t\t\tWebAudio support ").concat(Features.webAudio ? "\u2713" : "\xD7");
      }
    }]);
    return Features;
  }();

  var uncurryThis$7 = functionUncurryThis;
  var toIntegerOrInfinity = toIntegerOrInfinity$3;
  var toString$3 = toString$5;
  var requireObjectCoercible$2 = requireObjectCoercible$5;
  var charAt$1 = uncurryThis$7(''.charAt);
  var charCodeAt$1 = uncurryThis$7(''.charCodeAt);
  var stringSlice$1 = uncurryThis$7(''.slice);
  var createMethod$2 = function (CONVERT_TO_STRING) {
    return function ($this, pos) {
      var S = toString$3(requireObjectCoercible$2($this));
      var position = toIntegerOrInfinity(pos);
      var size = S.length;
      var first, second;
      if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
      first = charCodeAt$1(S, position);
      return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = charCodeAt$1(S, position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? charAt$1(S, position) : first : CONVERT_TO_STRING ? stringSlice$1(S, position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
    };
  };
  var stringMultibyte = {
    // `String.prototype.codePointAt` method
    // https://tc39.es/ecma262/#sec-string.prototype.codepointat
    codeAt: createMethod$2(false),
    // `String.prototype.at` method
    // https://github.com/mathiasbynens/String.prototype.at
    charAt: createMethod$2(true)
  };

  var charAt = stringMultibyte.charAt;
  var toString$2 = toString$5;
  var InternalStateModule$1 = internalState;
  var defineIterator$1 = iteratorDefine;
  var createIterResultObject$1 = createIterResultObject$3;
  var STRING_ITERATOR = 'String Iterator';
  var setInternalState$1 = InternalStateModule$1.set;
  var getInternalState = InternalStateModule$1.getterFor(STRING_ITERATOR);

  // `String.prototype[@@iterator]` method
  // https://tc39.es/ecma262/#sec-string.prototype-@@iterator
  defineIterator$1(String, 'String', function (iterated) {
    setInternalState$1(this, {
      type: STRING_ITERATOR,
      string: toString$2(iterated),
      index: 0
    });
    // `%StringIteratorPrototype%.next` method
    // https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
  }, function next() {
    var state = getInternalState(this);
    var string = state.string;
    var index = state.index;
    var point;
    if (index >= string.length) return createIterResultObject$1(undefined, true);
    point = charAt(string, index);
    state.index += point.length;
    return createIterResultObject$1(point, false);
  });

  var $$a = _export;
  var $filter = arrayIteration.filter;
  var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport$3;
  var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$1('filter');

  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  // with adding support of @@species
  $$a({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT$1
  }, {
    filter: function filter(callbackfn /* , thisArg */) {
      return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var $$9 = _export;
  var $find = arrayIteration.find;
  var addToUnscopables$1 = addToUnscopables$3;
  var FIND = 'find';
  var SKIPS_HOLES = true;

  // Shouldn't skip holes
  if (FIND in []) Array(1)[FIND](function () {
    SKIPS_HOLES = false;
  });

  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  $$9({
    target: 'Array',
    proto: true,
    forced: SKIPS_HOLES
  }, {
    find: function find(callbackfn /* , that = undefined */) {
      return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables$1(FIND);

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
          function e(n, o, i, s) {
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
          }
          var n;
          this._invoke = function (t, r) {
            function o() {
              return new Promise(function (n, o) {
                e(t, r, n, o);
              });
            }
            return n = n ? n.then(o, o) : o();
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
    f = t(function (t) {
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
      }), e && f(t, e);
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
              console.warn("Bellhop error: ", t);
            }
            this.connected && "object" === e(n) && n.type && this.trigger(n);
          }
        }
      }, {
        key: "onConnectionReceived",
        value: function (t) {
          if (this.connecting = !1, this.connected = !0, !this.isChild) {
            if (!this.target) return;
            this.target.postMessage(t, this.origin);
          }
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
              return s.async(function (i) {
                for (;;) switch (i.prev = i.next) {
                  case 0:
                    if (n && r.off(o, t), "function" != typeof e) {
                      i.next = 10;
                      break;
                    }
                    return i.t0 = r, i.t1 = o.type, i.next = 6, s.awrap(e());
                  case 6:
                    i.t2 = i.sent, i.t0.send.call(i.t0, i.t1, i.t2), i.next = 11;
                    break;
                  case 10:
                    r.send(o.type, e);
                  case 11:
                  case "end":
                    return i.stop();
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
            received: t,
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
  var PluginManager = /*#__PURE__*/function () {
    /**
     *Creates an instance of PluginManager.
     * @memberof PluginManager
     */
    function PluginManager(_ref) {
      var _ref$plugins = _ref.plugins,
        plugins = _ref$plugins === void 0 ? [] : _ref$plugins;
      _classCallCheck(this, PluginManager);
      this.client = new y();
      // @ts-ignore
      this.client.hidden = this.client.receive.bind(this.client);
      // @ts-ignore
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
        var _loop = function _loop(i) {
          if (!_this.plugins[i].preload) {
            return "continue";
          }
          preloads.push(_this.plugins[i].preload(_this).catch(function preloadFail(error) {
            this.plugins[i].preloadFailed = true;
            console.warn(this.plugins[i].name, 'Preload Failed:', error);
          }.bind(_this)));
        };
        for (var i = 0, l = this.plugins.length; i < l; i++) {
          var _ret = _loop(i);
          if (_ret === "continue") continue;
        }

        // ~wait for all preloads to resolve
        return Promise.all(preloads).then(function () {
          // Remove plugins that fail to load.
          _this.plugins = _this.plugins.filter(function (plugin) {
            return plugin.preloadFailed !== true;
          });

          //init
          _this.plugins.forEach(function (plugin) {
            if (!plugin.init) {
              return;
            }
            plugin.init(_this);
          });

          //start
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

  var version = "2.4.6";

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
  var Container = /*#__PURE__*/function (_PluginManager) {
    _inherits(Container, _PluginManager);
    var _super = _createSuper(Container);
    /**
     *Creates an instance of Container.
     * @param {object} config
     * @param {string | HTMLIFrameElement} iframeOrSelector
     * @param {Array<BasePlugin> | null} [config.plugins]
     * @param {object | null} [config.context={}]
     * @memberof Container
     */
    function Container(iframeOrSelector) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        plugins = _ref.plugins,
        _ref$context = _ref.context,
        context = _ref$context === void 0 ? {} : _ref$context;
      _classCallCheck(this, Container);
      _this = _super.call(this, {
        plugins: plugins
      });
      _this.iframe = iframeOrSelector instanceof HTMLIFrameElement ? iframeOrSelector : document.querySelector(iframeOrSelector);
      if (null === _this.iframe) {
        throw new Error('No iframe was found with the provided selector');
      }
      _this.loaded = false;
      _this.loading = false;
      _this.release = null;

      // context object that plugins can pick up on
      _this._context = context;
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
        }

        // Reset state
        this.loaded = false;
        this.loading = false;

        // Clear the iframe src location
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
        this.client.on('localError', this.onLocalError);
        // @ts-ignore
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
        this.client.respond('singlePlay', singlePlay);
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
        var _openRemote = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(api) {
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
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
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
          this.client.trigger('close');
          // Start the close
          this.client.send('close');
        } else {
          this.reset();
        }
      }

      /**
       * the current _context object
       * @readonly
       * @memberof Container
       * @return {object}
       */
    }, {
      key: "context",
      get: function get() {
        return this._context;
      }

      /**
       * sets _context object to new object
       * @param {object} context
       * @memberof Container
       */,
      set: function set(newContext) {
        if (_typeof(newContext) !== 'object') {
          console.error('[SpringRollContainer] Context: new context provided is not an object');
          return;
        }
        this._context = newContext;
      }

      /**
       * The current version of SpringRollContainer
       * @readonly
       * @static
       * @return {string}
       * @memberof Container
       */
    }], [{
      key: "version",
      get: function get() {
        return version;
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
  var PageVisibility = /*#__PURE__*/function () {
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
       */,
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

  var $$8 = _export;
  var $includes = arrayIncludes.includes;
  var fails$8 = fails$s;
  var addToUnscopables = addToUnscopables$3;

  // FF99+ bug
  var BROKEN_ON_SPARSE = fails$8(function () {
    // eslint-disable-next-line es/no-array-prototype-includes -- detection
    return !Array(1).includes();
  });

  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  $$8({
    target: 'Array',
    proto: true,
    forced: BROKEN_ON_SPARSE
  }, {
    includes: function includes(el /* , fromIndex = 0 */) {
      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables('includes');

  // a string of all valid unicode whitespaces
  var whitespaces$2 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' + '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

  var uncurryThis$6 = functionUncurryThis;
  var requireObjectCoercible$1 = requireObjectCoercible$5;
  var toString$1 = toString$5;
  var whitespaces$1 = whitespaces$2;
  var replace = uncurryThis$6(''.replace);
  var ltrim = RegExp('^[' + whitespaces$1 + ']+');
  var rtrim = RegExp('(^|[^' + whitespaces$1 + '])[' + whitespaces$1 + ']+$');

  // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
  var createMethod$1 = function (TYPE) {
    return function ($this) {
      var string = toString$1(requireObjectCoercible$1($this));
      if (TYPE & 1) string = replace(string, ltrim, '');
      if (TYPE & 2) string = replace(string, rtrim, '$1');
      return string;
    };
  };
  var stringTrim = {
    // `String.prototype.{ trimLeft, trimStart }` methods
    // https://tc39.es/ecma262/#sec-string.prototype.trimstart
    start: createMethod$1(1),
    // `String.prototype.{ trimRight, trimEnd }` methods
    // https://tc39.es/ecma262/#sec-string.prototype.trimend
    end: createMethod$1(2),
    // `String.prototype.trim` method
    // https://tc39.es/ecma262/#sec-string.prototype.trim
    trim: createMethod$1(3)
  };

  var PROPER_FUNCTION_NAME$1 = functionName.PROPER;
  var fails$7 = fails$s;
  var whitespaces = whitespaces$2;
  var non = '\u200B\u0085\u180E';

  // check that a method works with the correct list
  // of whitespaces and has a correct name
  var stringTrimForced = function (METHOD_NAME) {
    return fails$7(function () {
      return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() !== non || PROPER_FUNCTION_NAME$1 && whitespaces[METHOD_NAME].name !== METHOD_NAME;
    });
  };

  var $$7 = _export;
  var $trim = stringTrim.trim;
  var forcedStringTrimMethod = stringTrimForced;

  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  $$7({
    target: 'String',
    proto: true,
    forced: forcedStringTrimMethod('trim')
  }, {
    trim: function trim() {
      return $trim(this);
    }
  });

  var call = functionCall;
  var hasOwn$2 = hasOwnProperty_1;
  var isPrototypeOf$1 = objectIsPrototypeOf;
  var regExpFlags = regexpFlags$1;
  var RegExpPrototype$1 = RegExp.prototype;
  var regexpGetFlags = function (R) {
    var flags = R.flags;
    return flags === undefined && !('flags' in RegExpPrototype$1) && !hasOwn$2(R, 'flags') && isPrototypeOf$1(RegExpPrototype$1, R) ? call(regExpFlags, R) : flags;
  };

  var PROPER_FUNCTION_NAME = functionName.PROPER;
  var defineBuiltIn$2 = defineBuiltIn$9;
  var anObject = anObject$c;
  var $toString = toString$5;
  var fails$6 = fails$s;
  var getRegExpFlags = regexpGetFlags;
  var TO_STRING = 'toString';
  var RegExpPrototype = RegExp.prototype;
  var nativeToString = RegExpPrototype[TO_STRING];
  var NOT_GENERIC = fails$6(function () {
    return nativeToString.call({
      source: 'a',
      flags: 'b'
    }) != '/a/b';
  });
  // FF44- RegExp#toString has a wrong name
  var INCORRECT_NAME = PROPER_FUNCTION_NAME && nativeToString.name != TO_STRING;

  // `RegExp.prototype.toString` method
  // https://tc39.es/ecma262/#sec-regexp.prototype.tostring
  if (NOT_GENERIC || INCORRECT_NAME) {
    defineBuiltIn$2(RegExp.prototype, TO_STRING, function toString() {
      var R = anObject(this);
      var pattern = $toString(R.source);
      var flags = $toString(getRegExpFlags(R));
      return '/' + pattern + '/' + flags;
    }, {
      unsafe: true
    });
  }

  /**
   * The SavedData functions use localStorage and sessionStorage, with a cookie fallback.
   *
   * @class SavedData
   */
  var SavedData = /*#__PURE__*/function () {
    /**
     * Constructor for IndexedDB work
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
      value:
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
      function IDBOpen(dbName) {
        var _this = this;
        var dbVersion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var additions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var deletions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var callback = arguments.length > 4 ? arguments[4] : undefined;
        var request = dbVersion ? indexedDB.open(dbName, dbVersion) : indexedDB.open(dbName);
        request.onsuccess = function (e) {
          // Database successfully opened. This will run along with onupgradeneeded
          _this.db = e.target.result;
          if (_this.db.version == dbVersion | dbVersion == null) {
            callback({
              result: 'Success: IDBOpen',
              success: true
            });
          }
        };
        request.onerror = function () {
          callback({
            result: request.error.toString(),
            success: false
          });
        };

        // on upgrade needed fires only if the dbVersion is higher than the current version number
        request.onupgradeneeded = function (e) {
          // Ensure the proper database object is stored
          _this.db = e.target.result;
          if (additions != null) {
            if (additions.stores) {
              additions.stores.forEach(function (store) {
                _this.db.createObjectStore(store.storeName, store.options);
              });
            }
            if (additions.indexes != null) {
              additions.indexes.forEach(function (index) {
                // Add indexes last to avoid adding an index to a store that has yet to be created
                // Open a transaction returning a store object
                var storeObject = request.transaction.objectStore(index.storeName);
                storeObject.createIndex(index.indexName, index.keyPath, index.options);
              });
            }
          }
          if (deletions != null) {
            if (deletions.indexes != null) {
              // delete indexes first to avoid deleting an index to a store that has already to been deleted
              deletions.indexes.forEach(function (index) {
                // Open a transaction returning a store object
                var storeObject = request.transaction.objectStore(index.storeName);
                storeObject.deleteIndex(index.indexName);
              });
            }
            if (deletions.stores) {
              deletions.stores.forEach(function (store) {
                _this.db.deleteObjectStore(store.storeName);
              });
            }
          }
          callback({
            result: 'Success: IDBOpen onupgradeneeded ran',
            success: true
          });
        };
      }

      /**
       * Delete a database and all records, stores, and indexes associated
       * @param {string} dbName Name of the database to delete
       * @param {object} options Optionally pass in options
       * @param {function} callback The callback to be run on success or error. One value will be passed into this function
       */
    }, {
      key: "IDBDeleteDB",
      value: function IDBDeleteDB(dbName) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var request = options != null ? indexedDB.deleteDatabase(dbName, options) : indexedDB.deleteDatabase(dbName);
        request.onsuccess = function (e) {
          callback({
            result: 'Success: Database Deleted, returned: ' + e.result,
            success: true
          });
        };
        request.onerror = function () {
          callback({
            result: request.error.toString(),
            success: false
          });
        };
      }

      /**
       * Add a record to a given store
       * @param {string} storeName The name of the store from which the record will be updated
       * @param {string} key the key of the record to be updated
       * @param {string} value The value for the record with the given key to be updated
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */
    }, {
      key: "IDBAdd",
      value: function IDBAdd(storeName, value, key, callback) {
        if (!this.db && this.dbName != '') {
          this.IDBOpen(this.dbName);
        }
        var tx = this.db.transaction(storeName, 'readwrite');
        tx.onerror = function () {
          return callback({
            result: tx.error != null ? tx.error.toString() : 'Aborted: No error given, was the record already added?',
            success: false
          });
        };
        tx.onabort = function () {
          return callback({
            result: tx.error != null ? tx.error.toString() : 'Aborted: No error given, was the record already added?',
            success: false
          });
        };
        tx.oncomplete = function () {
          return callback({
            result: 'Success: Record Added',
            success: true
          });
        };
        var store = tx.objectStore(storeName);
        store.add(value, key);
      }

      /**
       * Update a record in a given store
       * @param {string} storeName The name of the store from which the record will be updated
       * @param {string} key the key of the record to be updated
       * @param {string | object} value The altered object to be updated from the given store
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */
    }, {
      key: "IDBUpdate",
      value: function IDBUpdate(storeName, key, value, callback) {
        if (!this.db && this.dbName != '') {
          this.IDBOpen(this.dbName);
        }
        var tx = this.db.transaction(storeName, 'readwrite');
        var store = tx.objectStore(storeName);
        var updateRequest = store.put(value, key);
        updateRequest.onsuccess = function () {
          callback({
            result: 'Success: Record Updated',
            success: true
          });
        };
        updateRequest.onerror = function () {
          return callback({
            result: updateRequest.error.toString(),
            success: false
          });
        };
      }

      /**
       * Delete a given record within a given store
       * @param {string} storeName The name of the store from which the record will be removed
       * @param {string} key the key of the record to be removed
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
       * @param {string} storeName the name of the store to read from
       * @param {string} key The key for the record in the given store
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */
    }, {
      key: "IDBRead",
      value: function IDBRead(storeName, key, callback) {
        var _this3 = this;
        // Open transaction with a store
        var tx = this.db.transaction(storeName, 'readonly');
        // Get the store object from the transaction
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
            result: readRequest.result,
            success: readRequest.result != undefined ? true : false
          });
        };
      }

      /**
       * Get all keys with given index
       * @param {string} storeName the name of the store to be read from
       * @param {string} indexName the name of the index to be read from
       * @param {string} query Optionally give a keyRange of records to return
       * @param {string} count Optionally give a max limit on records to be returned
       * @param {function} callback The method to call on success or failure. A single value will be passed in as a parameter
       */
    }, {
      key: "IDBGetIndexKeys",
      value: function IDBGetIndexKeys(storeName, indexName) {
        var _this4 = this;
        var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var count = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        // Open transaction with a store
        var tx = this.db.transaction(storeName, 'readonly');
        // Get the store object from the transaction
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
        // Open transaction with a store
        var tx = this.db.transaction(storeName, 'readonly');
        // Get the store object from the transaction
        var store = tx.objectStore(storeName);
        var readRequest = count != null ? store.getAll(null, count) : store.getAll();

        // const readRequest = store.getAll();

        tx.onerror = function () {
          return callback({
            result: tx.error.toString(),
            success: false
          });
        };
        readRequest.onsuccess = function () {
          callback({
            result: readRequest.result,
            success: readRequest.result != undefined ? true : false
          });
        };
      }

      /**
       * Get the version number of a given database. This will create a database if it doesn't exist.
       * Do not call this after opening a connection with the database
       * @param {string} dbName The name of the database for which the version will be returned
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */
    }, {
      key: "IDBGetVersion",
      value: function IDBGetVersion(dbName, callback) {
        // Open the database
        var dBOpenRequest = window.indexedDB.open(dbName);

        // these two event handlers act on the database
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
       * @param {string} name The name of the value to save
       * @param {string} value The value to save. This will be run through JSON.stringify().
       * @param {boolean} [tempOnly=false] If the value should be saved only in the current browser session.
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
  var BasePlugin = /*#__PURE__*/function () {
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
        var _preload = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(_ref) {
          var client;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                client = _ref.client;
                this.client = client;
              case 2:
              case "end":
                return _context.stop();
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
        console.warn("[SpringRollContainer] ".concat(this.name, ": ").concat(warningText));
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
  var ButtonPlugin = /*#__PURE__*/function (_BasePlugin) {
    _inherits(ButtonPlugin, _BasePlugin);
    var _super = _createSuper(ButtonPlugin);
    /**
     *Creates an instance of ButtonPlugin.
     * @param {string} name
     *
     * @memberof ButtonPlugin
     */
    function ButtonPlugin(name) {
      var _this;
      _classCallCheck(this, ButtonPlugin);
      _this = _super.call(this, name);
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

  var isObject$4 = isObject$f;
  var classof$2 = classofRaw$2;
  var wellKnownSymbol$1 = wellKnownSymbol$j;
  var MATCH$1 = wellKnownSymbol$1('match');

  // `IsRegExp` abstract operation
  // https://tc39.es/ecma262/#sec-isregexp
  var isRegexp = function (it) {
    var isRegExp;
    return isObject$4(it) && ((isRegExp = it[MATCH$1]) !== undefined ? !!isRegExp : classof$2(it) == 'RegExp');
  };

  var isRegExp = isRegexp;
  var $TypeError = TypeError;
  var notARegexp = function (it) {
    if (isRegExp(it)) {
      throw $TypeError("The method doesn't accept regular expressions");
    }
    return it;
  };

  var wellKnownSymbol = wellKnownSymbol$j;
  var MATCH = wellKnownSymbol('match');
  var correctIsRegexpLogic = function (METHOD_NAME) {
    var regexp = /./;
    try {
      '/./'[METHOD_NAME](regexp);
    } catch (error1) {
      try {
        regexp[MATCH] = false;
        return '/./'[METHOD_NAME](regexp);
      } catch (error2) {/* empty */}
    }
    return false;
  };

  var $$6 = _export;
  var uncurryThis$5 = functionUncurryThis;
  var notARegExp = notARegexp;
  var requireObjectCoercible = requireObjectCoercible$5;
  var toString = toString$5;
  var correctIsRegExpLogic = correctIsRegexpLogic;
  var stringIndexOf = uncurryThis$5(''.indexOf);

  // `String.prototype.includes` method
  // https://tc39.es/ecma262/#sec-string.prototype.includes
  $$6({
    target: 'String',
    proto: true,
    forced: !correctIsRegExpLogic('includes')
  }, {
    includes: function includes(searchString /* , position = 0 */) {
      return !!~stringIndexOf(toString(requireObjectCoercible(this)), toString(notARegExp(searchString)), arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var internalMetadata = {exports: {}};

  var objectGetOwnPropertyNamesExternal = {};

  var toAbsoluteIndex = toAbsoluteIndex$2;
  var lengthOfArrayLike = lengthOfArrayLike$5;
  var createProperty = createProperty$2;
  var $Array = Array;
  var max = Math.max;
  var arraySliceSimple = function (O, start, end) {
    var length = lengthOfArrayLike(O);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    var result = $Array(max(fin - k, 0));
    for (var n = 0; k < fin; k++, n++) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  };

  /* eslint-disable es/no-object-getownpropertynames -- safe */
  var classof$1 = classofRaw$2;
  var toIndexedObject$1 = toIndexedObject$7;
  var $getOwnPropertyNames = objectGetOwnPropertyNames.f;
  var arraySlice = arraySliceSimple;
  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
  var getWindowNames = function (it) {
    try {
      return $getOwnPropertyNames(it);
    } catch (error) {
      return arraySlice(windowNames);
    }
  };

  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
  objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
    return windowNames && classof$1(it) == 'Window' ? getWindowNames(it) : $getOwnPropertyNames(toIndexedObject$1(it));
  };

  // FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
  var fails$5 = fails$s;
  var arrayBufferNonExtensible = fails$5(function () {
    if (typeof ArrayBuffer == 'function') {
      var buffer = new ArrayBuffer(8);
      // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
      if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', {
        value: 8
      });
    }
  });

  var fails$4 = fails$s;
  var isObject$3 = isObject$f;
  var classof = classofRaw$2;
  var ARRAY_BUFFER_NON_EXTENSIBLE = arrayBufferNonExtensible;

  // eslint-disable-next-line es/no-object-isextensible -- safe
  var $isExtensible = Object.isExtensible;
  var FAILS_ON_PRIMITIVES$1 = fails$4(function () {
    $isExtensible(1);
  });

  // `Object.isExtensible` method
  // https://tc39.es/ecma262/#sec-object.isextensible
  var objectIsExtensible = FAILS_ON_PRIMITIVES$1 || ARRAY_BUFFER_NON_EXTENSIBLE ? function isExtensible(it) {
    if (!isObject$3(it)) return false;
    if (ARRAY_BUFFER_NON_EXTENSIBLE && classof(it) == 'ArrayBuffer') return false;
    return $isExtensible ? $isExtensible(it) : true;
  } : $isExtensible;

  var fails$3 = fails$s;
  var freezing = !fails$3(function () {
    // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
    return Object.isExtensible(Object.preventExtensions({}));
  });

  var $$5 = _export;
  var uncurryThis$4 = functionUncurryThis;
  var hiddenKeys = hiddenKeys$5;
  var isObject$2 = isObject$f;
  var hasOwn$1 = hasOwnProperty_1;
  var defineProperty$1 = objectDefineProperty.f;
  var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
  var getOwnPropertyNamesExternalModule = objectGetOwnPropertyNamesExternal;
  var isExtensible = objectIsExtensible;
  var uid = uid$3;
  var FREEZING = freezing;
  var REQUIRED = false;
  var METADATA = uid('meta');
  var id = 0;
  var setMetadata = function (it) {
    defineProperty$1(it, METADATA, {
      value: {
        objectID: 'O' + id++,
        // object ID
        weakData: {} // weak collections IDs
      }
    });
  };

  var fastKey$1 = function (it, create) {
    // return a primitive with prefix
    if (!isObject$2(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
    if (!hasOwn$1(it, METADATA)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F';
      // not necessary to add metadata
      if (!create) return 'E';
      // add missing metadata
      setMetadata(it);
      // return object ID
    }
    return it[METADATA].objectID;
  };
  var getWeakData = function (it, create) {
    if (!hasOwn$1(it, METADATA)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true;
      // not necessary to add metadata
      if (!create) return false;
      // add missing metadata
      setMetadata(it);
      // return the store of weak collections IDs
    }
    return it[METADATA].weakData;
  };

  // add metadata on freeze-family methods calling
  var onFreeze = function (it) {
    if (FREEZING && REQUIRED && isExtensible(it) && !hasOwn$1(it, METADATA)) setMetadata(it);
    return it;
  };
  var enable = function () {
    meta.enable = function () {/* empty */};
    REQUIRED = true;
    var getOwnPropertyNames = getOwnPropertyNamesModule.f;
    var splice = uncurryThis$4([].splice);
    var test = {};
    test[METADATA] = 1;

    // prevent exposing of metadata key
    if (getOwnPropertyNames(test).length) {
      getOwnPropertyNamesModule.f = function (it) {
        var result = getOwnPropertyNames(it);
        for (var i = 0, length = result.length; i < length; i++) {
          if (result[i] === METADATA) {
            splice(result, i, 1);
            break;
          }
        }
        return result;
      };
      $$5({
        target: 'Object',
        stat: true,
        forced: true
      }, {
        getOwnPropertyNames: getOwnPropertyNamesExternalModule.f
      });
    }
  };
  var meta = internalMetadata.exports = {
    enable: enable,
    fastKey: fastKey$1,
    getWeakData: getWeakData,
    onFreeze: onFreeze
  };
  hiddenKeys[METADATA] = true;
  var internalMetadataExports = internalMetadata.exports;

  var isCallable$1 = isCallable$m;
  var isObject$1 = isObject$f;
  var setPrototypeOf = objectSetPrototypeOf;

  // makes subclassing work correct for wrapped built-ins
  var inheritIfRequired$2 = function ($this, dummy, Wrapper) {
    var NewTarget, NewTargetPrototype;
    if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable$1(NewTarget = dummy.constructor) && NewTarget !== Wrapper && isObject$1(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) setPrototypeOf($this, NewTargetPrototype);
    return $this;
  };

  var $$4 = _export;
  var global$2 = global$n;
  var uncurryThis$3 = functionUncurryThis;
  var isForced$1 = isForced_1;
  var defineBuiltIn$1 = defineBuiltIn$9;
  var InternalMetadataModule = internalMetadataExports;
  var iterate$1 = iterate$4;
  var anInstance$1 = anInstance$3;
  var isCallable = isCallable$m;
  var isNullOrUndefined$1 = isNullOrUndefined$6;
  var isObject = isObject$f;
  var fails$2 = fails$s;
  var checkCorrectnessOfIteration = checkCorrectnessOfIteration$2;
  var setToStringTag = setToStringTag$4;
  var inheritIfRequired$1 = inheritIfRequired$2;
  var collection$1 = function (CONSTRUCTOR_NAME, wrapper, common) {
    var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
    var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
    var ADDER = IS_MAP ? 'set' : 'add';
    var NativeConstructor = global$2[CONSTRUCTOR_NAME];
    var NativePrototype = NativeConstructor && NativeConstructor.prototype;
    var Constructor = NativeConstructor;
    var exported = {};
    var fixMethod = function (KEY) {
      var uncurriedNativeMethod = uncurryThis$3(NativePrototype[KEY]);
      defineBuiltIn$1(NativePrototype, KEY, KEY == 'add' ? function add(value) {
        uncurriedNativeMethod(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
        return this;
      });
    };
    var REPLACE = isForced$1(CONSTRUCTOR_NAME, !isCallable(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails$2(function () {
      new NativeConstructor().entries().next();
    })));
    if (REPLACE) {
      // create collection constructor
      Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
      InternalMetadataModule.enable();
    } else if (isForced$1(CONSTRUCTOR_NAME, true)) {
      var instance = new Constructor();
      // early implementations not supports chaining
      var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
      // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
      var THROWS_ON_PRIMITIVES = fails$2(function () {
        instance.has(1);
      });
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      // eslint-disable-next-line no-new -- required for testing
      var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) {
        new NativeConstructor(iterable);
      });
      // for early implementations -0 and +0 not the same
      var BUGGY_ZERO = !IS_WEAK && fails$2(function () {
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new NativeConstructor();
        var index = 5;
        while (index--) $instance[ADDER](index, index);
        return !$instance.has(-0);
      });
      if (!ACCEPT_ITERABLES) {
        Constructor = wrapper(function (dummy, iterable) {
          anInstance$1(dummy, NativePrototype);
          var that = inheritIfRequired$1(new NativeConstructor(), dummy, Constructor);
          if (!isNullOrUndefined$1(iterable)) iterate$1(iterable, that[ADDER], {
            that: that,
            AS_ENTRIES: IS_MAP
          });
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
      if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

      // weak collections should not contains .clear method
      if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
    }
    exported[CONSTRUCTOR_NAME] = Constructor;
    $$4({
      global: true,
      constructor: true,
      forced: Constructor != NativeConstructor
    }, exported);
    setToStringTag(Constructor, CONSTRUCTOR_NAME);
    if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);
    return Constructor;
  };

  var defineBuiltIn = defineBuiltIn$9;
  var defineBuiltIns$1 = function (target, src, options) {
    for (var key in src) defineBuiltIn(target, key, src[key], options);
    return target;
  };

  var create = objectCreate;
  var defineBuiltInAccessor = defineBuiltInAccessor$2;
  var defineBuiltIns = defineBuiltIns$1;
  var bind = functionBindContext;
  var anInstance = anInstance$3;
  var isNullOrUndefined = isNullOrUndefined$6;
  var iterate = iterate$4;
  var defineIterator = iteratorDefine;
  var createIterResultObject = createIterResultObject$3;
  var setSpecies = setSpecies$2;
  var DESCRIPTORS$2 = descriptors;
  var fastKey = internalMetadataExports.fastKey;
  var InternalStateModule = internalState;
  var setInternalState = InternalStateModule.set;
  var internalStateGetterFor = InternalStateModule.getterFor;
  var collectionStrong$1 = {
    getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
      var Constructor = wrapper(function (that, iterable) {
        anInstance(that, Prototype);
        setInternalState(that, {
          type: CONSTRUCTOR_NAME,
          index: create(null),
          first: undefined,
          last: undefined,
          size: 0
        });
        if (!DESCRIPTORS$2) that.size = 0;
        if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], {
          that: that,
          AS_ENTRIES: IS_MAP
        });
      });
      var Prototype = Constructor.prototype;
      var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);
      var define = function (that, key, value) {
        var state = getInternalState(that);
        var entry = getEntry(that, key);
        var previous, index;
        // change existing entry
        if (entry) {
          entry.value = value;
          // create new entry
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
          if (DESCRIPTORS$2) state.size++;else that.size++;
          // add to index
          if (index !== 'F') state.index[index] = entry;
        }
        return that;
      };
      var getEntry = function (that, key) {
        var state = getInternalState(that);
        // fast case
        var index = fastKey(key);
        var entry;
        if (index !== 'F') return state.index[index];
        // frozen object case
        for (entry = state.first; entry; entry = entry.next) {
          if (entry.key == key) return entry;
        }
      };
      defineBuiltIns(Prototype, {
        // `{ Map, Set }.prototype.clear()` methods
        // https://tc39.es/ecma262/#sec-map.prototype.clear
        // https://tc39.es/ecma262/#sec-set.prototype.clear
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
          if (DESCRIPTORS$2) state.size = 0;else that.size = 0;
        },
        // `{ Map, Set }.prototype.delete(key)` methods
        // https://tc39.es/ecma262/#sec-map.prototype.delete
        // https://tc39.es/ecma262/#sec-set.prototype.delete
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
            if (DESCRIPTORS$2) state.size--;else that.size--;
          }
          return !!entry;
        },
        // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
        // https://tc39.es/ecma262/#sec-map.prototype.foreach
        // https://tc39.es/ecma262/#sec-set.prototype.foreach
        forEach: function forEach(callbackfn /* , that = undefined */) {
          var state = getInternalState(this);
          var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
          var entry;
          while (entry = entry ? entry.next : state.first) {
            boundFunction(entry.value, entry.key, this);
            // revert to the last existing entry
            while (entry && entry.removed) entry = entry.previous;
          }
        },
        // `{ Map, Set}.prototype.has(key)` methods
        // https://tc39.es/ecma262/#sec-map.prototype.has
        // https://tc39.es/ecma262/#sec-set.prototype.has
        has: function has(key) {
          return !!getEntry(this, key);
        }
      });
      defineBuiltIns(Prototype, IS_MAP ? {
        // `Map.prototype.get(key)` method
        // https://tc39.es/ecma262/#sec-map.prototype.get
        get: function get(key) {
          var entry = getEntry(this, key);
          return entry && entry.value;
        },
        // `Map.prototype.set(key, value)` method
        // https://tc39.es/ecma262/#sec-map.prototype.set
        set: function set(key, value) {
          return define(this, key === 0 ? 0 : key, value);
        }
      } : {
        // `Set.prototype.add(value)` method
        // https://tc39.es/ecma262/#sec-set.prototype.add
        add: function add(value) {
          return define(this, value = value === 0 ? 0 : value, value);
        }
      });
      if (DESCRIPTORS$2) defineBuiltInAccessor(Prototype, 'size', {
        configurable: true,
        get: function () {
          return getInternalState(this).size;
        }
      });
      return Constructor;
    },
    setStrong: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
      var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
      var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
      var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
      // `{ Map, Set }.prototype.{ keys, values, entries, @@iterator }()` methods
      // https://tc39.es/ecma262/#sec-map.prototype.entries
      // https://tc39.es/ecma262/#sec-map.prototype.keys
      // https://tc39.es/ecma262/#sec-map.prototype.values
      // https://tc39.es/ecma262/#sec-map.prototype-@@iterator
      // https://tc39.es/ecma262/#sec-set.prototype.entries
      // https://tc39.es/ecma262/#sec-set.prototype.keys
      // https://tc39.es/ecma262/#sec-set.prototype.values
      // https://tc39.es/ecma262/#sec-set.prototype-@@iterator
      defineIterator(Constructor, CONSTRUCTOR_NAME, function (iterated, kind) {
        setInternalState(this, {
          type: ITERATOR_NAME,
          target: iterated,
          state: getInternalCollectionState(iterated),
          kind: kind,
          last: undefined
        });
      }, function () {
        var state = getInternalIteratorState(this);
        var kind = state.kind;
        var entry = state.last;
        // revert to the last existing entry
        while (entry && entry.removed) entry = entry.previous;
        // get next entry
        if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
          // or finish the iteration
          state.target = undefined;
          return createIterResultObject(undefined, true);
        }
        // return step by kind
        if (kind == 'keys') return createIterResultObject(entry.key, false);
        if (kind == 'values') return createIterResultObject(entry.value, false);
        return createIterResultObject([entry.key, entry.value], false);
      }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

      // `{ Map, Set }.prototype[@@species]` accessors
      // https://tc39.es/ecma262/#sec-get-map-@@species
      // https://tc39.es/ecma262/#sec-get-set-@@species
      setSpecies(CONSTRUCTOR_NAME);
    }
  };

  var collection = collection$1;
  var collectionStrong = collectionStrong$1;

  // `Set` constructor
  // https://tc39.es/ecma262/#sec-set-objects
  collection('Set', function (init) {
    return function Set() {
      return init(this, arguments.length ? arguments[0] : undefined);
    };
  }, collectionStrong);

  var $$3 = _export;
  var toObject = toObject$6;
  var nativeKeys = objectKeys$3;
  var fails$1 = fails$s;
  var FAILS_ON_PRIMITIVES = fails$1(function () {
    nativeKeys(1);
  });

  // `Object.keys` method
  // https://tc39.es/ecma262/#sec-object.keys
  $$3({
    target: 'Object',
    stat: true,
    forced: FAILS_ON_PRIMITIVES
  }, {
    keys: function keys(it) {
      return nativeKeys(toObject(it));
    }
  });

  var $$2 = _export;
  var $map = arrayIteration.map;
  var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$3;
  var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  // with adding support of @@species
  $$2({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT
  }, {
    map: function map(callbackfn /* , thisArg */) {
      return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var DESCRIPTORS$1 = descriptors;
  var uncurryThis$2 = functionUncurryThis;
  var objectKeys = objectKeys$3;
  var toIndexedObject = toIndexedObject$7;
  var $propertyIsEnumerable = objectPropertyIsEnumerable.f;
  var propertyIsEnumerable = uncurryThis$2($propertyIsEnumerable);
  var push = uncurryThis$2([].push);

  // `Object.{ entries, values }` methods implementation
  var createMethod = function (TO_ENTRIES) {
    return function (it) {
      var O = toIndexedObject(it);
      var keys = objectKeys(O);
      var length = keys.length;
      var i = 0;
      var result = [];
      var key;
      while (length > i) {
        key = keys[i++];
        if (!DESCRIPTORS$1 || propertyIsEnumerable(O, key)) {
          push(result, TO_ENTRIES ? [key, O[key]] : O[key]);
        }
      }
      return result;
    };
  };
  var objectToArray = {
    // `Object.entries` method
    // https://tc39.es/ecma262/#sec-object.entries
    entries: createMethod(true),
    // `Object.values` method
    // https://tc39.es/ecma262/#sec-object.values
    values: createMethod(false)
  };

  var $$1 = _export;
  var $values = objectToArray.values;

  // `Object.values` method
  // https://tc39.es/ecma262/#sec-object.values
  $$1({
    target: 'Object',
    stat: true
  }, {
    values: function values(O) {
      return $values(O);
    }
  });

  /**
   * @export
   * @class RadioGroup
   * @property {string} controlName
   * @property {string} featureName
   * @property {string} radioElements
   * @property {string} defaultValue
   */
  var RadioGroup = /*#__PURE__*/function (_BasePlugin) {
    _inherits(RadioGroup, _BasePlugin);
    var _super = _createSuper(RadioGroup);
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
      _this = _super.call(this, pluginName);
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
  var RadioGroupPlugin = /*#__PURE__*/function (_BasePlugin) {
    _inherits(RadioGroupPlugin, _BasePlugin);
    var _super = _createSuper(RadioGroupPlugin);
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
      _this = _super.call(this, name);
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
      get:
      /**
       * @memberof RadioGroupPlugin
       * @return {string}
       */
      function get() {
        return this._currentValue;
      },
      set: function set(newValue) {
        if (!this.supportedValues.includes(newValue)) {
          return;
        }
        this._currentValue = newValue;
        for (var i = 0, l = this.radioGroups.length; i < l; i++) {
          this.radioGroups[i].radioGroup[newValue].checked = true;
        }
      }
    }]);
    return RadioGroupPlugin;
  }(BasePlugin);

  var uncurryThis$1 = functionUncurryThis;

  // `thisNumberValue` abstract operation
  // https://tc39.es/ecma262/#sec-thisnumbervalue
  var thisNumberValue$1 = uncurryThis$1(1.0.valueOf);

  var $ = _export;
  var IS_PURE = isPure;
  var DESCRIPTORS = descriptors;
  var global$1 = global$n;
  var path = path$1;
  var uncurryThis = functionUncurryThis;
  var isForced = isForced_1;
  var hasOwn = hasOwnProperty_1;
  var inheritIfRequired = inheritIfRequired$2;
  var isPrototypeOf = objectIsPrototypeOf;
  var isSymbol = isSymbol$3;
  var toPrimitive = toPrimitive$2;
  var fails = fails$s;
  var getOwnPropertyNames = objectGetOwnPropertyNames.f;
  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
  var defineProperty = objectDefineProperty.f;
  var thisNumberValue = thisNumberValue$1;
  var trim = stringTrim.trim;
  var NUMBER = 'Number';
  var NativeNumber = global$1[NUMBER];
  path[NUMBER];
  var NumberPrototype = NativeNumber.prototype;
  var TypeError$1 = global$1.TypeError;
  var stringSlice = uncurryThis(''.slice);
  var charCodeAt = uncurryThis(''.charCodeAt);

  // `ToNumeric` abstract operation
  // https://tc39.es/ecma262/#sec-tonumeric
  var toNumeric = function (value) {
    var primValue = toPrimitive(value, 'number');
    return typeof primValue == 'bigint' ? primValue : toNumber(primValue);
  };

  // `ToNumber` abstract operation
  // https://tc39.es/ecma262/#sec-tonumber
  var toNumber = function (argument) {
    var it = toPrimitive(argument, 'number');
    var first, third, radix, maxCode, digits, length, index, code;
    if (isSymbol(it)) throw TypeError$1('Cannot convert a Symbol value to a number');
    if (typeof it == 'string' && it.length > 2) {
      it = trim(it);
      first = charCodeAt(it, 0);
      if (first === 43 || first === 45) {
        third = charCodeAt(it, 2);
        if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
      } else if (first === 48) {
        switch (charCodeAt(it, 1)) {
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
        digits = stringSlice(it, 2);
        length = digits.length;
        for (index = 0; index < length; index++) {
          code = charCodeAt(digits, index);
          // parseInt parses a string to a first unavailable symbol
          // but ToNumber should return NaN if a string contains unavailable symbols
          if (code < 48 || code > maxCode) return NaN;
        }
        return parseInt(digits, radix);
      }
    }
    return +it;
  };
  var FORCED = isForced(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'));
  var calledWithNew = function (dummy) {
    // includes check on 1..constructor(foo) case
    return isPrototypeOf(NumberPrototype, dummy) && fails(function () {
      thisNumberValue(dummy);
    });
  };

  // `Number` constructor
  // https://tc39.es/ecma262/#sec-number-constructor
  var NumberWrapper = function Number(value) {
    var n = arguments.length < 1 ? 0 : NativeNumber(toNumeric(value));
    return calledWithNew(this) ? inheritIfRequired(Object(n), this, NumberWrapper) : n;
  };
  NumberWrapper.prototype = NumberPrototype;
  if (FORCED && !IS_PURE) NumberPrototype.constructor = NumberWrapper;
  $({
    global: true,
    constructor: true,
    wrap: true,
    forced: FORCED
  }, {
    Number: NumberWrapper
  });

  // Use `internal/copy-constructor-properties` helper in `core-js@4`
  var copyConstructorProperties = function (target, source) {
    for (var keys = DESCRIPTORS ? getOwnPropertyNames(source) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES2015 (in case, if modules with ES2015 Number statics required before):
      'EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,' +
      // ESNext
      'fromString,range').split(','), j = 0, key; keys.length > j; j++) {
      if (hasOwn(source, key = keys[j]) && !hasOwn(target, key)) {
        defineProperty(target, key, getOwnPropertyDescriptor(source, key));
      }
    }
  };
  if (FORCED || IS_PURE) copyConstructorProperties(path[NUMBER], NativeNumber);

  /**
   * @export
   * @class Slider
   */
  var Slider = /*#__PURE__*/function () {
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
       */,
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
  var Button = /*#__PURE__*/function () {
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
  var SliderPlugin = /*#__PURE__*/function (_BasePlugin) {
    _inherits(SliderPlugin, _BasePlugin);
    var _super = _createSuper(SliderPlugin);
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
      _this = _super.call(this, name);
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
      get:
      /**
       * @memberof SliderPlugin
       * @return {string}
       */
      function get() {
        return this._currentValue;
      },
      set: function set(newValue) {
        //just use first slider to ensure the number is valid.
        this._currentValue = this.sliders[0].sliderRange(Number(newValue));
        for (var i = 0; i < this.slidersLength; i++) {
          this.sliders[i].value = newValue;
        }
      }
    }]);
    return SliderPlugin;
  }(BasePlugin);

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
   * @property {number} fontSizeRadiosLength Length of the fontSizeRadios array
   * @property {number} colorRadiosLength Length of the colorRadios array
   * @property {number} alignmentRadiosLength Length of the alignmentRadios array
   * @extends {ButtonPlugin}
   */
  var CaptionsStylePlugin = /*#__PURE__*/function (_ButtonPlugin) {
    _inherits(CaptionsStylePlugin, _ButtonPlugin);
    var _super = _createSuper(CaptionsStylePlugin);
    /**
     * Creates an instance of CaptionsStylePlugin.
     * @param {string} fontSizeRadios selector string for one or more radio groups for caption font size
     * @param {string} colorRadios selector string for one or more radio groups for caption font/background colors
     * @param {string} alignmentRadios selector string for one or more radio groups for caption position
     * @param {string} [defaultFontSize='medium'] Default selected font size
     * @param {string} [defaultColor='default'] Default selected color
     * @param {string} [defaultAlignment='top'] Default selected alignment
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
      _this = _super.call(this, 'Caption-Style-Plugin');
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      _this.captionsStyles = Object.assign({}, DEFAULT_CAPTIONS_STYLES, SavedData.read(CaptionsStylePlugin.captionStyleKey) || {});

      //split the selector strings into individual selectors.
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
      }

      //set up change events
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
          var _iterator = _createForOfIteratorHelper(this.radios),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var radio = _step.value;
              radio.displayRadios($event.data);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
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
        this.setCaptionsStyles(SavedData.read(CaptionsStylePlugin.captionStyleKey));
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
        this.sendProperty(CaptionsStylePlugin.captionStyleKey, this.captionsStyles);
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
        var _iterator2 = _createForOfIteratorHelper(this.radios),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var radio = _step2.value;
            radio.resetState();
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
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
        var _this5 = this;
        var styles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_CAPTIONS_STYLES;
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        if (_typeof(styles) === 'object') {
          Object.assign(this.captionsStyles, styles);
        } else if (typeof styles === 'string') {
          this.captionsStyles[styles] = value;
        }

        // update radios to match
        this.colorRadios.forEach(function (group) {
          var style = _this5.captionsStyles.color === 'white' ? 'default' : 'inverted';
          group.radioGroup[style].checked = true;
        });
        this.alignmentRadios.forEach(function (group) {
          group.radioGroup[_this5.captionsStyles.align].checked = true;
        });
        this.fontSizeRadios.forEach(function (group) {
          group.radioGroup[_this5.captionsStyles.size].checked = true;
        });
        SavedData.write(CaptionsStylePlugin.captionStyleKey, this.captionsStyles);
        if (this.client) {
          this.client.send(CaptionsStylePlugin.captionStyleKey, this.captionsStyles);
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
      /**
       * Get captionStyle Key
       * @readonly
       * @static
       * @memberof CaptionStyleKey
       * @returns {string}
       */
    }], [{
      key: "captionStyleKey",
      get: function get() {
        return 'captionsStyles';
      }
    }]);
    return CaptionsStylePlugin;
  }(ButtonPlugin);

  /**
   * @export
   * @class CaptionsTogglePlugin
   * @property {Button[]} _captionsButtons An array of caption mute buttons
   * @property {boolean} _captionsMuted True if captions are muted
   * @property {number} captionsButtonLength The length of the captionsButtons array
   * @extends {ButtonPlugin}
   */
  var CaptionsTogglePlugin = /*#__PURE__*/function (_ButtonPlugin) {
    _inherits(CaptionsTogglePlugin, _ButtonPlugin);
    var _super = _createSuper(CaptionsTogglePlugin);
    /**
     *Creates an instance of CaptionsTogglePlugin.
     * @param {string | HTMLElement} captionsButtons selector string for one or more captions mute buttons
     * @memberof CaptionsTogglePlugin
     */
    function CaptionsTogglePlugin(captionsButtons) {
      var _this;
      _classCallCheck(this, CaptionsTogglePlugin);
      _this = _super.call(this, 'Caption-Button-Plugin');
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
          if (null === SavedData.read(CaptionsTogglePlugin.captionsToggleKey)) {
            return;
          }
          this.captionsMuted = !!SavedData.read(CaptionsTogglePlugin.captionsToggleKey);
        }.bind(this));
      }
      /**
      * @memberof CaptionsTogglePlugin
      */
    }, {
      key: "start",
      value: function start() {
        this.captionsMuted = !!SavedData.read(CaptionsTogglePlugin.captionsToggleKey);
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
        this.sendProperty(CaptionsTogglePlugin.captionsToggleKey, this.captionsMuted);
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
       */,
      set: function set(muted) {
        this._captionsMuted = muted;
        this._setMuteProp('captionsMuted', this._captionsButtons, this._captionsMuted);
      }

      /**
       * Get CaptionToggle Key
       * @readonly
       * @static
       * @memberof captionsToggleKey
       * @returns {string}
       */
    }], [{
      key: "captionsToggleKey",
      get: function get() {
        return 'captionsMuted';
      }
    }]);
    return CaptionsTogglePlugin;
  }(ButtonPlugin);

  /**
   * Requests a hint or help from the game
   * @class HelpPlugin
   * @property {boolean} paused
   * @property {boolean} _helpEnabled
   * @property {boolean} onPause
   * @property {number} helpButtonsLength
   * @extends {ButtonPlugin}
   * @export
   */
  var HelpPlugin = /*#__PURE__*/function (_ButtonPlugin) {
    _inherits(HelpPlugin, _ButtonPlugin);
    var _super = _createSuper(HelpPlugin);
    /**
     * Creates an instance of HelpPlugin.
     * @param {string | HTMLElement} helpButtons The selector or HTMLElement for the button
     * @memberof HelpPlugin
     */
    function HelpPlugin(helpButtons) {
      var _this;
      _classCallCheck(this, HelpPlugin);
      _this = _super.call(this, 'Help-Button-Plugin');
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
        this.paused = $event.data.paused;
        // Disable the help button when paused if it's active
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
        this.client.on('paused', this.onPause);

        // Handle features changed
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
       */,
      set: function set(enabled) {
        this._helpEnabled = enabled;
        for (var i = 0; i < this.helpButtonsLength; i++) {
          this._helpButtons[i].button.classList.remove('disabled');
          this._helpButtons[i].button.classList.remove('enabled');
          this._helpButtons[i].button.classList.add(enabled ? 'enabled' : 'disabled');
        }
        this.client.trigger('helpEnabled');
      }

      /**
       * @readonly
       * @static
       * @memberof HelpPlugin
       * @returns {string}
       */
    }], [{
      key: "helpKey",
      get: function get() {
        return 'help';
      }
    }]);
    return HelpPlugin;
  }(ButtonPlugin);

  /**
   * @class Container
   * @property {object[]} sliders an array of all slider objects attached to PausePlugin
   * @extends ButtonPlugin
   */
  var PausePlugin = /*#__PURE__*/function (_ButtonPlugin) {
    _inherits(PausePlugin, _ButtonPlugin);
    var _super = _createSuper(PausePlugin);
    /**
     * Creates an instance of PausePlugin.
     * @param {string | HTMLElement} pauseButton selector string or HTML Element for the input(s)
     * @param {boolean} manageOwnVisibility whether the plugin should manage container's visibility or some other source will handle it
     * @memberof PausePlugin
     */
    function PausePlugin(pauseButton) {
      var _this;
      var manageOwnVisibility = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      _classCallCheck(this, PausePlugin);
      _this = _super.call(this, 'Pause-Button-plugin');
      _this._manageOwnVisibility = manageOwnVisibility;
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
      _this.pageVisibility = new PageVisibility(_this.onContainerFocus.bind(_assertThisInitialized(_this)), _this.onContainerBlur.bind(_assertThisInitialized(_this)));
      _this.pageVisibility.enabled = _this.manageOwnVisibility;
      if (pauseButton instanceof HTMLElement) {
        _this._pauseButton[0] = new Button({
          button: pauseButton,
          onClick: onPauseToggle,
          channel: PausePlugin.pauseKey
        });
      } else {
        document.querySelectorAll(pauseButton).forEach(function (button) {
          _this._pauseButton.push(new Button({
            button: button,
            onClick: onPauseToggle,
            channel: PausePlugin.pauseKey
          }));
        });
      }
      return _this;
    }

    /**
     * updates _paused and also sends the pause event to the application
     * @memberof PausePlugin
     * @param {Boolean} paused
     */
    _createClass(PausePlugin, [{
      key: "pause",
      get:
      /**
       * @memberof PausePlugin
       * @returns {Boolean}
       */
      function get() {
        return this._paused;
      }

      /**
       * updates _manageOwnVisibility and also re-enables pageVisibility
       * @memberof PausePlugin
       * @param {Boolean} manageOwnVisibility
       */,
      set: function set(paused) {
        paused = !!paused;
        if (this.pauseDisabled) {
          return;
        }
        this._paused = paused;
        this.client.send(PausePlugin.pauseKey, paused);
        this.client.trigger(paused ? 'paused' : 'resumed', {
          paused: paused
        });
        for (var i = 0, l = this._pauseButton.length; i < l; i++) {
          this._pauseButton[i].button.classList.remove('unpaused');
          this._pauseButton[i].button.classList.remove('paused');
          this._pauseButton[i].button.classList.add(paused ? 'paused' : 'unpaused');
        }
      }
    }, {
      key: "manageOwnVisibility",
      get:
      /**
      * @memberof PausePlugin
      * @returns {Boolean}
      */
      function get() {
        return this._manageOwnVisibility;
      }

      /**
       * forces focus onto the iframe application window
       * @memberof PausePlugin
       */,
      set: function set(manageOwnVisibility) {
        this._manageOwnVisibility = manageOwnVisibility;
        this.pageVisibility.enabled = this._manageOwnVisibility;
      }
    }, {
      key: "focusApp",
      value: function focusApp() {
        if (!this.hasDom) {
          // We don't have a dom with a content window, fail quietly
          return;
        }
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
        if (!this.manageOwnVisibility) {
          return;
        }
        // Unfocus on the iframe
        if (this._keepFocus) {
          this.blurApp();
        }

        // we only need one delayed call, at the end of any
        // sequence of rapidly-fired blur/focus events
        if (this._focusTimer) {
          clearTimeout(this._focusTimer);
        }

        // Delay setting of 'paused' in case we get another focus event soon.
        // Focus events are sent to the container asynchronously, and this was
        // causing rapid toggling of the pause state and related issues,
        // especially in Internet Explorer
        this._focusTimer = setTimeout(function () {
          this._focusTimer = null;
          // A manual pause cannot be overriden by focus events.
          // User must click the resume button.
          if (this._isManualPause) {
            return;
          }
          this.pause = Boolean(this._containerBlurred && this._appBlurred);

          // Focus on the content window when blurring the app
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
        this.pause = this._paused;
      }

      /**
       * Function to check if we have a dom with a contentWindow
       * @readonly
       * @returns {boolean}
       * @memberof PausePlugin
       */
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

      /**
       * @readonly
       * @static
       * @memberof PausePlugin
       * @returns {string}
       */
    }], [{
      key: "pauseKey",
      get: function get() {
        return 'pause';
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
  var SoundPlugin = /*#__PURE__*/function (_ButtonPlugin) {
    _inherits(SoundPlugin, _ButtonPlugin);
    var _super = _createSuper(SoundPlugin);
    /**
     * Creates an instance of SoundPlugin.
     * @param {string | HTMLElement} [soundButtons] selector string or HTML Element for the input(s)
     * @param {string | HTMLElement} [musicButtons] selector string or HTML Element for the input(s)
     * @param {string | HTMLElement} [voButtons] selector string or HTML Element for the input(s)
     * @param {string | HTMLElement} [sfxButtons] selector string or HTML Element for the input(s)
     * @param {string | HTMLElement} [soundSliders] selector string or HTML Element for the input(s)
     * @param {string | HTMLElement} [musicSliders] selector string or HTML Element for the input(s)
     * @param {string | HTMLElement} [sfxSliders] selector string or HTML Element for the input(s)
     * @param {string | HTMLElement} [voSliders] selector string or HTML Element for the input(s)
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
      _this = _super.call(this, 'Sound-Button-Plugin');
      var saved = SavedData.read(SoundPlugin.soundMutedKey);
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      _this._soundMuted = saved ? saved : false;
      _this._musicMuted = false;
      _this._voMuted = false;
      _this._sfxMuted = false;
      _this.soundMuteEnabled = false;
      _this.musicMuteEnabled = false;
      _this.sfxMuteEnabled = false;
      _this.voMuteEnabled = false;
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
          channel: SoundPlugin.soundKey
        });
      } else {
        document.querySelectorAll(soundButtons).forEach(function (button) {
          _this.soundButtons.push(new Button({
            button: button,
            onClick: _this.onSoundToggle.bind(_assertThisInitialized(_this)),
            channel: SoundPlugin.soundKey
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
        if (this.soundSlidersLength <= 0) {
          this.soundVolume = e.target.value;
          return;
        }
        this.soundVolume = this.soundSliders[0].sliderRange(Number(e.target.value));
        if (!this.soundVolume !== this.soundMuted) {
          this.soundMuted = !this.soundVolume;
          this._checkSoundMute();
        }
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
        if (this.musicSlidersLength <= 0) {
          this.musicVolume = e.target.value;
          return;
        }
        this.musicVolume = this.musicSliders[0].sliderRange(Number(e.target.value));
        if (!this.musicVolume !== this.musicMuted) {
          this.musicMuted = !this.musicVolume;
          this._checkSoundMute();
        }
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
        if (this.voSlidersLength <= 0) {
          this.voVolume = e.target.value;
          return;
        }
        this.voVolume = this.voSliders[0].sliderRange(Number(e.target.value));
        if (!this.voVolume !== this.voMuted) {
          this.voMuted = !this.voVolume;
          this._checkSoundMute();
        }
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
        if (this.sfxSlidersLength <= 0) {
          this.sfxVolume = e.target.value;
          return;
        }
        this.sfxVolume = this.sfxSliders[0].sliderRange(Number(e.target.value));
        if (!this.sfxVolume !== this.sfxMuted) {
          this.sfxMuted = !this.sfxVolume;
          this._checkSoundMute();
        }
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

          // Confirm that the mute features are supported
          this.soundMuteEnabled = !!features.data.sound;
          this.musicMuteEnabled = !!features.data.music;
          this.sfxMuteEnabled = !!features.data.sfx;
          this.voMuteEnabled = !!features.data.vo;
          this.soundVolumeEnabled = !!features.data.soundVolume;
          this.musicVolumeEnabled = !!features.data.musicVolume;
          this.sfxVolumeEnabled = !!features.data.sfxVolume;
          this.voVolumeEnabled = !!features.data.voVolume;

          // this.volumeEnabled = !!features.data.soundVolume 
          //                     || !!features.data.musicVolume 
          //                     || !!features.data.sfxVolume 
          //                     || !!features.data.voVolume;

          // this.muteEnabled = !!features.data.sound 
          //                     || !!features.data.musi
          //                     || !!features.data.sfx 
          //                     || !!features.data.vo;

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

        // to avoid the mute property overwriting the volum, mutes should only send if they're true
        // or the volume channel isn't enabled
        if (this.soundMuteEnabled && (this.soundMuted || !this.soundVolumeEnabled)) {
          this.sendProperty(SoundPlugin.soundMutedKey, this.soundMuted);
        }
        if (this.musicMuteEnabled && (this.musicMuted || !this.musicVolumeEnabled)) {
          this.sendProperty(SoundPlugin.musicMutedKey, this.musicMuted);
        }
        if (this.voMuteEnabled && (this.voMuted || !this.voVolumeEnabled)) {
          this.sendProperty(SoundPlugin.voMutedKey, this.voMuted);
        }
        if (this.sfxMuteEnabled && (this.sfxMuted || !this.sfxVolumeEnabled)) {
          this.sendProperty(SoundPlugin.sfxMutedKey, this.sfxMuted);
        }
      }

      /**
       * @memberof SoundPlugin
       * @param {boolean} muted
       */
    }, {
      key: "soundMuted",
      get:
      /**
       * @memberof SoundPlugin
       */
      function get() {
        return this._soundMuted;
      }

      /**
       * @memberof SoundPlugin
       * @param {boolean} muted
       */,
      set: function set(muted) {
        this.setMuteProp('soundMuted', muted, this.soundButtons);
      }
    }, {
      key: "voMuted",
      get:
      /**
       * @memberof SoundPlugin
       */
      function get() {
        return this._voMuted;
      }

      /**
       * @memberof SoundPlugin
       * @param {boolean} muted
       */,
      set: function set(muted) {
        this.setMuteProp('voMuted', muted, this.voButtons);
      }
    }, {
      key: "musicMuted",
      get:
      /**
       * @memberof SoundPlugin
       */
      function get() {
        return this._musicMuted;
      }

      /**
       * @memberof SoundPlugin
       * @param {boolean} muted
       */,
      set: function set(muted) {
        this.setMuteProp('musicMuted', muted, this.musicButtons);
      }
    }, {
      key: "sfxMuted",
      get:
      /**
       * @memberof SoundPlugin
       */
      function get() {
        return this._sfxMuted;
      }

      /**
       * @readonly
       * @static
       * @memberof SoundPlugin
       */,
      set: function set(muted) {
        this.setMuteProp('sfxMuted', muted, this.sfxButtons);
      }
    }, {
      key: "soundButton",
      get:
      /**
       * @readonly
       * @memberof SoundPlugin
       */
      function get() {
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

      /**
       * @readonly
       * @static
       * @memberof SpeedScalePlugin
       * @return {string}
       */
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
    }, {
      key: "soundKey",
      get: function get() {
        return 'sound';
      }
    }]);
    return SoundPlugin;
  }(ButtonPlugin);

  /**
   * Default user data handler for the {{#crossLink "springroll.Container"}}Container{{/crossLink}} to save data using
   * the {{#crossLink "springroll.SavedData"}}SavedData{{/crossLink}} class.
   * @class SavedDataHandler
   */
  var SavedDataHandler = /*#__PURE__*/function () {
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
      value:
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
      function IDBOpen(dbName) {
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
        var sd = new SavedData(dbName);
        sd.IDBGetVersion(dbName, callback);
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
      /**
       * Closes the connection to the database
       * @param {function} callback The method to call on success or failure. A single value will be passed in
       */
    }, {
      key: "IDBDeleteDB",
      value: function IDBDeleteDB(dbName, options, callback) {
        var sd = new SavedData(dbName);
        sd.IDBDeleteDB(dbName, options, callback);
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
   * @property {SavedDataHandler} SavedDataHandler The handler to work with the savedData class
   */
  var UserDataPlugin = /*#__PURE__*/function (_BasePlugin) {
    _inherits(UserDataPlugin, _BasePlugin);
    var _super = _createSuper(UserDataPlugin);
    /**
     * Creates an instance of UserDataPlugin.
     * @memberof UserDataPlugin
     */
    function UserDataPlugin() {
      var _this;
      _classCallCheck(this, UserDataPlugin);
      _this = _super.call(this, 'UserData-Plugin');
      _this.onUserDataRemove = _this.onUserDataRemove.bind(_assertThisInitialized(_this));
      _this.onUserDataRead = _this.onUserDataRead.bind(_assertThisInitialized(_this));
      _this.onUserDataWrite = _this.onUserDataWrite.bind(_assertThisInitialized(_this));
      _this.onIDBAdd = _this.onIDBAdd.bind(_assertThisInitialized(_this));
      _this.onIDBOpen = _this.onIDBOpen.bind(_assertThisInitialized(_this));
      _this.onIDBRead = _this.onIDBRead.bind(_assertThisInitialized(_this));
      _this.onIDBReadAll = _this.onIDBReadAll.bind(_assertThisInitialized(_this));
      _this.onIDBRemove = _this.onIDBRemove.bind(_assertThisInitialized(_this));
      _this.onIDBUpdate = _this.onIDBUpdate.bind(_assertThisInitialized(_this));
      _this.onIDBUpdate = _this.onIDBUpdate.bind(_assertThisInitialized(_this));
      _this.onIDBClose = _this.onIDBClose.bind(_assertThisInitialized(_this));
      _this.IDBReadAll = _this.onIDBReadAll.bind(_assertThisInitialized(_this));
      _this.onIDBGetVersion = _this.onIDBGetVersion.bind(_assertThisInitialized(_this));
      _this.onIDBDeleteDB = _this.onIDBDeleteDB.bind(_assertThisInitialized(_this));
      _this.savedDataHandler = null;
      return _this;
    }

    /**
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
        this.client.on('IDBReadAll', this.onIDBReadAll);
        this.client.on('IDBAdd', this.onIDBAdd);
        this.client.on('IDBRemove', this.onIDBRemove);
        this.client.on('IDBUpdate', this.onIDBUpdate);
        this.client.on('IDBClose', this.onIDBClose);
        this.client.on('IDBGetVersion', this.onIDBGetVersion);
        this.client.on('IDBDeleteDB', this.onIDBDeleteDB);
      }

      /**
       * Handler for the userDataRemove event
       * @method onUserDataRemove
       * @private
       * @param {string} data The name of the record to be removed
       * @param {string} type The type of listener for bellhop to send to
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
       * @param {string} data The name of the record to be removed
       * @param {string} type The type of listener for bellhop to send to
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
       * @param {string} type The type of listener for bellhop to send to
       * @param {string} data.name The name for the record. This is what is used to read or remove the record
       * @param {object | string} data.value The data object with the data and value for the record
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
      }

      // ----------------------------------------------------------------
      //                      IndexedDB Manipulation
      // ----------------------------------------------------------------

      /**
       * Open a connection with the IDB Database and optionally add or delete
       * Indexes and stores
       * @param {string} dbName The name of your IndexedDB database
       * @param {string} [dbVersion] The version number of the database
       * @param {JSON} [additions] Any additions to the structure of the database
       * @param {array} [additions.stores] Any stores to be added into the database syntax:
       * @param {string} [additions.stores.storeName] The name of the store
       * @param {object} [additions.stores.options] Optionally, the option parameter for the createStore method
       * @param {array} [additions.indexes] Any Indexes to be added to the database syntax:
       * @param {string} [additions.indexes.storeName] The name of the store
       * @param {object} [additions.indexes.options] Optionally, the option parameter for the createIndex method
       * @param {string} type The type of listener for bellhop to send to
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
       * @param {string} type The type of listener for bellhop to send to
       * @param {string} storeName The name of the store from which the record will be updated
       * @param {*} value The value for the record with the given key to be updated
       * @param {string} key the key of the record to be updated
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
       * @param {string} type The type of listener for bellhop to send to
       * @param {string} storeName The name of the store with the record to update
       * @param {string} key The key of the record to be updated
       * @param {*} value The record value
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
       * @param {string} type The type of listener for bellhop to send to
       * @param {string} storeName The name of the store from which the record will be removed
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
       * @param {string} storeName The name of the store to read from
       * @param {string} key The key for the record in the given store
       * @param {string} type The type of listener for bellhop to send to
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
       * @param {integer} count Optionally the number of records to return
       * @param {string} type The type of listener for bellhop to send to
       */
    }, {
      key: "onIDBReadAll",
      value: function onIDBReadAll(_ref9) {
        var _this10 = this;
        var type = _ref9.type,
          _ref9$data = _ref9.data,
          storeName = _ref9$data.storeName,
          count = _ref9$data.count;
        this.savedDataHandler.IDBReadAll(storeName, count, function (value) {
          return _this10.client.send(type, value);
        });
      }

      /**
       * Get the version of a given database
       * @param {string} dbName The name of the database to return the version of
       * @param {string} type The type of listener for bellhop to send to
       */
    }, {
      key: "onIDBGetVersion",
      value: function onIDBGetVersion(_ref10) {
        var _this11 = this;
        var type = _ref10.type,
          dbName = _ref10.data.dbName;
        // Create a new instance of savedDataHandler to avoid mutating the current instance
        var sdh = new SavedDataHandler();
        sdh.IDBGetVersion(dbName, function (value) {
          return _this11.client.send(type, value);
        });
      }

      /**
       * Close the connection with the database
       * @param {string} type The type of listener for bellhop to send to
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
      /**
       * Close the connection with the database
       * @param type - The type of request being sent
       */
    }, {
      key: "onIDBDeleteDB",
      value: function onIDBDeleteDB(_ref12) {
        var _this13 = this;
        var type = _ref12.type,
          _ref12$data = _ref12.data,
          dbName = _ref12$data.dbName,
          options = _ref12$data.options;
        var sdh = new SavedDataHandler();
        sdh.IDBDeleteDB(dbName, options, function (value) {
          return _this13.client.send(type, value);
        });
      }
    }]);
    return UserDataPlugin;
  }(BasePlugin);

  /**
   * @export
   * @class PointerSizePlugin
   * @extends {SliderPlugin}
   * @property {object[]} sliders an array of all slider objects attached to PointerSizePlugin
   * @extends SliderPlugin
   */
  var PointerSizePlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(PointerSizePlugin, _SliderPlugin);
    var _super = _createSuper(PointerSizePlugin);
    /**
     * Creates an instance of PointerSizePlugin.
     * @param {string | HTMLElement} [pointerSliders] selector string or HTML Element for the input(s)
     * @param {number} [defaultPointerSize=0.5] The default value for the pointer size slider
     * @memberof PointerSizePlugin
     */
    function PointerSizePlugin(pointerSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultPointerSi = _ref.defaultPointerSize,
        defaultPointerSize = _ref$defaultPointerSi === void 0 ? 0.5 : _ref$defaultPointerSi;
      _classCallCheck(this, PointerSizePlugin);
      _this = _super.call(this, pointerSliders, 'UISize-Pointer-Plugin', {
        defaultValue: defaultPointerSize,
        featureName: PointerSizePlugin.pointerSizeKey
      });
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
       * @return {string}
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
   * @property {object[]} sliders An array of slider objects given to ButtonSizePlugin
   * @property {number} currentValue The current button size value
   * @extends {SliderPlugin}
   */
  var ButtonSizePlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(ButtonSizePlugin, _SliderPlugin);
    var _super = _createSuper(ButtonSizePlugin);
    /**
     * Creates an instance of ButtonSizePlugin.
     * @param {string | HTMLElement} buttonSliders selector string or html element(s) for the inputs
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
      _this = _super.call(this, buttonSliders, 'UISize-Button-Plugin', {
        defaultValue: defaultButtonSize,
        featureName: ButtonSizePlugin.buttonSizeKey
      });
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
       * Get ButtonSize Key
       * @readonly
       * @static
       * @memberof ButtonSizePlugin
       * @returns {string}
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
   * @property {object[]} sliders an array of all slider objects attached to ControlSensitivityPlugin
   * @extends {SliderPlugin}
   */
  var ControlSensitivityPlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(ControlSensitivityPlugin, _SliderPlugin);
    var _super = _createSuper(ControlSensitivityPlugin);
    /**
     * Creates an instance of ControlSensitivityPlugin.
     * @param {string | HTMLElement} sensitivitySliders
     * @param {number} [defaultSensitivity=0.5]
     * @memberof ControlSensitivityPlugin
     */
    function ControlSensitivityPlugin(sensitivitySliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultSensitivi = _ref.defaultSensitivity,
        defaultSensitivity = _ref$defaultSensitivi === void 0 ? 0.5 : _ref$defaultSensitivi;
      _classCallCheck(this, ControlSensitivityPlugin);
      _this = _super.call(this, sensitivitySliders, 'Control-Sensitivity-Plugin', {
        defaultValue: defaultSensitivity,
        featureName: ControlSensitivityPlugin.controlSensitivityKey
      });
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
       * @returns {string}
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
  var KeyboardMapPlugin = /*#__PURE__*/function (_BasePlugin) {
    _inherits(KeyboardMapPlugin, _BasePlugin);
    var _super = _createSuper(KeyboardMapPlugin);
    /**
     * Creates an instance of KeyboardMapPlugin.
     * @param {string | HTMLElement} keyContainers div or similar container element that will contain the re-mappable keys
     * @param {string} [customClassName='springrollContainerKeyBinding__button'] A custom class name that will be applied to the container element
     * @memberof KeyboardMapPlugin
     */
    function KeyboardMapPlugin(keyContainers) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$customClassName = _ref.customClassName,
        customClassName = _ref$customClassName === void 0 ? 'springrollContainerKeyBinding__button' : _ref$customClassName;
      _classCallCheck(this, KeyboardMapPlugin);
      _this = _super.call(this, 'Keyboard-Map-Plugin');
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      //Allows for removing and reading event listeners
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
                }
                //only needs to be set up once
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
       * @returns {string}
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
   * @property {object[]} sliders an array of all slider objects attached to LayersPlugin
   * @extends {SliderPlugin}
   */
  var LayersPlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(LayersPlugin, _SliderPlugin);
    var _super = _createSuper(LayersPlugin);
    /**
     * Creates an instance of KeyboardMapPlugin.
     * @param {string | HTMLInputElement} layersSliders selector string or HTML Element for the input(s)
     * @param {number} [defaultValue=0] The default value for the slider
     */
    function LayersPlugin(layersSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultValue = _ref.defaultValue,
        defaultValue = _ref$defaultValue === void 0 ? 0 : _ref$defaultValue;
      _classCallCheck(this, LayersPlugin);
      _this = _super.call(this, layersSliders, 'Layer-Plugin', {
        defaultValue: defaultValue,
        featureName: LayersPlugin.layersSliderKey
      });
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
       * @returns {string}
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
  var HUDPlugin = /*#__PURE__*/function (_RadioGroupPlugin) {
    _inherits(HUDPlugin, _RadioGroupPlugin);
    var _super = _createSuper(HUDPlugin);
    /**
     * Creates an instance of HUDPlugin
     * @param {string} hudSelectorRadios  selector string or for the input(s)
     * @param {string[]} [defaultValue='top'] default value for the HUD position
     * @memberof HUDPlugin
     */
    function HUDPlugin(hudSelectorRadios) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultValue = _ref.defaultValue,
        defaultValue = _ref$defaultValue === void 0 ? SUPPORTED_POSITIONS[0] : _ref$defaultValue;
      _classCallCheck(this, HUDPlugin);
      _this = _super.call(this, hudSelectorRadios, 'HUD-Layout-Plugin', {
        supportedValues: SUPPORTED_POSITIONS,
        initialValue: defaultValue,
        controlName: 'Hud Selector',
        featureName: HUDPlugin.hudPositionKey,
        radioCount: SUPPORTED_POSITIONS.length
      });
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
          }
          //get the game's reported HUD positions to build out positions array
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
       * @returns {string}
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
   * @property {boolean} sendAfterFetch Whether to send the properties after fetch or not
   * @property {boolean} canEmit Whether or not the plugin can send properties
   * @property {string} colors 
   * @extends {RadioGroupPlugin}
   */
  var ColorVisionPlugin = /*#__PURE__*/function (_RadioGroupPlugin) {
    _inherits(ColorVisionPlugin, _RadioGroupPlugin);
    var _super = _createSuper(ColorVisionPlugin);
    /**
     * Creates an instance of ColorVisionPlugin.
     * @param {string | HTMLElement} colorSelects
     * @param {string } [defaultValue] Default selected value
     * @memberof ColorVision
     */
    function ColorVisionPlugin(colorVisionRadios) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultValue = _ref.defaultValue,
        defaultValue = _ref$defaultValue === void 0 ? COLOR_BLIND_TYPES[0] : _ref$defaultValue;
      _classCallCheck(this, ColorVisionPlugin);
      _this = _super.call(this, colorVisionRadios, 'Color-Filter-Plugin', {
        supportedValues: COLOR_BLIND_TYPES,
        initialValue: defaultValue,
        controlName: 'Color Vision Selector',
        featureName: ColorVisionPlugin.colorVisionKey,
        radioCount: COLOR_BLIND_TYPES.length
      });
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
          }

          //get the game's reported colors to build out accepted filters array
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
       * Get the ColorVisionPlugin key
       * @readonly
       * @static
       * @memberof ColorVisionPlugin
       * @returns {string}
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
   * @property {object[]} sliders an array of all slider objects attached to ControlSensitivityPlugin
   * @extends {SliderPlugin}
   * 
   */
  var HitAreaScalePlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(HitAreaScalePlugin, _SliderPlugin);
    var _super = _createSuper(HitAreaScalePlugin);
    /**
     * Creates an instance of HitAreaScalePlugin.
     * @param {string | HTMLElement} hitAreaScaleSliders The selector or HTMLElement for the slider
     * @param {number} [defaultHitAreaScale=0.5] The default hit area scale value
     * @memberof HitAreaScalePlugin
     */
    function HitAreaScalePlugin(hitAreaScaleSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultHitAreaSc = _ref.defaultHitAreaScale,
        defaultHitAreaScale = _ref$defaultHitAreaSc === void 0 ? 0.5 : _ref$defaultHitAreaSc;
      _classCallCheck(this, HitAreaScalePlugin);
      _this = _super.call(this, hitAreaScaleSliders, 'Hit-Area-Scale-Plugin', {
        defaultValue: defaultHitAreaScale,
        featureName: HitAreaScalePlugin.hitAreaScaleKey
      });
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
       * @returns {string}
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
  var DragThresholdScalePlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(DragThresholdScalePlugin, _SliderPlugin);
    var _super = _createSuper(DragThresholdScalePlugin);
    /**
     * Creates an instance of DragThresholdScalePlugin.
     * @param {string | HTMLElement} params.dragThresholdScaleSliders
     * @param {number} [defaultDragThresholdScale=0.5]
     * @memberof DragThresholdScalePlugin
     */
    function DragThresholdScalePlugin(dragThresholdScaleSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultDragThres = _ref.defaultDragThresholdScale,
        defaultDragThresholdScale = _ref$defaultDragThres === void 0 ? 0.5 : _ref$defaultDragThres;
      _classCallCheck(this, DragThresholdScalePlugin);
      _this = _super.call(this, dragThresholdScaleSliders, 'Drag-Threshold-Scale-Plugin', {
        defaultValue: defaultDragThresholdScale,
        featureName: DragThresholdScalePlugin.dragThresholdScaleKey
      });
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
       * @returns {string}
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
  var HealthPlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(HealthPlugin, _SliderPlugin);
    var _super = _createSuper(HealthPlugin);
    /**
     * Creates an instance of HealthPlugin.
     * @param {string | HTMLElement} healthSliders
     * @param {number} [defaultHealth=0.5]
     * @memberof HealthPlugin
     */
    function HealthPlugin(healthSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultHealth = _ref.defaultHealth,
        defaultHealth = _ref$defaultHealth === void 0 ? 0.5 : _ref$defaultHealth;
      _classCallCheck(this, HealthPlugin);
      _this = _super.call(this, healthSliders, 'Health-Scale-Plugin', {
        defaultValue: defaultHealth,
        featureName: HealthPlugin.healthKey
      });
      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onHealthChange.bind(_assertThisInitialized(_this)));
      }
      return _this;
    }

    /**
     * @memberof HealthPlugin
     * @param {Event} e
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
       * @returns {string}
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
   * @property {object[]} sliders an array of all slider objects attached to ObjectCountPlugin
   * @extends {SliderPlugin}
   */
  var ObjectCountPlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(ObjectCountPlugin, _SliderPlugin);
    var _super = _createSuper(ObjectCountPlugin);
    /**
     * Creates an instance of ObjectCountPlugin.
     * @param {string | HTMLElement} objectCountSliders selector string or HTML Element for the input(s)
     * @param {number} [defaultObjectCount=0.5] The default value for the slider
     * @memberof ObjectCountPlugin
     */
    function ObjectCountPlugin(objectCountSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultObjectCou = _ref.defaultObjectCount,
        defaultObjectCount = _ref$defaultObjectCou === void 0 ? 0.5 : _ref$defaultObjectCou;
      _classCallCheck(this, ObjectCountPlugin);
      _this = _super.call(this, objectCountSliders, 'Object-Count-Plugin', {
        defaultValue: defaultObjectCount,
        featureName: ObjectCountPlugin.objectCountKey
      });
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
       * @returns {string}
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
   * @property {object[]} sliders an array of all slider objects attached to CompletePercentagePlugin
   * @extends {SliderPlugin}
   */
  var CompletionPercentagePlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(CompletionPercentagePlugin, _SliderPlugin);
    var _super = _createSuper(CompletionPercentagePlugin);
    /**
     * Creates an instance of CompletionPercentagePlugin.
     * @param {string | HTMLElement} completionPercentageSliders The selector or HTMLSliderElement of the slider
     * @param {number} [defaultCompletionPercentage=0.5] Default selected completion percentage
     * @memberof CompletionPercentagePlugin
     */
    function CompletionPercentagePlugin(completionPercentageSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultCompletio = _ref.defaultCompletionPercentage,
        defaultCompletionPercentage = _ref$defaultCompletio === void 0 ? 0.5 : _ref$defaultCompletio;
      _classCallCheck(this, CompletionPercentagePlugin);
      _this = _super.call(this, completionPercentageSliders, 'Completion-Percentage-Plugin', {
        defaultValue: defaultCompletionPercentage,
        featureName: CompletionPercentagePlugin.completionPercentageKey
      });
      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onCompletionPercentageChange.bind(_assertThisInitialized(_this)));
      }
      return _this;
    }

    /**
     * @memberof CompletionPercentagePlugin
     * @param {Event} e
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
       * @returns {string}
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
  var SpeedScalePlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(SpeedScalePlugin, _SliderPlugin);
    var _super = _createSuper(SpeedScalePlugin);
    /**
     *Creates an instance of SpeedScalePlugin.
     * @param {string | HTMLElement} speedScaleSliders selector string or HTML Element for the input(s)
     * @param {number} [defaultSpeedScale=0.5] The default value for the speed scale slider
     * @memberof SpeedScalePlugin
     */
    function SpeedScalePlugin(speedScaleSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultSpeedScal = _ref.defaultSpeedScale,
        defaultSpeedScale = _ref$defaultSpeedScal === void 0 ? 0.5 : _ref$defaultSpeedScal;
      _classCallCheck(this, SpeedScalePlugin);
      _this = _super.call(this, speedScaleSliders, 'Speed-Scale-Plugin', {
        defaultValue: defaultSpeedScale,
        featureName: SpeedScalePlugin.speedScaleKey
      });
      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onSpeedScaleChange.bind(_assertThisInitialized(_this)));
      }
      return _this;
    }

    /**
     * @memberof SpeedScalePlugin
     * @param {Event} e
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
       * @return {string}
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
   * @property {number} currentValue
   * @extends {SliderPlugin}
   */
  var TimersScalePlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(TimersScalePlugin, _SliderPlugin);
    var _super = _createSuper(TimersScalePlugin);
    /**
     * Creates an instance of TimersScalePlugin.
     * @param {string | HTMLElement} timersScaleSliders selector string or HTML Element for the input(s)
     * @param {number} [defaultTimersScale=0.5] Default Value for the timer scale slider
     * @memberof TimersScalePlugin
     */
    function TimersScalePlugin(timersScaleSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultTimersSca = _ref.defaultTimersScale,
        defaultTimersScale = _ref$defaultTimersSca === void 0 ? 0.5 : _ref$defaultTimersSca;
      _classCallCheck(this, TimersScalePlugin);
      _this = _super.call(this, timersScaleSliders, 'Timers-Scale-Plugin', {
        defaultValue: defaultTimersScale,
        featureName: TimersScalePlugin.timersScaleKey
      });
      for (var i = 0; i < _this.slidersLength; i++) {
        _this.sliders[i].enableSliderEvents(_this.onTimersScaleChange.bind(_assertThisInitialized(_this)));
      }
      return _this;
    }

    /**
     * @memberof TimersScalePlugin
     * @param {Event} e
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
       * @return {string}
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
   * @property {object[]} sliders an array of all slider objects attached to InputCountPlugin
   * @extends {SliderPlugin}
   */
  var InputCountPlugin = /*#__PURE__*/function (_SliderPlugin) {
    _inherits(InputCountPlugin, _SliderPlugin);
    var _super = _createSuper(InputCountPlugin);
    /**
     * Creates an instance of InputCountPlugin.
     * @param {string | HTMLElement} inputCountSliders selector string or HTML Element for the input(s)
     * @param {number} [defaultInputCount=0.5] The default value for the slider
     * @memberof InputCountPlugin
     */
    function InputCountPlugin(inputCountSliders) {
      var _this;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$defaultInputCoun = _ref.defaultInputCount,
        defaultInputCount = _ref$defaultInputCoun === void 0 ? 0.5 : _ref$defaultInputCoun;
      _classCallCheck(this, InputCountPlugin);
      _this = _super.call(this, inputCountSliders, 'Input-Count-Plugin', {
        defaultValue: defaultInputCount,
        featureName: InputCountPlugin.inputCountKey
      });
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
       * @returns {string}
       */
    }], [{
      key: "inputCountKey",
      get: function get() {
        return 'inputCount';
      }
    }]);
    return InputCountPlugin;
  }(SliderPlugin);

  /**
   * A Springroll plugin to easily set up togglable fullscreen
   */
  var FullScreenPlugin = /*#__PURE__*/function (_ButtonPlugin) {
    _inherits(FullScreenPlugin, _ButtonPlugin);
    var _super = _createSuper(FullScreenPlugin);
    /**
     *  Creates an instance of FullscreenPlugin
     * 
     * @param {string | string[]} buttonSelector The selector for the element to be made fullscreen
     */
    function FullScreenPlugin(buttonSelector) {
      var _this;
      _classCallCheck(this, FullScreenPlugin);
      _this = _super.call(this, {
        name: FullScreenPlugin.fullscreenKey
      });
      _this._toggleButtons = [];
      _this.iFrame = null;
      _this.sendAllProperties = _this.sendAllProperties.bind(_assertThisInitialized(_this));
      if (Array.isArray(buttonSelector)) {
        // If input is an array, join the selectors into one string
        buttonSelector = buttonSelector.join(', ');
      }
      console.log(buttonSelector);
      _this.toggleButton = document.querySelectorAll(buttonSelector);
      _this.toggleButton.forEach(function (button) {
        _this._toggleButtons.push(new Button({
          button: button,
          onClick: _this.toggleFullScreen.bind(_assertThisInitialized(_this)),
          channel: FullScreenPlugin.fullscreenKey
        }));
      });
      document.addEventListener('fullscreenchange', function () {
        _this.sendAllProperties();
        _this._toggleButtons.forEach(function (button) {
          button.button.classList.toggle('--fullScreen');
        });
      });
      return _this;
    }

    /**
     * @memberof FullScreenPlugin
     */
    _createClass(FullScreenPlugin, [{
      key: "init",
      value: function init(_ref) {
        var iframe = _ref.iframe;
        this.iFrame = iframe;
        // Handle the features request
        this.client.on('features', function ($event) {
          for (var i = 0; i < this.fullscreenElement; i++) {
            this._toggleButtons[i].displayButton($event.data);
          }
        }.bind(this));
      }
      /**
      * @memberof FullScreenPlugin
      */
    }, {
      key: "start",
      value: function start() {
        this.client.on('loaded', this.sendAllProperties);
        this.client.on('loadDone', this.sendAllProperties);
      }

      /**
      *
      * Sends initial fullScreen properties to the application
      * @memberof FullScreenTogglePlugin
      */
    }, {
      key: "sendAllProperties",
      value: function sendAllProperties() {
        this.sendProperty(FullScreenPlugin.fullscreenKey, document.fullscreenElement != null ? 'true' : 'false');
      }

      /**
       * Toggles fullscreen on this.iFrame. Must be from a user generated event
       */
    }, {
      key: "toggleFullScreen",
      value: function toggleFullScreen() {
        var _this2 = this;
        if (!document.fullscreenElement) {
          this.iFrame.requestFullscreen().then(function () {
            _this2.sendAllProperties();
          }).catch(function (err) {
            console.log(err);
          });
        } else {
          document.exitFullscreen();
          this.sendAllProperties();
        }
      }

      /**
       * Returns true if there is a fullscreen element and false if not
       * @returns { boolean } 
       */
    }, {
      key: "isFullScreen",
      get: function get() {
        return (document.fullscreenElement ||
        // basic
        document.webkitIsFullscreen ||
        //Webkit browsers
        document.mozFullScreen // Firefox
        ) != true; // Ensure boolean output
      }

      /** 
       * @readonly
       * @static
       * @memberof FullscreenPlugin
       */
    }], [{
      key: "fullscreenKey",
      get: function get() {
        return 'fullScreen';
      }
    }]);
    return FullScreenPlugin;
  }(ButtonPlugin);

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
  exports.FullScreenPlugin = FullScreenPlugin;
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

}));
//# sourceMappingURL=SpringRoll-Container-umd.js.map
