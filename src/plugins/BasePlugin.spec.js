import { Container, BasePlugin } from '..';

const iframe = document.createElement('iframe');
iframe.id = 'test';
document.body.appendChild(iframe);
let container;
describe('BasePlugin', () => {
  it('constructor()', () => {
    container = new Container('#test', [new BasePlugin('test-plugin')]);
    expect(container.plugins.length).to.equal(1);
    expect(container.plugins[0] instanceof BasePlugin).to.be.true;
  });
});
