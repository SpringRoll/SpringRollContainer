/* eslint-disable no-unused-vars */
import { SavedData } from '../SavedData';
import { Container } from '../Container';

/**
 *
 *
 * @export
 * @class BasePlugin
 * @property {Bellhop} client
 * @property {string} name
 */
export class BasePlugin {
  /**
   *Creates an instance of BasePlugin.
   * @param {string} name
   * @memberof BasePlugin
   */
  constructor(name) {
    this.name = name;
    this.client = null;
  }

  /**
   *
   * @param {Container} [container]
   * @memberof BasePlugin
   * @returns {Promise}
   */
  async preload({ client }) {
    this.client = client;
  }

  /**
   *
   * @memberof BasePlugin
   */
  start() {
    this.client.on('loaded', this.sendAllProperties);
    this.client.on('loadDone', this.sendAllProperties);
  }

  /**
   *
   * @param {Container} [_]
   * @memberof BasePlugin
   */
  init(_) { }

  /**
   *
   *
   * @param {string} prop
   * @param {any} value
   * @param {Boolean} disableSend
   * @memberof BasePlugin
   */
  sendProperty(prop, value, disableSend = false) {
    SavedData.write(prop, value);
    if (disableSend) { return; }
    this.client.send(prop, value);
  }


  /**
   *
   * @param {Container} [_]
   * @memberof BasePlugin
   */
  sendAllProperties(_) { }

  /**
   *
   * @param {string} warningText
   * @memberof BasePlugin
   */
  warn(warningText) {
    console.warn(`[SpringRollContainer] ${this.name}: ${warningText}`);
  }
}
