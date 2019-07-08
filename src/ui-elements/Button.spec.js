import { Button } from './Button';

let clicked = false;

const click = () => {
  clicked = true;
};

describe('Button', () => {
  let bt;

  before(() => {
    document.body.innerHTML = '';

    const button = document.createElement('button');
    button.id = 'button';
    document.body.appendChild(button);

    bt = new Button({
      button: document.querySelector('#button'),
      onClick: click,
      channel: ''
    });
  });

  it('construct', () => {
    expect(bt.button).to.be.instanceof(HTMLElement);

    expect(bt).to.be.instanceof(Button);
  });

  it('fire click', () => {
    bt.button.click();
    expect(clicked).to.be.true;
  });
});
