

type ButtonOptions = {
  button: HTMLElement | string,
  onClick: Function,
  channel?: string
};

export class Button {
  constructor(
    ButtonOptions: ButtonOptions
  )
    button: HTMLElement | string;
    onClick: Function
    channel: string

  displayButton(data: object): void;
  enableButton(): void;

}