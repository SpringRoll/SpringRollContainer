import { BasePlugin } from './BasePlugin';
/**
 * @class Container
 */

export class FeaturesPlugin extends BasePlugin {
  constructor(bellhop) {
    super(90);

    this.client = bellhop;
  }
  open() {
    this.client.on('features', this.onFeatures.bind(this));
  }

  close() {
    this.client.off('features', this.onFeatures.bind(this));
  }

  onFeatures(event) {
    this.client.trigger('features', event.data);
  }
}
