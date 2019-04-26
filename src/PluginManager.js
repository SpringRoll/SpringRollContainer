import { Bellhop } from 'bellhop-iframe';
// eslint-disable-next-line no-unused-vars
import { BasePlugin } from './plugins';

/**
 *
 *
 * @export
 * @class PluginManager
 */
export default class PluginManager {
  /**
   *Creates an instance of PluginManager.
   * @memberof PluginManager
   */
  constructor() {
    this.client = new Bellhop();
    this.plugins = [];
  }

  /**
   *
   *
   * @returns
   * @memberof PluginManager
   */
  setupPlugins() {
    const preloads = [];
    for (let i = 0, l = this.plugins.length; i < l; i++) {
      if (!this.plugins[i].preload) {
        return;
      }

      preloads.push(
        this.plugins[i].preload(this).catch(function preloadFail(error) {
          this.plugins[i].preloadFailed = true;
          console.warn(this.plugins[i].name, 'Preload Failed:', error);
        })
      );
    }

    // ~wait for all preloads to resolve
    return Promise.all(preloads).then(() => {
      // Remove plugins that fail to load.
      this.plugins = this.plugins.filter(
        plugin => plugin.preloadFailed !== true
      );

      //init
      this.plugins.forEach(plugin => {
        if (!plugin.init) {
          return;
        }

        plugin.init(this);
      });

      //start
      this.plugins.forEach(plugin => {
        if (!plugin.start) {
          return;
        }

        plugin.start(this);
      });
    });
  }

  /**
   * Registers a plugin to be used by PluginManagers, sorting it by priority order.
   * @param {BasePlugin} plugin The plugin to register.
   */
  uses(plugin) {
    this.plugins.push(plugin);
  }

  /**
   * Finds a plugin by name.
   * @param {string} name The name of the plugin.
   * @returns {BasePlugin}
   */
  getPlugin(name) {
    return this.plugins.find(function(plugin) {
      return plugin.name === name;
    });
  }
}
