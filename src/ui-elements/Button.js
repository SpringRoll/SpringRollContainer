/**
 * @export
 * @class Button
 */
export class Button {
  /**
   *Creates an instance of Button
   * @param {object} params
   * @param {string | HTMLElement} params.button the button itself or a selector string
   * @param {Function} params.onClick the function to call when the button is clicked
   * @param {string} channel the feature this button controls
   * @memberof ButtonPlugin
   */
  constructor({ button, onClick, channel }) {
    this.button =
      button instanceof HTMLElement ? button : document.querySelector(button);
    this.onClick = onClick;
    this.channel = channel;

    if (this.button) {
      this.button.addEventListener('click', onClick);
    }
  }

  /**
   * enables display of the button if it is present in the features list
   * @memberof Button
   * @param {object} data Object containing which features are enabled
   */
  displayButton(data) {
    if (!(this.button instanceof HTMLElement)) {
      return;
    }

    this.button.style.display =
      data[this.channel] || this.channel === 'pause' ? '' : 'none';
  }

  /**
   * enables display of the button
   * @memberof Button
   */
  enableButton() {
    if (!this.button) {
      return;
    }
    this.button.classList.remove('disabled');
  }
}
