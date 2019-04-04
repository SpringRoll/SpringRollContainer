/* eslint-disable no-unused-vars */
import { SavedData } from '../SavedData';
import { Container } from '../Container';

/**
 *
 *
 * @export
 * @class BasePlugin
 * @property {Bellhop} client
 */
export class BasePlugin {
  /**
   *Creates an instance of BasePlugin.
   * @param {string} name
   * @memberof BasePlugin
   */
  constructor(name) {
    this.name = name;
  }

  /**
   *
   * @param {{client: Bellhop}} [container]
   * @memberof BasePlugin
   * @returns {Promise}
   */
  async preload({ client }) {
    this.client = client;
  }

  /**
   *
   * @param {Container} [_]
   * @memberof BasePlugin
   */
  start(_) {}
  /**
   *
   * @param {Container} [_]
   * @memberof BasePlugin
   */
  init(_) {}

  /**
   *
   *
   * @param {string} prop
   * @param {any} value
   * @memberof BasePlugin
   */
  sendProperty(prop, value) {
    SavedData.write(prop, value);
    this.client.send(prop, value);
  }
}
