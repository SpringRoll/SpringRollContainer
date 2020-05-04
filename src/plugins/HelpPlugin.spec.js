import { HelpPlugin } from './HelpPlugin';
import { Bellhop } from 'bellhop-iframe';
let hp;
before(() => {
  document.body.innerHTML = '';

  const buttonOne = document.createElement('button');
  buttonOne.id = 'testOne';
  const buttonTwo = document.createElement('button');
  buttonTwo.id = 'testTwo';

  document.body.appendChild(buttonOne);
  document.body.appendChild(buttonTwo);
  hp = new HelpPlugin('#testOne, #testTwo');
  hp.preload({ client: new Bellhop() });
});
describe('HelpPlugin', () => {
  it('construct', () => {
    expect(hp._helpButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(hp._helpButtons[0].button.style.display).to.equal('');
    expect(hp._helpButtons[0].button.classList.contains('disabled')).to.be.false;

    expect(hp._helpButtons[1].button).to.be.instanceof(HTMLButtonElement);
    expect(hp._helpButtons[1].button.style.display).to.equal('');
    expect(hp._helpButtons[1].button.classList.contains('disabled')).to.be.false;
    expect(hp.client).to.be.instanceof(Bellhop);
  });

  it('should not crash or fail if no controls are passed', () => {
    hp = new HelpPlugin();
    hp.preload({ client: new Bellhop() });
    hp.init();
    hp.client.trigger('features', {});
  });

  it('should work with an HTMLElement as parameter', () => {
    document.body.innerHTML = '';

    const buttonOne = document.createElement('button');
    buttonOne.id = 'testOne';

    document.body.appendChild(buttonOne);
    hp = new HelpPlugin(buttonOne);
    hp.preload({ client: new Bellhop() });
    expect(hp._helpButtons[0].button).to.be.instanceof(HTMLButtonElement);
    expect(hp._helpButtons[0].button.style.display).to.equal('');
    expect(hp._helpButtons[0].button.classList.contains('disabled')).to.be.false;
  });
});
