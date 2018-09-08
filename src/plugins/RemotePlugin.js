import { BasePlugin } from './BasePlugin';
import { Features } from '../Features';

export class RemotePlugin extends BasePlugin {
  constructor({ bellhop }) {
    super(30);
    this.options = {
      query: '',
      playOptions: null,
      singlePlay: false
    };
    this.client = bellhop;
    this.release = null;
  }

  openRemote(api, { query = '', singlePlay = false } = {}, playOptions = null) {
    this.options = Object.assign(this.options, {
      query,
      singlePlay,
      playOptions
    });

    this.release = null;

    fetch(api).then(response => {
      if (200 !== response.status) {
        return;
      }
      response.json().then(release => {
        const error = Features.test(release);
        if (error) {
          return this.client.trigger('unsupported', error);
        }

        this.release = release;
        this._internalOpen(release.url + options.query, options);
      });
    });
  }

  teardown() {
    this.release = null;
  }
}
