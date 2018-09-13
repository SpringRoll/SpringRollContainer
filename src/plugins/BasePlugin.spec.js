import { Container } from '../Container';
import { BasePlugin } from './BasePlugin';
Container.clearPlugins();

const iframe = document.createElement('iframe');
iframe.id = 'test';
document.body.appendChild(iframe);
let container;
describe('BasePlugin', () => {
  it('constructor()', () => {
    Container.uses(BasePlugin);
    container = new Container('#test');
    expect(container.plugins.length).to.equal(1);
    expect(container.plugins[0] instanceof BasePlugin).to.be.true;
  });
});
