import { PausePlugin } from './PausePlugin';
import { Bellhop } from 'bellhop-iframe';

const sleep = (millis) => {
  return new Promise((resolve) => setTimeout(resolve, millis));
};

let pp;
before(() => {
  const button = document.createElement('button');
  document.body.innerHTML = '';
  button.id = 'test';
  document.body.appendChild(button);
  const buttonTwo = document.createElement('button');
  buttonTwo.id = 'testTwo';
  document.body.appendChild(buttonTwo);
  pp = new PausePlugin('#test, #testTwo');
  pp.preload({ client: new Bellhop() });
});
describe('PausePlugin', () => {
  it('construct', () => {
    for (let i = 0, l = pp.pauseButton.length; i < l; i++) {
      expect(pp.pauseButton[i]).to.be.instanceof(HTMLButtonElement);
      expect(pp.pauseButton[i].classList.contains('disabled')).to.be.false;
      expect(pp.pauseButton[i].style.display).to.equal('');
    }
    expect(pp.client).to.be.instanceof(Bellhop);
  });

  it('.pause() - get', () => {
    expect(pp.pause).to.be.a('boolean');
  });

  it('.pause() - set', () => {
    pp.pause = true;
    expect(pp.pause).to.be.true;
  });

  it('.onPauseToggle()', () => {
    expect(pp.pause).to.be.true;
    expect(pp.pauseButton[0].classList.contains('paused')).to.be.true;
    pp.onPauseToggle();
    expect(pp.pause).to.be.false;
    expect(pp.pauseButton[0].classList.contains('unpaused')).to.be.true;
  });

  describe('manageOwnVisibility', () => {
    let disabledPlugin;
    before(() => {
      const button = document.createElement('button');
      document.body.innerHTML = '';
      button.id = 'ignore';
      document.body.appendChild(button);
      disabledPlugin = new PausePlugin('#ignore', false); // disable the focus management of the plugin
      disabledPlugin.preload({ client: new Bellhop() });
    });

    it('should set manageOwnVisibility to false', () => {
      // control
      expect(pp.manageOwnVisibility).to.be.true;

      expect(disabledPlugin.manageOwnVisibility).to.be.false;
    });

    it('should set pageVisibility.enabled to false', () => {
      expect(disabledPlugin.pageVisibility.enabled).to.be.false;
    });

    it('manageFocus() should not change pause state', async () => {
      expect(disabledPlugin.pause).to.be.false;

      disabledPlugin._containerBlurred = true;
      disabledPlugin._appBlurred = true;

      disabledPlugin.manageFocus();
      await sleep(150);
      expect(disabledPlugin.pause).to.be.false;
    });

    it('setting flag to true should re-enable everything', async () => {
      disabledPlugin.manageOwnVisibility = true;

      expect(disabledPlugin.pageVisibility.enabled).to.be.true;
      disabledPlugin._containerBlurred = true;
      disabledPlugin._appBlurred = true;

      disabledPlugin.manageFocus();
      await sleep(150);
      expect(disabledPlugin.pause).to.be.true;
    });


  });

  describe('manageFocus()', () => {
    it('should set pause to false if only app is blurred', async () => {
      pp.onPauseToggle(); //reset the manual pause state which was being set to true for some reason.
      pp._containerBlurred = false;
      pp._appBlurred = true;

      pp.manageFocus();
      await sleep(150);
      expect(pp.pause).to.be.false;
    });

    it('should set pause to false if only container is blurred', async () => {
      pp._containerBlurred = true;
      pp._appBlurred = false;

      pp.manageFocus();
      await sleep(150);
      expect(pp.pause).to.be.false;
    });

    it('should set pause to true if app and container are blurred', async () => {
      pp._containerBlurred = true;
      pp._appBlurred = true;

      pp.manageFocus();
      await sleep(150);
      expect(pp.pause).to.be.true;
    });

    it('should not change the pause state if the app was manually paused', async () => {
      pp._appBlurred = false;
      pp.manageFocus();
      await sleep(150);
      expect(pp.pause).to.be.false;

      pp.onPauseToggle();
      expect(pp.pause).to.be.true;

      //when app and container are both blurred the pause state should be set to true, ignored if the pause state is already true via manual pause
      pp._appBlurred = true;
      pp._containerBlurred = true;

      pp.manageFocus();
      await sleep(150);
      expect(pp.pause).to.be.true;

      //if the app is not blurred it would set pause to false unless the app was paused manually
      pp._appBlurred = false;
      pp.manageFocus();
      await sleep(150);
      expect(pp.pause).to.be.true;
    });
  });
});
