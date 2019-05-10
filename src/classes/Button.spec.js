import { Button } from './Button';

let clicked = false;

const click = () => {
  clicked = true;
};

describe('Button', () => {
  let b;

  before(() => {
    document.body.innerHTML = '';

    const button = document.createElement('button');
    button.id = 'button';
    document.body.appendChild(button);

    b = new Button({
      button: document.querySelector('#button'),
      onClick: click,
      channel: ''
    });
  });

  it('construct', () => {
    expect(b.button).to.be.instanceof(HTMLElement);

    expect(b).to.be.instanceof(Button);
  });

  it('fire click', () => {
    b.button.click();
    expect(clicked).to.be.true;
  });
});
