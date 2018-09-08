class BellhopEventDispatcher {
  constructor() {
    this._listeners = {};
  }
  on(t, e, i = 0) {
    this._listeners[t] || (this._listeners[t] = []),
      (e._priority = parseInt(i) || 0),
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
    const i = this._listeners[t].indexOf(e);
    -1 < i && this._listeners[t].splice(i, 1);
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
      const { type: e, data: i } = this._sendLater[t];
      this.send(e, i);
    }
    this._sendLater.length = 0;
  }
  connect(t, e = '*') {
    this.connecting ||
      (this.disconnect(),
      (this.connecting = !0),
      t instanceof HTMLIFrameElement && (this.iframe = t),
      (this.isChild = void 0 === t),
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
    const i = { type: t, data: e };
    this.connecting
      ? this._sendLater.push(i)
      : this.target.postMessage(i, this.origin);
  }
  fetch(t, e, i = {}, s = !1) {
    if (!this.connecting && !this.connected)
      throw 'No connection, please call connect() first';
    const n = t => {
      s && this.off(t.type, n), e(t);
    };
    this.on(t, n), this.send(t, i);
  }
  respond(t, e = {}, i = !1) {
    const s = n => {
      i && this.off(n.type, s), this.send(t, e);
    };
    this.on(t, s);
  }
  destroy() {
    super.destroy(), this.disconnect(), (this._sendLater.length = 0);
  }
  get target() {
    return this.isChild ? window.parent : this.iframe.contentWindow;
  }
}
let PLUGINS = [];
class Container {
  constructor(t, e) {
    if (
      ((this.options = e),
      (this.main = document.querySelector(t)),
      null === this.main)
    )
      throw new Error('No iframe was found with the provided selector');
    (this.dom = this.main),
      (this.client = null),
      (this.release = null),
      (this.loaded = !1),
      (this.loaded = !1),
      (this.loading = !1),
      (this.plugins = []),
      (this.client = new Bellhop()),
      Container.PLUGINS.forEach(t => t.setup.call(this));
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
      Container.PLUGINS.forEach(t => t.opened.call(this)),
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
    t && Container.PLUGINS.forEach(t => t.closed.call(this)),
      this.destroyClient(),
      (this.loaded = !1),
      (this.loading = !1),
      this.main.setAttribute('src', ''),
      this.main.classList.remove('loading'),
      t && this.client.trigger('closed');
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
  _internalOpen(t, { singlePlay: e = !1, playOptions: i = null } = {}) {
    return this.reset(), this.client.trigger('unsupported');
  }
  openPath(t, e = {}, i = {}) {
    'boolean' == typeof e && (e = { singlePlay: !1, playOptions: i }),
      this._internalOpen(t, e);
  }
  destroy() {
    this.reset(),
      Container.PLUGINS.forEach(t => t.teardown.call(this)),
      (this.main = null),
      (this.options = null),
      (this.dom = null);
  }
  close() {
    this.loading || this.loaded
      ? (Container.PLUGINS.forEach(t => t.close.call(this)),
        this.client.trigger('close'),
        this.client.send('close'))
      : this.reset();
  }
  static get VERSION() {
    return '2.0.0';
  }
  static get PLUGINS() {
    return PLUGINS;
  }
  static set PLUGINS(t) {
    Array.isArray(t) && (PLUGINS = t);
  }
}
class PageVisibility {
  constructor(t = function() {}, e = function() {}) {
    (this.onFocus = t),
      (this.onBlur = e),
      (this._enabled = !1),
      (this.enabled = !0);
  }
  destroy() {
    (this.enabled = !1),
      (this.onToggle = null),
      (this.onFocus = null),
      (this.onBlur = null);
  }
  onToggle() {
    document.hidden ? this.onBlur() : this.onFocus();
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(t) {
    (this._enabled = t),
      document.removeEventListener('visibilityChange', this.onToggle, !1),
      window.removeEventListener('blur', this.onBlur),
      window.removeEventListener('focus', this.onFocus),
      window.removeEventListener('pagehide', this.onBlur),
      window.removeEventListener('pageshow', this.onFocus),
      window.removeEventListener('visibilityChange', this.onToggle),
      this._enabled &&
        (document.addEventListener('visibilityChange', this.onToggle, !1),
        window.addEventListener('blur', this.onBlur),
        window.addEventListener('focus', this.onFocus),
        window.addEventListener('pagehide', this.onBlur),
        window.addEventListener('pageshow', this.onFocus),
        window.addEventListener('visibilityChange', this.onToggle, !1));
  }
}
class Features {
  static get flash() {
    const t =
        'undefined' != typeof ActiveXObject &&
        void 0 !== new ActiveXObject('ShockwaveFlash.ShockwaveFlash'),
      e =
        navigator.mimeTypes &&
        void 0 !== navigator.mimeTypes['application/x-shockwave-flash'] &&
        navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin;
    return t || e;
  }
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
  static touch() {
    return !!(
      'ontouchstart' in window ||
      (navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0) ||
      (navigator.pointerEnabled && navigator.maxTouchPoints > 0)
    );
  }
  static basic() {
    return Features.canvas
      ? Features.webAudio || Features.flash
        ? null
        : 'Browser does not support WebAudio or Flash audio'
      : 'Browser does not support canvas';
  }
  static test(t) {
    const e = this.basic();
    if (e) return e;
    const i = t.features,
      s = t.ui,
      n = t.sizes;
    for (const t in i)
      if (void 0 !== Features[t] && i[t] && !Features[t])
        return 'Browser does not support ' + t;
    if (!s.touch && Features.touch) return 'Game does not support touch input';
    if (!s.mouse && !Features.touch) return 'Game does not support mouse input';
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
    return `Browser Feature Detection\n\t\t\t\tFlash support ${
      Features.flash ? '✓' : '×'
    }\n\t\t\t\tCanvas support ${
      Features.canvas ? '✓' : '×'
    }\n\t\t\t\tWebGL support ${
      Features.webgl ? '✓' : '×'
    }\n\t\t\t\tWebAudio support ${Features.webAudio ? '✓' : '×'}`;
  }
}
const WEB_STORAGE_SUPPORT = (() => {
  if ('undefined' == typeof Storage) return !1;
  try {
    localStorage.setItem('LS_TEST', 'test'), localStorage.removeItem('LS_TEST');
  } catch (t) {
    return !1;
  }
})();
let ERASE_COOKIE = !1;
class SavedData {
  static get WEB_STORAGE_SUPPORT() {
    return WEB_STORAGE_SUPPORT;
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
  static write(t, e, i = !1) {
    if (this.WEB_STORAGE_SUPPORT)
      i
        ? sessionStorage.setItem(t, JSON.stringify(e))
        : localStorage.setItem(t, JSON.stringify(e));
    else {
      let s;
      (s = i
        ? i !== this.ERASE_COOKIE
          ? ''
          : '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        : '; expires=' + new Date(2147483646e3).toUTCString()),
        (document.cookie =
          t + '=' + escape(JSON.stringify(e)) + s + '; path=/');
    }
  }
  static read(t) {
    if (!this.WEB_STORAGE_SUPPORT) {
      const e = `${t}=`,
        i = document.cookie.split(';');
      for (let t = 0, s = i.length; t < s; t++) {
        let s = i[t];
        for (; ' ' == s.charAt(0); ) s = s.substring(1, s.length);
        if (0 === s.indexOf(e))
          return JSON.parse(unescape(s.substring(e.length, s.length)));
      }
      return null;
    }
    const e = localStorage.getItem(t) || sessionStorage.getItem(t);
    return JSON.parse(e) || null;
  }
}
class SavedDataHandler {
  static remove(t, e) {
    SavedData.remove(t), e();
  }
  static write(t, e, i) {
    SavedData.write(t, e), i();
  }
  static read(t, e) {
    e(SavedData.read(t));
  }
}
export { Container, PageVisibility, Features, SavedData, SavedDataHandler };
