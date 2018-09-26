function finallyConstructor(t) {
  var e = this.constructor;
  return this.then(
    function(s) {
      return e.resolve(t()).then(function() {
        return s;
      });
    },
    function(s) {
      return e.resolve(t()).then(function() {
        return e.reject(s);
      });
    }
  );
}
var setTimeoutFunc = setTimeout;
function noop() {}
function bind(t, e) {
  return function() {
    t.apply(e, arguments);
  };
}
function Promise$1(t) {
  if (!(this instanceof Promise$1))
    throw new TypeError('Promises must be constructed via new');
  if ('function' != typeof t) throw new TypeError('not a function');
  (this._state = 0),
    (this._handled = !1),
    (this._value = void 0),
    (this._deferreds = []),
    doResolve(t, this);
}
function handle(t, e) {
  for (; 3 === t._state; ) t = t._value;
  0 !== t._state
    ? ((t._handled = !0),
      Promise$1._immediateFn(function() {
        var s = 1 === t._state ? e.onFulfilled : e.onRejected;
        if (null !== s) {
          var i;
          try {
            i = s(t._value);
          } catch (t) {
            return void reject(e.promise, t);
          }
          resolve(e.promise, i);
        } else (1 === t._state ? resolve : reject)(e.promise, t._value);
      }))
    : t._deferreds.push(e);
}
function resolve(t, e) {
  try {
    if (e === t)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (e && ('object' == typeof e || 'function' == typeof e)) {
      var s = e.then;
      if (e instanceof Promise$1)
        return (t._state = 3), (t._value = e), void finale(t);
      if ('function' == typeof s) return void doResolve(bind(s, e), t);
    }
    (t._state = 1), (t._value = e), finale(t);
  } catch (e) {
    reject(t, e);
  }
}
function reject(t, e) {
  (t._state = 2), (t._value = e), finale(t);
}
function finale(t) {
  2 === t._state &&
    0 === t._deferreds.length &&
    Promise$1._immediateFn(function() {
      t._handled || Promise$1._unhandledRejectionFn(t._value);
    });
  for (var e = 0, s = t._deferreds.length; e < s; e++)
    handle(t, t._deferreds[e]);
  t._deferreds = null;
}
function Handler(t, e, s) {
  (this.onFulfilled = 'function' == typeof t ? t : null),
    (this.onRejected = 'function' == typeof e ? e : null),
    (this.promise = s);
}
function doResolve(t, e) {
  var s = !1;
  try {
    t(
      function(t) {
        s || ((s = !0), resolve(e, t));
      },
      function(t) {
        s || ((s = !0), reject(e, t));
      }
    );
  } catch (t) {
    if (s) return;
    (s = !0), reject(e, t);
  }
}
(Promise$1.prototype.catch = function(t) {
  return this.then(null, t);
}),
  (Promise$1.prototype.then = function(t, e) {
    var s = new this.constructor(noop);
    return handle(this, new Handler(t, e, s)), s;
  }),
  (Promise$1.prototype.finally = finallyConstructor),
  (Promise$1.all = function(t) {
    return new Promise$1(function(e, s) {
      if (!t || void 0 === t.length)
        throw new TypeError('Promise.all accepts an array');
      var i = Array.prototype.slice.call(t);
      if (0 === i.length) return e([]);
      var n = i.length;
      function o(t, r) {
        try {
          if (r && ('object' == typeof r || 'function' == typeof r)) {
            var a = r.then;
            if ('function' == typeof a)
              return void a.call(
                r,
                function(e) {
                  o(t, e);
                },
                s
              );
          }
          (i[t] = r), 0 == --n && e(i);
        } catch (t) {
          s(t);
        }
      }
      for (var r = 0; r < i.length; r++) o(r, i[r]);
    });
  }),
  (Promise$1.resolve = function(t) {
    return t && 'object' == typeof t && t.constructor === Promise$1
      ? t
      : new Promise$1(function(e) {
          e(t);
        });
  }),
  (Promise$1.reject = function(t) {
    return new Promise$1(function(e, s) {
      s(t);
    });
  }),
  (Promise$1.race = function(t) {
    return new Promise$1(function(e, s) {
      for (var i = 0, n = t.length; i < n; i++) t[i].then(e, s);
    });
  }),
  (Promise$1._immediateFn =
    ('function' == typeof setImmediate &&
      function(t) {
        setImmediate(t);
      }) ||
    function(t) {
      setTimeoutFunc(t, 0);
    }),
  (Promise$1._unhandledRejectionFn = function(t) {
    'undefined' != typeof console &&
      console &&
      console.warn('Possible Unhandled Promise Rejection:', t);
  });
var globalNS = (function() {
  if ('undefined' != typeof self) return self;
  if ('undefined' != typeof window) return window;
  if ('undefined' != typeof global) return global;
  throw new Error('unable to locate global object');
})();
'Promise' in globalNS
  ? globalNS.Promise.prototype.finally ||
    (globalNS.Promise.prototype.finally = finallyConstructor)
  : (globalNS.Promise = Promise$1),
  window.NodeList &&
    !NodeList.prototype.forEach &&
    (NodeList.prototype.forEach = function(t, e) {
      e = e || window;
      for (var s = 0; s < this.length; s++) t.call(e, this[s], s, this);
    });
var support = {
  searchParams: 'URLSearchParams' in self,
  iterable: 'Symbol' in self && 'iterator' in Symbol,
  blob:
    'FileReader' in self &&
    'Blob' in self &&
    (function() {
      try {
        return new Blob(), !0;
      } catch (t) {
        return !1;
      }
    })(),
  formData: 'FormData' in self,
  arrayBuffer: 'ArrayBuffer' in self
};
function isDataView(t) {
  return t && DataView.prototype.isPrototypeOf(t);
}
if (support.arrayBuffer)
  var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ],
    isArrayBufferView =
      ArrayBuffer.isView ||
      function(t) {
        return t && viewClasses.indexOf(Object.prototype.toString.call(t)) > -1;
      };
