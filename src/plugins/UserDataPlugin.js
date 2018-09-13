import { SavedDataHandler } from '../SavedDataHandler';
import { BasePlugin } from './BasePlugin';

/**
 * @export
 * @class UserDataPlugin
 * @extends {BasePlugin}
 */
export class UserDataPlugin extends BasePlugin {
  /**
   *Creates an instance of UserDataPlugin.
   * @param {*} bellhop
   * @memberof UserDataPlugin
   */
  constructor({ client }) {
    super(40);
    this.client = client;
  }

  /**
   *
   *
   * @memberof UserDataPlugin
   */
  open() {
    this.client.on('userDataRemove', this.onUserDataRemove.bind(this));
    this.client.on('userDataRead', this.onUserDataRead.bind(this));
    this.client.on('userDataWrite', this.onUserDataWrite.bind(this));
  }

  /**
   * Handler for the userDataRemove event
   * @method onUserDataRemove
   * @private
   */
  onUserDataRemove({ data, type }) {
    SavedDataHandler.remove(data, () => this.client.send(type));
  }

  /**
   * Handler for the userDataRead event
   * @method onUserDataRead
   * @private
   */
  onUserDataRead({ data, type }) {
    SavedDataHandler.read(data, value => this.client.send(type, value));
  }

  /**
   * Handler for the userDataWrite event
   * @method onUserDataWrite
   * @private
   */
  onUserDataWrite({ data }) {
    const { name, value, type } = data;
    SavedDataHandler.write(name, value, () => this.client.send(type));
  }
}
