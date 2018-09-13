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
    return `Browser Feature Detection\n\t\t\t\tFlash support ${
      Features.flash ? '✓' : '×'
    }\n\t\t\t\tCanvas support ${
      Features.canvas ? '✓' : '×'
    }\n\t\t\t\tWebGL support ${
      Features.webgl ? '✓' : '×'
    }\n\t\t\t\tWebAudio support ${Features.webAudio ? '✓' : '×'}`;
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
  constructor({ client: t }, e = 100) {
    super(e), (this.sendMutes = !1), (this.client = t);
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
      this.client instanceof Bellhop &&
        this.sendMutes &&
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
  constructor({ client: t, options: { captionButton: e } }) {
    super({ client: t }, 70),
      (this.captionsStyles = Object.assign(
        {},
        DEFAULT_CAPTIONS_STYLES,
        SavedData.read(CAPTIONS_STYLES) || {}
      )),
      (this.captionsButton = document.querySelector(e)),
      t instanceof Bellhop &&
        null !== this.captionsButton &&
        ((this.client = t),
        this.client.on('features', function(t) {
          this.captionsButton.style.display = t.captions
            ? 'inline-block'
            : 'none';
        }),
        this.captionsButton.addEventListener(
          'click',
          this.captionsButtonClick.bind(this)
        ),
        null === SavedData.read(CAPTIONS_MUTED) && (this.captionsMuted = !0));
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
        this.captionsButtonClick
      );
  }
  close() {
    null !== this.captionsButton && super._disableButton(this.captionsButton);
  }
}
class FeaturesPlugin extends BasePlugin {
  constructor({ client: t }) {
    super(90), (this.client = t);
  }
  onFeatures() {
    this.client.trigger('features');
  }
  open() {
    this.client.on('features', this.onFeatures.bind(this));
  }
  close() {
    this.client.off('features', this.onFeatures.bind(this));
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
  onToggle(t) {
    document.hidden ? this.onBlur(t) : this.onFocus(t);
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
      window.removeEventListener('blur', this.onBlur.bind(this)),
      window.removeEventListener('focus', this.onFocus.bind(this)),
      window.removeEventListener('pagehide', this.onBlur.bind(this)),
      window.removeEventListener('pageshow', this.onFocus.bind(this)),
      window.removeEventListener('visibilitychange', this.onToggle.bind(this)),
      this._enabled &&
        (document.addEventListener(
          'visibilitychange',
          this.onToggle.bind(this),
          !1
        ),
        window.addEventListener('blur', this.onBlur.bind(this)),
        window.addEventListener('focus', this.onFocus.bind(this)),
        window.addEventListener('pagehide', this.onBlur.bind(this)),
        window.addEventListener('pageshow', this.onFocus.bind(this)),
        window.addEventListener(
          'visibilitychange',
          this.onToggle.bind(this),
          !1
        ));
  }
}
class FocusPlugin extends BasePlugin {
  constructor({ options: t, dom: e, client: s }) {
    super(90),
      (this.options = Object.assign(
        { pauseFocusSelector: '.pause-on-focus' },
        t
      )),
      (this.pageVisibility = new PageVisibility(
        this.onContainerFocus.bind(this),
        this.onContainerBlur.bind(this)
      )),
      (this.dom = e),
      (this.client = s),
      (this._appBlurred = !1),
      (this._keepFocus = !1),
      (this._containerBlurred = !1),
      (this._focusTimer = null),
      (this._isManualPause = !1),
      (this.paused = !1),
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
    this.dom.contentWindow.focus();
  }
  blur() {
    this.dom.contentWindow.blur();
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
  constructor({ options: { helpButton: t }, client: e }) {
    super(50),
      (this.helpButton = document.querySelector(t)),
      (this.client = e),
      (this.paused = !1),
      (this._helpEnabled = !1),
      this.helpButton instanceof HTMLElement &&
        (this.helpButton.addEventListener('click', this.helpButtonClick),
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
      this.client.trigger('helpEnabled', t);
  }
}
class PausePlugin extends ButtonPlugin {
  constructor({ options: { pauseButton: t }, client: e }) {
    if (
      (super(80),
      (this.pauseButton = document.querySelectorAll(t)),
      1 > this.pauseButton.length)
    )
      return;
    const s = this.onPauseToggle.bind(this);
    this.pauseButton.forEach(t => t.addEventListener('click', s)),
      (this._isManualPause = !1),
      (this._disablePause = !1),
      (this._paused = !1),
      (this.client = e),
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
        this.client.trigger('pause', t),
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
class RemotePlugin extends BasePlugin {
  constructor({ client: t }) {
    super(30),
      (this.options = { query: '', playOptions: null, singlePlay: !1 }),
      (this.client = t),
      (this.release = null);
  }
  openRemote(t, { query: e = '', singlePlay: s = !1 } = {}, i = null) {
    (this.options = Object.assign(this.options, {
      query: e,
      singlePlay: s,
      playOptions: i
    })),
      (this.release = null),
      fetch(t).then(t => {
        200 === t.status &&
          t.json().then(t => {
            const s = Features.test(t);
            if (s) return this.client.trigger('unsupported', s);
            (this.release = t),
              this.client._internalOpen(t.url + e, this.options);
          });
      });
  }
  teardown() {
    this.release = null;
  }
}
class SoundPlugin extends ButtonPlugin {
  constructor({
    options: { soundButton: t, musicButton: e, sfxButton: s, voButton: i },
    client: n
  }) {
    super(60);
    const o = SavedData.read('soundMuted');
    (this._soundMuted = o || !1),
      (this._musicMuted = !1),
      (this._voMuted = !1),
      (this._sfxMuted = !1),
      (this.client = n),
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
  constructor({ client: t }) {
    super(40), (this.client = t);
  }
  open() {
    this.client.on('userDataRemove', this.onUserDataRemove.bind(this)),
      this.client.on('userDataRead', this.onUserDataRead.bind(this)),
      this.client.on('userDataWrite', this.onUserDataWrite.bind(this));
  }
  onUserDataRemove({ data: t, type: e }) {
    SavedDataHandler.remove(t, () => this.client.send(e));
  }
  onUserDataRead({ data: t, type: e }) {
    SavedDataHandler.read(t, t => this.client.send(e, t));
  }
  onUserDataWrite({ data: t }) {
    const e = t.name,
      s = t.value,
      i = t.type;
    SavedDataHandler.write(e, s, () => this.client.send(i));
  }
}
const PLUGINS = [];
class Container {
  constructor(t, e = {}) {
    if (((this.main = document.querySelector(t)), null === this.main))
      throw new Error('No iframe was found with the provided selector');
    (this.client = new Bellhop()),
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
    if ((this.reset(), Features.basic()))
      return this.client.trigger('unsupported');
    (this.loading = !0),
      this.initClient(),
      this.plugins.forEach(t => t.open(this));
    let n = t;
    if (null !== i.playOptions) {
      const e =
        'playOptions=' + encodeURIComponent(JSON.stringify(i.playOptions));
      n = -1 === t.indexOf('?') ? `${t}?${e}` : `${t}&${e}`;
    }
    this.main.classList.add('loading'),
      this.main.setAttribute('src', n),
      this.client.respond('singlePlay', i.singlePlay),
      this.client.respond('playOptions', i.playOptions),
      this.client.trigger('open');
  }
  openPath(t, e = {}, s = {}) {
    'boolean' == typeof e && (e = { singlePlay: !1, playOptions: s }),
      this._internalOpen(t, e);
  }
  destroy() {
    this.reset(),
      this.plugins
        .slice()
        .reverse()
        .forEach(t => t.teardown(this)),
      (this.main = null),
      (this.options = null),
      (this.dom = null);
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
  static uses(t = BasePlugin) {
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
}
export {
  Container,
  PageVisibility,
  Features,
  SavedData,
  SavedDataHandler,
  BasePlugin,
  ButtonPlugin,
  CaptionsPlugin,
  FeaturesPlugin,
  FocusPlugin,
  HelpPlugin,
  PausePlugin,
  RemotePlugin,
  SoundPlugin,
  UserDataPlugin
};
