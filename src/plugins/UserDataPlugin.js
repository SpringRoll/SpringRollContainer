import { SavedDataHandler } from '..';
import { BasePlugin } from '../base-plugins';

/**
 * @export
 * @class UserDataPlugin
 * @extends {BasePlugin}
 */
export class UserDataPlugin extends BasePlugin {
  /**
   *Creates an instance of UserDataPlugin.
   * @memberof UserDataPlugin
   */
  constructor() {
    super('UserData-Plugin');
    this.onUserDataRemove = this.onUserDataRemove.bind(this);
    this.onUserDataRead = this.onUserDataRead.bind(this);
    this.onUserDataWrite = this.onUserDataWrite.bind(this);
  }

  /**
   *
   *
   * @memberof UserDataPlugin
   */
  init() {
    this.client.on('userDataRemove', this.onUserDataRemove);
    this.client.on('userDataRead', this.onUserDataRead);
    this.client.on('userDataWrite', this.onUserDataWrite);
  }

  /**
   * Handler for the userDataRemove event
   * @method onUserDataRemove
   * @private
   */
  onUserDataRemove({ data, type }) {
    SavedDataHandler.remove(data, () => {
      this.client.send(type);
    });
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
  onUserDataWrite({ type, data: { name, value } }) {
    SavedDataHandler.write(name, value, () => this.client.send(type));
  }
}
