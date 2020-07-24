/**
 *
 * @param {string} name
 * @param {string} value
 */
export function makeRadio(name, value) {
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = name;
  radio.value = value;
  return radio;
}

/**
 *
 * @param {string} id
 */
export function makeSlider(id) {
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = id;
  return slider;
}

/**
 *
 * @param {string} id
 */
export function makeButton(id) {
  const button = document.createElement('button');
  button.id = id;
  return button;
}