import { SavedDataHandler } from '../SavedDataHandler';
import { BasePlugin } from './BasePlugin';

export class UserDataPlugin extends BasePlugin {
  constructor(bellhop) {
    super(40);
    this.client = bellhop;
  }

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
  onUserDataRemove(event) {
    SavedDataHandler.remove(event.data, () => this.client.send(event.type));
  }

  /**
   * Handler for the userDataRead event
   * @method onUserDataRead
   * @private
   */
  onUserDataRead(event) {
    SavedDataHandler.read(event.data, value =>
      this.client.send(event.type, value)
    );
  }

  /**
   * Handler for the userDataWrite event
   * @method onUserDataWrite
   * @private
   */
  onUserDataWrite({ data }) {
    SavedDataHandler.write(data.name, data.value, () =>
      this.client.send(event.type)
    );
  }
}
