import { Container } from '../index';
import { BasePlugin } from './BasePlugin';



describe('BasePlugin', () => {
  let bp;
  before(() => {
    document.body.innerHTML = '';
    bp = new BasePlugin('test-plugin');
  });

  it('constructor()', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'iframe';
    document.body.appendChild(iframe);

    const container = new Container({
      iframeSelector: '#iframe',
      plugins: [bp]
    });
    expect(container.plugins.length).to.equal(1);
    expect(container.plugins[0] instanceof BasePlugin).to.be.true;
  });
});