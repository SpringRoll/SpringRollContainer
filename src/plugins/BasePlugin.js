/* eslint-disable */
import { Container } from '../Container';
import { SavedData } from '../SavedData';
/**
 *
 *
 * @export
 * @class BasePlugin
 */
export class BasePlugin {
  /**
   *Creates an instance of BasePlugin.
   * @param {string} name
   * @param {Array<String>} [required] The list of required plugins (by name) that this plugin depends on
   * @param {Array<String>} [optional] The list of optional plugins (by name) that this plugin depends on
   * @memberof BasePlugin
   */
  constructor(name, required = [], optional = []) {
    this.name = name;
    this.required = Array.isArray(required) ? required : [];
    this.optional = Array.isArray(optional) ? optional : [];
  }

  /**
   *
   * @param {Container} [container]
   * @memberof BasePlugin
   * @returns {Promise}
   */
  preload(container) {
    return Promise.resolve();
  }

  /**
   *
   * @param {Container} [container]
   * @memberof BasePlugin
   */
  setup(container) {}
  /**
   *
   * @param {Container} [container]
   * @memberof BasePlugin
   */
  open(container) {}

  /**
   *
   * @param {Container} [container]
   * @memberof BasePlugin
   */
  opened(container) {}

  /**
   *
   * @param {Container} [container]
   * @memberof BasePlugin
   */
  close(container) {}

  /**
   *
   * @param {Container} [container]
   * @memberof BasePlugin
   */
  closed(container) {}

  /**
   *
   * @param {Container} [container]
   * @memberof BasePlugin
   */
  teardown(container) {}

  /**
   *
   *
   * @param {string} prop
   * @param {*} value
   * @memberof ButtonPlugin
   */
  sendProperty(prop, value) {
    SavedData.write(prop, value);

    this.client.send(prop, value);
  }

  /**
   *
   *
   * @readonly
   * @memberof BasePlugin
   */
  get client() {
    return Container.client;
  }
}