function normalizeName(t) {
  if (
    ('string' != typeof t && (t = String(t)),
    /[^a-z0-9\-#$%&'*+.^_`|~]/i.test(t))
  )
    throw new TypeError('Invalid character in header field name');
  return t.toLowerCase();
}
function normalizeValue(t) {
  return 'string' != typeof t && (t = String(t)), t;
}
function iteratorFor(t) {
  var e = {
    next: function() {
      var e = t.shift();
      return { done: void 0 === e, value: e };
    }
  };
  return (
    support.iterable &&
      (e[Symbol.iterator] = function() {
        return e;
      }),
    e
  );
}
function Headers(t) {
  (this.map = {}),
    t instanceof Headers
      ? t.forEach(function(t, e) {
          this.append(e, t);
        }, this)
      : Array.isArray(t)
        ? t.forEach(function(t) {
            this.append(t[0], t[1]);
          }, this)
        : t &&
          Object.getOwnPropertyNames(t).forEach(function(e) {
            this.append(e, t[e]);
          }, this);
}
function consumed(t) {
  if (t.bodyUsed) return Promise.reject(new TypeError('Already read'));
  t.bodyUsed = !0;
}
function fileReaderReady(t) {
  return new Promise(function(e, s) {
    (t.onload = function() {
      e(t.result);
    }),
      (t.onerror = function() {
        s(t.error);
      });
  });
}
function readBlobAsArrayBuffer(t) {
  var e = new FileReader(),
    s = fileReaderReady(e);
  return e.readAsArrayBuffer(t), s;
}
function readBlobAsText(t) {
  var e = new FileReader(),
    s = fileReaderReady(e);
  return e.readAsText(t), s;
}
function readArrayBufferAsText(t) {
  for (
    var e = new Uint8Array(t), s = new Array(e.length), i = 0;
    i < e.length;
    i++
  )
    s[i] = String.fromCharCode(e[i]);
  return s.join('');
}
function bufferClone(t) {
  if (t.slice) return t.slice(0);
  var e = new Uint8Array(t.byteLength);
  return e.set(new Uint8Array(t)), e.buffer;
}
function Body() {
  return (
    (this.bodyUsed = !1),
    (this._initBody = function(t) {
      (this._bodyInit = t),
        t
          ? 'string' == typeof t
            ? (this._bodyText = t)
            : support.blob && Blob.prototype.isPrototypeOf(t)
              ? (this._bodyBlob = t)
              : support.formData && FormData.prototype.isPrototypeOf(t)
                ? (this._bodyFormData = t)
                : support.searchParams &&
                  URLSearchParams.prototype.isPrototypeOf(t)
                  ? (this._bodyText = t.toString())
                  : support.arrayBuffer && support.blob && isDataView(t)
                    ? ((this._bodyArrayBuffer = bufferClone(t.buffer)),
                      (this._bodyInit = new Blob([this._bodyArrayBuffer])))
                    : support.arrayBuffer &&
                      (ArrayBuffer.prototype.isPrototypeOf(t) ||
                        isArrayBufferView(t))
                      ? (this._bodyArrayBuffer = bufferClone(t))
                      : (this._bodyText = t = Object.prototype.toString.call(t))
          : (this._bodyText = ''),
        this.headers.get('content-type') ||
          ('string' == typeof t
            ? this.headers.set('content-type', 'text/plain;charset=UTF-8')
            : this._bodyBlob && this._bodyBlob.type
              ? this.headers.set('content-type', this._bodyBlob.type)
              : support.searchParams &&
                URLSearchParams.prototype.isPrototypeOf(t) &&
                this.headers.set(
                  'content-type',
                  'application/x-www-form-urlencoded;charset=UTF-8'
                ));
    }),
    support.blob &&
      ((this.blob = function() {
        var t = consumed(this);
        if (t) return t;
        if (this._bodyBlob) return Promise.resolve(this._bodyBlob);
        if (this._bodyArrayBuffer)
          return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        if (this._bodyFormData)
          throw new Error('could not read FormData body as blob');
        return Promise.resolve(new Blob([this._bodyText]));
      }),
      (this.arrayBuffer = function() {
        return this._bodyArrayBuffer
          ? consumed(this) || Promise.resolve(this._bodyArrayBuffer)
          : this.blob().then(readBlobAsArrayBuffer);
      })),
    (this.text = function() {
      var t = consumed(this);
      if (t) return t;
      if (this._bodyBlob) return readBlobAsText(this._bodyBlob);
      if (this._bodyArrayBuffer)
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
      if (this._bodyFormData)
        throw new Error('could not read FormData body as text');
      return Promise.resolve(this._bodyText);
    }),
    support.formData &&
      (this.formData = function() {
        return this.text().then(decode);
      }),
    (this.json = function() {
      return this.text().then(JSON.parse);
    }),
    this
  );
}
(Headers.prototype.append = function(t, e) {
  (t = normalizeName(t)), (e = normalizeValue(e));
  var s = this.map[t];
  this.map[t] = s ? s + ', ' + e : e;
}),
  (Headers.prototype.delete = function(t) {
    delete this.map[normalizeName(t)];
  }),
  (Headers.prototype.get = function(t) {
    return (t = normalizeName(t)), this.has(t) ? this.map[t] : null;
  }),
  (Headers.prototype.has = function(t) {
    return this.map.hasOwnProperty(normalizeName(t));
  }),
  (Headers.prototype.set = function(t, e) {
    this.map[normalizeName(t)] = normalizeValue(e);
  }),
  (Headers.prototype.forEach = function(t, e) {
    for (var s in this.map)
      this.map.hasOwnProperty(s) && t.call(e, this.map[s], s, this);
  }),
  (Headers.prototype.keys = function() {
    var t = [];
    return (
      this.forEach(function(e, s) {
        t.push(s);
      }),
      iteratorFor(t)
    );
  }),
  (Headers.prototype.values = function() {
    var t = [];
    return (
      this.forEach(function(e) {
        t.push(e);
      }),
      iteratorFor(t)
    );
  }),
  (Headers.prototype.entries = function() {
    var t = [];
    return (
      this.forEach(function(e, s) {
        t.push([s, e]);
      }),
      iteratorFor(t)
    );
  }),
  support.iterable &&
    (Headers.prototype[Symbol.iterator] = Headers.prototype.entries);
var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
function normalizeMethod(t) {
  var e = t.toUpperCase();
  return methods.indexOf(e) > -1 ? e : t;
}
function Request(t, e) {
  var s = (e = e || {}).body;
  if (t instanceof Request) {
    if (t.bodyUsed) throw new TypeError('Already read');
    (this.url = t.url),
      (this.credentials = t.credentials),
      e.headers || (this.headers = new Headers(t.headers)),
      (this.method = t.method),
      (this.mode = t.mode),
      (this.signal = t.signal),
      s || null == t._bodyInit || ((s = t._bodyInit), (t.bodyUsed = !0));
  } else this.url = String(t);
  if (
    ((this.credentials = e.credentials || this.credentials || 'same-origin'),
    (!e.headers && this.headers) || (this.headers = new Headers(e.headers)),
    (this.method = normalizeMethod(e.method || this.method || 'GET')),
    (this.mode = e.mode || this.mode || null),
    (this.signal = e.signal || this.signal),
    (this.referrer = null),
    ('GET' === this.method || 'HEAD' === this.method) && s)
  )
    throw new TypeError('Body not allowed for GET or HEAD requests');
  this._initBody(s);
}
function decode(t) {
  var e = new FormData();
  return (
    t
      .trim()
      .split('&')
      .forEach(function(t) {
        if (t) {
          var s = t.split('='),
            i = s.shift().replace(/\+/g, ' '),
            n = s.join('=').replace(/\+/g, ' ');
          e.append(decodeURIComponent(i), decodeURIComponent(n));
        }
      }),
    e
  );
}
function parseHeaders(t) {
  var e = new Headers();
  return (
    t
      .replace(/\r?\n[\t ]+/g, ' ')
      .split(/\r?\n/)
      .forEach(function(t) {
        var s = t.split(':'),
          i = s.shift().trim();
        if (i) {
          var n = s.join(':').trim();
          e.append(i, n);
        }
      }),
    e
  );
}
function Response(t, e) {
  e || (e = {}),
    (this.type = 'default'),
    (this.status = void 0 === e.status ? 200 : e.status),
    (this.ok = this.status >= 200 && this.status < 300),
    (this.statusText = 'statusText' in e ? e.statusText : 'OK'),
    (this.headers = new Headers(e.headers)),
    (this.url = e.url || ''),
    this._initBody(t);
}
(Request.prototype.clone = function() {
  return new Request(this, { body: this._bodyInit });
}),
  Body.call(Request.prototype),
  Body.call(Response.prototype),
  (Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  }),
  (Response.error = function() {
    var t = new Response(null, { status: 0, statusText: '' });
    return (t.type = 'error'), t;
  });
var redirectStatuses = [301, 302, 303, 307, 308];
Response.redirect = function(t, e) {
  if (-1 === redirectStatuses.indexOf(e))
    throw new RangeError('Invalid status code');
  return new Response(null, { status: e, headers: { location: t } });
};
var DOMException = self.DOMException;
try {
  new DOMException();
} catch (t) {
  ((DOMException = function(t, e) {
    (this.message = t), (this.name = e);
    var s = Error(t);
    this.stack = s.stack;
  }).prototype = Object.create(Error.prototype)),
    (DOMException.prototype.constructor = DOMException);
}
function fetch$1(t, e) {
  return new Promise(function(s, i) {
    var n = new Request(t, e);
    if (n.signal && n.signal.aborted)
      return i(new DOMException('Aborted', 'AbortError'));
    var o = new XMLHttpRequest();
    function r() {
      o.abort();
    }
    (o.onload = function() {
      var t = {
        status: o.status,
        statusText: o.statusText,
        headers: parseHeaders(o.getAllResponseHeaders() || '')
      };
      t.url =
        'responseURL' in o ? o.responseURL : t.headers.get('X-Request-URL');
      var e = 'response' in o ? o.response : o.responseText;
      s(new Response(e, t));
    }),
      (o.onerror = function() {
        i(new TypeError('Network request failed'));
      }),
      (o.ontimeout = function() {
        i(new TypeError('Network request failed'));
      }),
      (o.onabort = function() {
        i(new DOMException('Aborted', 'AbortError'));
      }),
      o.open(n.method, n.url, !0),
      'include' === n.credentials
        ? (o.withCredentials = !0)
        : 'omit' === n.credentials && (o.withCredentials = !1),
      'responseType' in o && support.blob && (o.responseType = 'blob'),
      n.headers.forEach(function(t, e) {
        o.setRequestHeader(e, t);
      }),
      n.signal &&
        (n.signal.addEventListener('abort', r),
        (o.onreadystatechange = function() {
          4 === o.readyState && n.signal.removeEventListener('abort', r);
        })),
      o.send(void 0 === n._bodyInit ? null : n._bodyInit);
  });
}
function assign(t, e) {
  if (null == t) throw new TypeError('Cannot convert first argument to object');
  for (var s = Object(t), i = 1; i < arguments.length; i++) {
    var n = arguments[i];
    if (null != n)
      for (var o = Object.keys(Object(n)), r = 0, a = o.length; r < a; r++) {
        var u = o[r],
          l = Object.getOwnPropertyDescriptor(n, u);
        void 0 !== l && l.enumerable && (s[u] = n[u]);
      }
  }
  return s;
}
function polyfill() {
  Object.assign ||
    Object.defineProperty(Object, 'assign', {
      enumerable: !1,
      configurable: !0,
      writable: !0,
      value: assign
    });
}
(fetch$1.polyfill = !0),
  self.fetch ||
    ((self.fetch = fetch$1),
    (self.Headers = Headers),
    (self.Request = Request),
    (self.Response = Response));
var es6ObjectAssign = { assign: assign, polyfill: polyfill };
es6ObjectAssign.polyfill(),
  (function() {
    if ('undefined' != typeof window)
      try {
        var t = new window.CustomEvent('test', { cancelable: !0 });
        if ((t.preventDefault(), !0 !== t.defaultPrevented))
          throw new Error('Could not prevent default');
      } catch (t) {
        var e = function(t, e) {
          var s, i;
          return (
            (e = e || { bubbles: !1, cancelable: !1, detail: void 0 }),
            (s = document.createEvent('CustomEvent')).initCustomEvent(
              t,
              e.bubbles,
              e.cancelable,
              e.detail
            ),
            (i = s.preventDefault),
            (s.preventDefault = function() {
              i.call(this);
              try {
                Object.defineProperty(this, 'defaultPrevented', {
                  get: function() {
                    return !0;
                  }
                });
              } catch (t) {
                this.defaultPrevented = !0;
              }
            }),
            s
          );
        };
        (e.prototype = window.Event.prototype), (window.CustomEvent = e);
      }
  })();
class BellhopEventDispatcher {
  constructor() {
    this._listeners = {};
  }
  on(t, e, s = 0) {
    this._listeners[t] || (this._listeners[t] = []),
      (e._priority = parseInt(s) || 0),
      -1 === this._listeners[t].indexOf(e) &&
        (this._listeners[t].push(e),
        this._listeners[t].length > 1 &&
          this._listeners[t].sort(this.listenerSorter));
  }
  listenerSorter(t, e) {
    return t._priority - e._priority;
  }
  off(t, e) {
    if (void 0 === this._listeners[t]) return;
    if (void 0 === e) return void delete this._listeners[t];
    const s = this._listeners[t].indexOf(e);
    -1 < s && this._listeners[t].splice(s, 1);
  }
  trigger(t) {
    if (
      ('string' == typeof t && (t = { type: t }),
      void 0 !== this._listeners[t.type])
    )
      for (let e = this._listeners[t.type].length - 1; e >= 0; e--)
        this._listeners[t.type][e](t);
  }
  destroy() {
    this._listeners = {};
  }
}
class Bellhop extends BellhopEventDispatcher {
  constructor(t = (100 * Math.random()) | 0) {
    super(),
      (this.id = `BELLHOP:${t}`),
      (this.connected = !1),
      (this.isChild = !0),
      (this.connecting = !1),
      (this.origin = '*'),
      (this._sendLater = []),
      (this.iframe = null);
  }
  receive(t) {
    this.target === t.source &&
      ('connected' === t.data
        ? this.onConnectionReceived(t.data)
        : this.connected &&
          'object' == typeof t.data &&
          t.data.type &&
          this.trigger(t.data));
  }
  onConnectionReceived(t) {
    (this.connecting = !1),
      (this.connected = !0),
      this.trigger('connected'),
      this.isChild || this.target.postMessage(t, this.origin);
    for (let t = 0, e = this._sendLater.length; t < e; t++) {
      const { type: e, data: s } = this._sendLater[t];
      this.send(e, s);
    }
    this._sendLater.length = 0;
  }
  connect(t, e = '*') {
    this.connecting ||
      (this.disconnect(),
      (this.connecting = !0),
      t instanceof HTMLIFrameElement && (this.iframe = t),
      (this.isChild = void 0 === t),
      (this.supported = !0),
      this.isChild && (this.supported = window != t),
      (this.origin = e),
      window.addEventListener('message', this.receive.bind(this)),
      this.isChild &&
        (window === this.target
          ? this.trigger('failed')
          : this.target.postMessage('connected', this.origin)));
  }
  disconnect() {
    (this.connected = !1),
      (this.connecting = !1),
      (this.origin = null),
      (this.iframe = null),
      (this.isChild = !0),
      (this._sendLater.length = 0),
      window.removeEventListener('message', this.receive);
  }
  send(t, e = {}) {
    if ('string' != typeof t) throw 'The event type must be a string';
    const s = { type: t, data: e };
    this.connecting
      ? this._sendLater.push(s)
      : this.target.postMessage(s, this.origin);
  }
  fetch(t, e, s = {}, i = !1) {
    if (!this.connecting && !this.connected)
      throw 'No connection, please call connect() first';
    const n = t => {
      i && this.off(t.type, n), e(t);
    };
    this.on(t, n), this.send(t, s);
  }
  respond(t, e = {}, s = !1) {
    const i = n => {
      s && this.off(n.type, i), this.send(t, e);
    };
    this.on(t, i);
  }
  destroy() {
    super.destroy(), this.disconnect(), (this._sendLater.length = 0);
  }
  get target() {
    return this.isChild ? window.parent : this.iframe.contentWindow;
  }
}
class Features {
  static get webgl() {
    const t = document.createElement('canvas');
    return !(
      !t ||
      (!t.getContext('webgl') && !t.getContext('experimental-webgl'))
    );
  }
  static get canvas() {
    const t = document.createElement('canvas');
    return !(!t.getContext || !t.getContext('2d'));
  }
  static get webAudio() {
    return 'webkitAudioContext' in window || 'AudioContext' in window;
  }
  static get webSockets() {
    return 'WebSocket' in window || 'MozWebSocket' in window;
  }
  static get geolocation() {
    return 'geolocation' in navigator;
  }
  static get webWorkers() {
    return 'function' == typeof Worker;
  }
  static get touch() {
    return !!(
      'ontouchstart' in window ||
      (navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0) ||
      (navigator.pointerEnabled && navigator.maxTouchPoints > 0)
    );
  }
  static basic() {
    return Features.canvas
      ? Features.webAudio
        ? null
        : 'Browser does not support WebAudio'
      : 'Browser does not support canvas';
  }
  static test(t) {
    const e = this.basic();
    if (e) return e;
    const s = t.features,
      i = t.ui,
      n = t.sizes;
    for (const t in s)
      if (void 0 !== s[t] && !Features[t])
        return 'Browser does not support ' + t;
    if (!i.touch && Features.touch) return 'Game does not support touch input';
    if (!i.mouse && !Features.touch) return 'Game does not support mouse input';
    const o = Math.max(window.screen.width, window.screen.height);
    return !n.xsmall && o < 480
      ? "Game doesn't support extra small screens"
      : !n.small && o < 768
        ? "Game doesn't support small screens"
        : !n.medium && o < 992
          ? "Game doesn't support medium screens"
          : !n.large && o < 1200
            ? "Game doesn't support large screens"
            : !n.xlarge && o >= 1200
              ? "Game doesn't support extra large screens"
              : null;
  }
  static get info() {
    return `Browser Feature Detection\n\t\t\t\tCanvas support ${
      Features.canvas ? '✓' : '×'
    }\n\t\t\t\tWebGL support ${
      Features.webgl ? '✓' : '×'
    }\n\t\t\t\tWebAudio support ${Features.webAudio ? '✓' : '×'}`;
  }
}
const PLUGINS = [];
let CLIENT = new Bellhop();
class Container {
  constructor(t, e = {}) {
    if (((this.main = document.querySelector(t)), null === this.main))
      throw new Error('No iframe was found with the provided selector');
    this.client || (this.client = new Bellhop()),
      (this.dom = this.main),
      (this.loaded = !1),
      (this.loading = !1),
      (this.options = e),
      (this.release = null),
      (this.plugins = PLUGINS.map(t => new t(this)));
  }
  destroyClient() {
    this.client && (this.client.destroy(), (this.client = null));
  }
  onLoading() {
    this.client.trigger('opening');
  }
  onProgress() {
    this.client.trigger('progress');
  }
  onLoadDone() {
    (this.loading = !1),
      (this.loaded = !0),
      this.main.classList.remove('loading'),
      this.plugins.forEach(t => t.opened(this)),
      this.client.trigger('opened');
  }
  onEndGame() {
    this.reset();
  }
  onLocalError(t) {
    this.client.trigger(t.type);
  }
  reset() {
    const t = this.loaded || this.loading;
    t &&
      this.plugins
        .slice()
        .reverse()
        .forEach(t => t.closed(this)),
      t && this.client.trigger('closed'),
      this.destroyClient(),
      (this.loaded = !1),
      (this.loading = !1),
      this.main.setAttribute('src', ''),
      this.main.classList.remove('loading');
  }
  initClient() {
    (this.client = new Bellhop()),
      this.client.connect(this.dom),
      this.client.on('loading', this.onLoading.bind(this)),
      this.client.on('progress', this.onProgress.bind(this)),
      this.client.on('loaded', this.onLoadDone.bind(this)),
      this.client.on('endGame', this.onEndGame.bind(this)),
      this.client.on('localError', this.onLocalError.bind(this));
  }
  _onCloseFailed() {
    this.reset();
  }
  _internalOpen(t, { singlePlay: e = !1, playOptions: s = null } = {}) {
    const i = { singlePlay: e, playOptions: s };
    this.reset(), (this.loading = !0), this.initClient();
    const n = Features.basic();
    n && (console.error('ERROR:', n), this.client.trigger('unsupported')),
      this.plugins.forEach(t => t.open(this));
    let o = t;
    if (null !== i.playOptions) {
      const e =
        'playOptions=' + encodeURIComponent(JSON.stringify(i.playOptions));
      o = -1 === t.indexOf('?') ? `${t}?${e}` : `${t}&${e}`;
    }
    this.main.classList.add('loading'),
      this.main.setAttribute('src', o),
      this.client.respond('singlePlay', { singlePlay: e }),
      this.client.respond('playOptions', { playOptions: s }),
      this.client.trigger('open');
  }
  openPath(t, e = {}, s = {}) {
    'object' != typeof e &&
      (console.warn(
        'SpringRoll Container.openPath was passed a invalid options parameter. Using default parameters instead'
      ),
      (e = {})),
      this._internalOpen(
        t,
        Object.assign({ singlePlay: !1, playOptions: s }, e)
      );
  }
  openRemote(t, { query: e = '', singlePlay: s = !1 } = {}, i = null) {
    (this.release = null),
      fetch(t).then(t => {
        200 === t.status &&
          t.json().then(t => {
            if (Features.test(t)) return this.client.trigger('unsupported');
            (this.release = t),
              this._internalOpen(t.url + e, { singlePlay: s, playOptions: i });
          });
      });
  }
  destroy() {
    this.reset(),
      this.plugins
        .slice()
        .reverse()
        .forEach(t => t.teardown(this)),
      (this.main = null),
      (this.options = null),
      (this.dom = null),
      (this.release = null);
  }
  close() {
    this.loading || this.loaded
      ? (this.plugins.forEach(t => t.close(this)),
        this.client.trigger('close'),
        this.client.send('close'))
      : this.reset();
  }
  static get version() {
    return '2.0.0';
  }
  static uses(t) {
    ('function' == typeof t ||
      (() =>
        !!t.prototype &&
        t.prototype.constructor &&
        /^class/.test(t.prototype.constructor))()) &&
      (PLUGINS.push(t), PLUGINS.sort((t, e) => e.priority - t.priority));
  }
  static get plugins() {
    return PLUGINS;
  }
  static clearPlugins() {
    return (PLUGINS.length = 0), PLUGINS;
  }
  static _setClient(t) {
    (t instanceof Bellhop || null === t) && (CLIENT = t);
  }
  static _getClient() {
    return CLIENT;
  }
  set client(t) {
    Container._setClient(t);
  }
  static set client(t) {
    this._setClient(t);
  }
  static get client() {
    return this._getClient();
  }
  get client() {
    return Container._getClient();
  }
}
class PageVisibility {
  constructor(t = function() {}, e = function() {}) {
    (this._onFocus = t),
      (this._onBlur = e),
      (this.onFocus = function() {
        this.enabled && this._onFocus();
      }.bind(this)),
      (this.onBlur = function() {
        this.enabled && this._onBlur();
      }.bind(this)),
      (this._enabled = !1),
      (this.enabled = !0);
  }
  destroy() {
    (this.enabled = !1),
      (this.onToggle = null),
      (this.onFocus = null),
      (this.onBlur = null);
  }
  onToggle(t) {
    this.enabled && (document.hidden ? this.onBlur(t) : this.onFocus(t));
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(t) {
    (this._enabled = t),
      document.removeEventListener(
        'visibilitychange',
        this.onToggle.bind(this),
        !1
      ),
      window.removeEventListener('blur', this.onBlur),
      window.removeEventListener('focus', this.onFocus),
      window.removeEventListener('pagehide', this.onBlur),
      window.removeEventListener('pageshow', this.onFocus),
      window.removeEventListener('visibilitychange', this.onToggle.bind(this)),
      this._enabled &&
        (document.addEventListener(
          'visibilitychange',
          this.onToggle.bind(this),
          !1
        ),
        window.addEventListener('blur', this.onBlur),
        window.addEventListener('focus', this.onFocus),
        window.addEventListener('pagehide', this.onBlur),
        window.addEventListener('pageshow', this.onFocus),
        window.addEventListener(
          'visibilitychange',
          this.onToggle.bind(this),
          !1
        ));
  }
}
class BasePlugin {
  constructor(t = 0) {
    this.priority = t;
  }
  open() {}
  opened() {}
  close() {}
  closed() {}
  teardown() {}
  get client() {
    return Container.client;
  }
}
let WEB_STORAGE_SUPPORT = (() => {
    if ('undefined' == typeof Storage) return !1;
    try {
      return (
        localStorage.setItem('LS_TEST', 'test'),
        localStorage.removeItem('LS_TEST'),
        !0
      );
    } catch (t) {
      return !1;
    }
  })(),
  ERASE_COOKIE = !1;
class SavedData {
  static get WEB_STORAGE_SUPPORT() {
    return WEB_STORAGE_SUPPORT;
  }
  static disableWebStorage() {
    WEB_STORAGE_SUPPORT = !1;
  }
  static get ERASE_COOKIE() {
    return ERASE_COOKIE;
  }
  static set ERASE_COOKIE(t) {
    ERASE_COOKIE = t;
  }
  static remove(t) {
    this.WEB_STORAGE_SUPPORT
      ? (localStorage.removeItem(t), sessionStorage.removeItem(t))
      : SavedData.write(t, '', this.ERASE_COOKIE);
  }
  static write(t, e, s = !1) {
    if (this.WEB_STORAGE_SUPPORT)
      return void (s
        ? sessionStorage.setItem(t, JSON.stringify(e))
        : localStorage.setItem(t, JSON.stringify(e)));
    const i = s
      ? s !== this.ERASE_COOKIE
        ? ''
        : '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      : '; expires=' + new Date(2147483646e3).toUTCString();
    document.cookie = t + '=' + escape(JSON.stringify(e)) + i + '; path=/';
  }
  static read(t) {
    if (!this.WEB_STORAGE_SUPPORT) {
      const e = `${t}=`,
        s = document.cookie.split(';');
      for (let t = 0, i = s.length; t < i; t++) {
        let i = s[t];
        for (; ' ' == i.charAt(0); ) i = i.substring(1, i.length);
        if (0 === i.indexOf(e))
          return JSON.parse(unescape(i.substring(e.length, i.length)));
      }
      return null;
    }
    const e = localStorage.getItem(t) || sessionStorage.getItem(t);
    return JSON.parse(e) || null;
  }
}
class ButtonPlugin extends BasePlugin {
  constructor(t = 100) {
    super(t), (this.sendMutes = !1);
  }
  setup() {
    this.sendMutes = !0;
  }
  teardown() {
    this.reset();
  }
  _disableButton(t) {
    t instanceof HTMLElement &&
      (t.classList.remove('enabled'), t.classList.add('disabled'));
  }
  reset() {
    this.sendMutes = !1;
  }
  _setMuteProp(t, e, s) {
    Array.isArray(e)
      ? e.forEach(t => this.removeListeners(t))
      : this.removeListeners(e),
      SavedData.write(t, s),
      this.client.send(t, s);
  }
  removeListeners(t) {
    t instanceof HTMLElement &&
      (t.classList.remove('unmuted'),
      t.classList.remove('muted'),
      t.classList.add(this.sendMutes ? 'muted' : 'unmuted'));
  }
}
const CAPTIONS_STYLES = 'captionsStyles',
  CAPTIONS_MUTED = 'captionsMuted',
  DEFAULT_CAPTIONS_STYLES = {
    size: 'md',
    background: 'black-semi',
    color: 'white',
    edge: 'none',
    font: 'arial',
    align: 'top'
  };
class CaptionsPlugin extends ButtonPlugin {
  constructor({ options: { captionsButton: t } }) {
    super(70),
      (this.captionsStyles = Object.assign(
        {},
        DEFAULT_CAPTIONS_STYLES,
        SavedData.read(CAPTIONS_STYLES) || {}
      )),
      (this.captionsButton = document.querySelector(t)),
      this.client.on('features', function(t) {
        this.captionsButton.style.display = t.captions
          ? 'inline-block'
          : 'none';
      }),
      this.captionsButton.addEventListener(
        'click',
        this.captionsButtonClick.bind(this)
      ),
      null === SavedData.read(CAPTIONS_MUTED) && (this.captionsMuted = !0);
  }
  captionsButtonClick() {
    this.captionsMuted = !this.captionsMuted;
  }
  clearCaptionsStyles() {
    (this.captionsStyles = Object.assign({}, DEFAULT_CAPTIONS_STYLES)),
      this.setCaptionsStyles();
  }
  getCaptionsStyles(t) {
    return t ? this.captionsStyles[t] : this.captionsStyles;
  }
  setCaptionsStyles(t = DEFAULT_CAPTIONS_STYLES, e = '') {
    'object' == typeof t
      ? Object.assign(this.captionsStyles, t)
      : 'string' == typeof t && (this.captionsStyles[t] = e),
      SavedData.write(CAPTIONS_STYLES, this.captionsStyles),
      this.client && this.client.send(CAPTIONS_STYLES, this.captionsStyles);
  }
  opened() {
    null !== this.captionsButton &&
      (this.captionsButton.classList.remove('disabled'),
      (this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED)),
      this.setCaptionsStyles(SavedData.read(CAPTIONS_STYLES)));
  }
  teardown() {
    null !== this.captionsButton &&
      this.captionsButton.removeEventListener(
        'click',
        this.captionsButtonClick.bind(this)
      );
  }
  close() {
    null !== this.captionsButton && super._disableButton(this.captionsButton);
  }
}
class FeaturesPlugin extends BasePlugin {
  constructor() {
    super(90);
  }
  onFeatures() {}
  open() {
    this.client.on('features', this.onFeatures.bind(this));
  }
  close() {
    this.client.off('features', this.onFeatures.bind(this));
  }
}
class FocusPlugin extends BasePlugin {
  constructor({ options: t, dom: e }) {
    super(90),
      (this.options = Object.assign(
        { pauseFocusSelector: '.pause-on-focus' },
        t
      )),
      (this.dom = e),
      (this._appBlurred = !1),
      (this._keepFocus = !1),
      (this._containerBlurred = !1),
      (this._focusTimer = null),
      (this._isManualPause = !1),
      (this.paused = !1),
      (this.manageFocus = this.manageFocus.bind(this)),
      (this.onKeepFocus = this.onKeepFocus.bind(this)),
      (this.pageVisibility = new PageVisibility(
        this.onContainerFocus.bind(this),
        this.onContainerBlur.bind(this)
      )),
      document.addEventListener('focus', this.onDocClick.bind(this)),
      document.addEventListener('click', this.onDocClick.bind(this)),
      (this.pauseFocus = document.querySelector(
        this.options.pauseFocusSelector
      )),
      null !== this.pauseFocus &&
        this.pauseFocus.addEventListener('focus', this.onPauseFocus.bind(this));
  }
  onPauseFocus() {
    (this._isManualPause = this.paused = !0),
      this.pauseFocus.addEventListener(
        'blur',
        function() {
          (this._isManualPause = this.paused = !1), this.focus();
        }.bind(this),
        { once: !0 }
      );
  }
  focus() {
    this.dom.contentWindow && this.dom.contentWindow.focus();
  }
  blur() {
    this.dom.contentWindow && this.dom.contentWindow.blur();
  }
  manageFocus() {
    this._keepFocus && this.blur(),
      this._focusTimer && clearTimeout(this._focusTimer),
      (this._focusTimer = setTimeout(
        function() {
          (this._focusTimer = null),
            this._isManualPause ||
              ((this.paused = this._containerBlurred && this._appBlurred),
              this._keepFocus &&
                !this._containerBlurred &&
                this._appBlurred &&
                this.focus());
        }.bind(this),
        100
      ));
  }
  onDocClick() {
    this.focus();
  }
  onKeepFocus(t) {
    (this._keepFocus = !!t.data), this.manageFocus();
  }
  onFocus(t) {
    (this._appBlurred = !t.data), this.manageFocus();
  }
  onContainerFocus() {
    (this._containerBlurred = !1), this.manageFocus();
  }
  onContainerBlur() {
    (this._containerBlurred = this._appBlurred = !0), this.manageFocus();
  }
  open() {
    this.client.on('focus', this.onFocus.bind(this)),
      this.client.on('keepFocus', this.onKeepFocus.bind(this));
  }
  opened() {
    this.focus();
  }
  close() {
    this._focusTimer && clearTimeout(this._focusTimer);
  }
  teardown() {
    null !== this.pauseFocus &&
      this.pauseFocus.removeEventListener(
        'focus',
        this.onPauseFocus.bind(this)
      ),
      document.removeEventListener('focus', this.onDocClick.bind(this)),
      document.removeEventListener('click', this.onDocClick.bind(this)),
      this.pageVisibility && this.pageVisibility.destroy();
  }
}
class HelpPlugin extends ButtonPlugin {
  constructor({ options: { helpButton: t } }) {
    super(50),
      (this.helpButton = document.querySelector(t)),
      (this.paused = !1),
      (this._helpEnabled = !1),
      this.helpButton instanceof HTMLElement &&
        (this.helpButton.addEventListener(
          'click',
          this.helpButtonClick.bind(this)
        ),
        this.client.on(
          'pause',
          function(t) {
            t && !this.helpButton.classList.contains('disabled')
              ? (this.helpButton.setAttribute('data-paused', !0),
                (this.helpEnabled = !1))
              : this.helpButton.getAttribute('data-paused') &&
                (this.helpButton.setAttribute('data-paused', ''),
                (this.helpEnabled = !0));
          }.bind(this)
        ),
        this.client.on(
          'features',
          function(t) {
            (this.helpButton.styles.display = t.hints
              ? 'inline-block'
              : 'none'),
              (this.helpButton.style.display = 'none');
          }.bind(this)
        ));
  }
  helpButtonClick() {
    this.paused ||
      this.helpButton.classList.contains('disabled') ||
      this.client.send('playHelp');
  }
  teardown() {
    this.helpButton.removeEventListener(
      'click',
      this.helpButtonClick.bind(this)
    );
  }
  close() {
    this.client.off('helpEnabled'), (this.helpEnabled = !1);
  }
  open() {
    this.client.on(
      'helpEnabled',
      function(t) {
        this.helpEnabled = !!t.data;
      }.bind(this)
    );
  }
  get helpEnabled() {
    return this._helpEnabled;
  }
  set helpEnabled(t) {
    (this._helpEnabled = t),
      this.helpButton.classList.remove('disabled'),
      this.helpButton.classList.remove('enabled'),
      this.helpButton.classList.add(t ? 'enabled' : 'disabled'),
      this.client.trigger('helpEnabled');
  }
}
class PausePlugin extends ButtonPlugin {
  constructor({ options: { pauseButton: t } }) {
    if (
      (super(80),
      (this.pauseButton = document.querySelectorAll(t)),
      1 > this.pauseButton.length)
    )
      return;
    const e = this.onPauseToggle.bind(this);
    this.pauseButton.forEach(t => t.addEventListener('click', e)),
      (this._isManualPause = !1),
      (this._disablePause = !1),
      (this._paused = !1),
      this.client.on(
        'features',
        function(t) {
          t.disablePause && (this._disablePause = !0);
        }.bind(this)
      );
  }
  onPauseToggle() {
    (this.pause = !this._paused), (this._isManualPause = this.paused);
  }
  opened() {
    this.pauseButton.forEach(t => t.classList.remove('disabled')),
      (this.pause = this._paused);
  }
  close() {
    this.pauseButton.forEach(t => this._disableButton.bind(t)),
      (this.paused = !1);
  }
  teardown() {
    const t = this.onPauseToggle.bind(this);
    this.pauseButton.forEach(e => e.removeEventListener('click', t));
  }
  set pause(t) {
    (t = !!t),
      this._disablePause ||
        ((this._paused = t),
        this.client.send('pause', t),
        this.client.trigger(t ? 'paused' : 'resumed'),
        this.pauseButton.forEach(e => {
          e.classList.remove('unpaused'),
            e.classList.remove('paused'),
            e.classList.add(t ? 'paused' : 'unpaused');
        }));
  }
  get pause() {
    return this._paused;
  }
}
class SoundPlugin extends ButtonPlugin {
  constructor({
    options: {
      soundButton: t,
      musicButton: e,
      sfxButton: s,
      voButton: i,
      soundSlider: n,
      musicSlider: o,
      sfxSlider: r,
      voSlider: a
    }
  }) {
    super(60);
    const u = SavedData.read('soundMuted');
    (this._soundMuted = u || !1),
      (this._musicMuted = !1),
      (this._voMuted = !1),
      (this._sfxMuted = !1),
      (this.soundVolume = 0),
      (this.musicVolume = 0),
      (this.sfxVolume = 0),
      (this.voVolume = 0),
      (this.soundSlider = this.sliderSetup(document.querySelector(n), n)),
      (this.musicSlider = this.sliderSetup(document.querySelector(o), o)),
      (this.sfxSlider = this.sliderSetup(document.querySelector(r), r)),
      (this.voSlider = this.sliderSetup(document.querySelector(a), a)),
      (this.soundButton = document.querySelector(t)),
      (this.musicButton = document.querySelector(e)),
      (this.sfxButton = document.querySelector(s)),
      (this.voButton = document.querySelector(i)),
      this.soundButton &&
        this.soundButton.addEventListener(
          'click',
          this.onSoundToggle.bind(this)
        ),
      this.musicButton &&
        this.musicButton.addEventListener(
          'click',
          this.onMusicToggle.bind(this)
        ),
      this.sfxButton &&
        this.sfxButton.addEventListener('click', this.onSFXToggle.bind(this)),
      this.voButton &&
        this.voButton.addEventListener('click', this.onVOToggle.bind(this)),
      this.soundSlider &&
        this.soundSlider.addEventListener(
          'change',
          this.onSoundVolumeChange.bind(this)
        ),
      this.musicSlider &&
        this.musicSlider.addEventListener(
          'change',
          this.onMusicVolumeChange.bind(this)
        ),
      this.sfxSlider &&
        this.sfxSlider.addEventListener(
          'change',
          this.onSfxVolumeChange.bind(this)
        ),
      this.voSlider &&
        this.voSlider.addEventListener(
          'change',
          this.onVoVolumeChange.bind(this)
        ),
      this.client.on(
        'features',
        function(t) {
          (this.voButton.style.display =
            t.vo && this.voButton ? 'inline-block' : 'none'),
            (this.musicButton.style.display =
              t.music && this.musicButton ? 'inline-block' : 'none'),
            (this.soundButton.style.display =
              t.sound && this.soundButton ? 'inline-block' : 'none'),
            (this.sfxButton.style.display =
              t.sfxButton && this.sfxButton ? 'inline-block' : 'none');
        }.bind(this)
      );
  }
  onSoundVolumeChange() {
    (this.sfxVolume = this.voVolume = this.musicVolume = this.soundVolume = Number(
      this.soundSlider.value
    )),
      (this.soundMuted = !this.soundVolume),
      this._checkSoundMute();
  }
  onMusicVolumeChange() {
    (this.musicVolume = Number(this.musicSlider.value)),
      (this.musicMuted = !this.musicVolume),
      this._checkSoundMute();
  }
  onVoVolumeChange() {
    (this.voVolume = Number(this.voSlider.value)),
      (this.voMuted = !this.voVolume),
      this._checkSoundMute();
  }
  onSfxVolumeChange() {
    (this.sfxVolume = Number(this.sfxSlider.value)),
      (this.sfxMuted = !this.sfxVolume),
      this._checkSoundMute();
  }
  onSoundToggle() {
    const t = !this.soundMuted;
    (this.soundMuted = t),
      (this.musicMuted = t),
      (this.voMuted = t),
      (this.sfxMuted = t);
  }
  onMusicToggle() {
    (this.musicMuted = !this.musicMuted), this._checkSoundMute();
  }
  onVOToggle() {
    (this.voMuted = !this.voMuted), this._checkSoundMute();
  }
  onSFXToggle() {
    (this.sfxMuted = !this.sfxMuted), this._checkSoundMute();
  }
  _checkSoundMute() {
    this.soundMuted = this.sfxMuted && this.voMuted && this.musicMuted;
  }
  setMuteProp(t, e, s) {
    (this[t] = e), this._setMuteProp(t, s, e);
  }
  opened() {
    null !== this.soundButton && this.soundButton.classList.remove('disabled'),
      null !== this.sfxButton && this.sfxButton.classList.remove('disabled'),
      null !== this.voButton && this.voButton.classList.remove('disabled'),
      null !== this.musicButton &&
        this.musicButton.classList.remove('disabled'),
      (this.soundMuted = !!SavedData.read('soundMuted')),
      (this.musicMuted = !!SavedData.read('musicMuted')),
      (this.sfxMuted = !!SavedData.read('sfxMuted')),
      (this.voMuted = !!SavedData.read('voMuted'));
  }
  close() {
    this._disableButton(this.soundButton),
      this._disableButton(this.voButton),
      this._disableButton(this.sfxButton),
      this._disableButton(this.musicButton);
  }
  teardown() {
    null !== this.soundButton &&
      this.soundButton.removeEventListener(
        'click',
        this.onSoundToggle.bind(this)
      ),
      null !== this.musicButton &&
        this.musicButton.removeEventListener(
          'click',
          this.onMusicToggle.bind(this)
        ),
      null !== this.sfxButton &&
        this.sfxButton.removeEventListener(
          'click',
          this.onSFXToggle.bind(this)
        ),
      null !== this.voButton &&
        this.voButton.removeEventListener('click', this.onVOToggle.bind(this));
  }
  sliderSetup(t, e) {
    return 'range' !== t.type
      ? (console.warn(
          `SpringRoll Container: Sound plugin was passed a invalid input of ${e}. Input must be of type range`
        ),
        null)
      : ((t.min = '0'), (t.max = '1'), (t.step = '0.1'), t);
  }
  set soundMuted(t) {
    this.setMuteProp('_soundMuted', t, this.soundButton);
  }
  get soundMuted() {
    return this._soundMuted;
  }
  set voMuted(t) {
    this.setMuteProp('_voMuted', t, this.voButton);
  }
  get voMuted() {
    return this._voMuted;
  }
  set musicMuted(t) {
    this.setMuteProp('_musicMuted', t, this.musicButton);
  }
  get musicMuted() {
    return this._musicMuted;
  }
  set sfxMuted(t) {
    this.setMuteProp('_sfxMuted', t, this.sfxButton);
  }
  get sfxMuted() {
    return this._sfxMuted;
  }
}
class SavedDataHandler {
  static remove(t, e) {
    SavedData.remove(t), e();
  }
  static write(t, e, s) {
    SavedData.write(t, e), s();
  }
  static read(t, e) {
    e(SavedData.read(t));
  }
}
class UserDataPlugin extends BasePlugin {
  constructor() {
    super(40);
  }
  open() {
    this.client.on('userDataRemove', this.onUserDataRemove.bind(this)),
      this.client.on('userDataRead', this.onUserDataRead.bind(this)),
      this.client.on('userDataWrite', this.onUserDataWrite.bind(this));
  }
  onUserDataRemove({ data: t, type: e }) {
    SavedDataHandler.remove(t, () => {
      this.client.send(e);
    });
  }
  onUserDataRead({ data: t, type: e }) {
    SavedDataHandler.read(t, t => this.client.send(e, t));
  }
  onUserDataWrite({ data: { name: t, value: e, type: s } }) {
    SavedDataHandler.write(t, e, () => this.client.send(s));
  }
}
export {
  Container,
  Features,
  PageVisibility,
  BasePlugin,
  ButtonPlugin,
  CaptionsPlugin,
  FeaturesPlugin,
  FocusPlugin,
  HelpPlugin,
  PausePlugin,
  SoundPlugin,
  UserDataPlugin,
  SavedData,
  SavedDataHandler
};
