import { Container } from '../Container';
export class BasePlugin {
  constructor(priority = 0) {
    this.priority = priority;

    Container.PLUGINS.push(this);
    Container.PLUGINS.sort((a, b) => b.priority - a.priority);
  }
  setup() {}
  open() {}
  opened() {}
  close() {}
  closed() {}
  teardown() {}
}
