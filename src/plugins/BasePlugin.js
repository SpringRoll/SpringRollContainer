import { Container } from '../Container';
/**
 *
 *
 * @export
 * @class BasePlugin
 */
export class BasePlugin {
  /**
   *Creates an instance of BasePlugin.
   * @param {number} [priority=0]
   * @memberof BasePlugin
   */
  constructor(priority = 0) {
    this.priority = priority;
  }
  /**
   *
   *
   * @memberof BasePlugin
   */
  open() {}

  /**
   *
   *
   * @memberof BasePlugin
   */
  opened() {}

  /**
   *
   *
   * @memberof BasePlugin
   */
  close() {}

  /**
   *
   *
   * @memberof BasePlugin
   */
  closed() {}

  /**
   *
   *
   * @memberof BasePlugin
   */
  teardown() {}

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
