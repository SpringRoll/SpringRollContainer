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
   * @memberof FeaturesPlugin
   */
  constructor() {
    super(90);
  }

  /**
   * The features supported by the application
   * @event features
   */
  onFeatures() {
    //TODO: remove as no longer needed?
    // this.client.trigger('features');
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
