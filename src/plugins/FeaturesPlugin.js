import { BasePlugin } from './BasePlugin';

/**
 *
 * @export
 * @class FeaturesPlugin
 * @extends {BasePlugin}
 */
export class FeaturesPlugin extends BasePlugin {
  /**
   *Creates an instance of FeaturesPlugin.
   * @param {object} Container
   * @memberof FeaturesPlugin
   */
  constructor({ client }) {
    super(90);

    this.client = client;
  }

  /**
   * The features supported by the application
   * @event features
   */
  onFeatures() {
    this.client.trigger('features');
  }

  /**
   * @memberof FeaturesPlugin
   */
  open() {
    this.client.on('features', this.onFeatures.bind(this));
  }

  /**
   * @memberof FeaturesPlugin
   */
  close() {
    this.client.off('features', this.onFeatures.bind(this));
  }
}
