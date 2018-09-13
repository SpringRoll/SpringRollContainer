import { Features } from '../Features';
import { BasePlugin } from './BasePlugin';

/**
 *
 *
 * @export
 * @class RemotePlugin
 * @extends {BasePlugin}
 */
export class RemotePlugin extends BasePlugin {
  /**
   *Creates an instance of RemotePlugin.
   * @param {Object} Container
   * @memberof RemotePlugin
   */
  constructor({ client }) {
    super(30);
    this.options = {
      query: '',
      playOptions: null,
      singlePlay: false
    };
    this.client = client;
    this.release = null;
  }

  /**
   * Open application based on an API Call to SpringRoll Connect
   * @param {string} api
   * @param {object} options
   * @param {string} [options.query='']
   * @param {boolean} [options.singlePlay=false]
   * @param {null | object} [playOptions=null]
   * @memberof RemotePlugin
   */
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
        this.client._internalOpen(release.url + query, this.options);
      });
    });
  }

  /**
   * @memberof RemotePlugin
   */
  teardown() {
    this.release = null;
  }
}
