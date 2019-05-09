import { Button } from './Button';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

const click = done => {
  done();
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
      onClick: click
    });
  });

  it('construct', () => {
    expect(b.button).to.be.instanceof(HTMLElement);
    expect(b).to.be.instanceof(Button);
    b.button.dispatchEvent(initEvent('click'));
  });
});
