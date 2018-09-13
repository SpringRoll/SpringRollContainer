import { HelpPlugin } from './HelpPlugin';
import { Bellhop } from 'bellhop-iframe';
let hp;
before(() => {
  const button = document.createElement('button');
  document.body.innerHTML = '';
  button.id = 'test';
  document.body.appendChild(button);
  hp = new HelpPlugin({
    options: { helpButton: '#test' },
    client: new Bellhop()
  });
});
describe('HelpPlugin', () => {
  it('construct', () => {
    expect(hp.helpButton).to.be.instanceof(HTMLButtonElement);
    expect(hp.client).to.be.instanceof(Bellhop);
  });

  it('.open()', () => {
    hp.open();
  });
  it('.close()', () => {
    hp.close();
  });
  it('.tearDown()', () => {
    hp.teardown();
  });
});
