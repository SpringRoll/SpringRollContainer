import {
  CaptionsTogglePlugin,
  CaptionsStylePlugin,
  Container,
  ControlSensitivityPlugin,
  HelpPlugin,
  PausePlugin,
  SoundPlugin,
  UserDataPlugin,
  PointerSizePlugin,
  ButtonSizePlugin,
  LayersPlugin,
  HUDPlugin,
  HitAreaScalePlugin,
  DragThresholdScalePlugin,
  HealthPlugin,
  ObjectCountPlugin,
  CompletionPercentagePlugin,
  SpeedScalePlugin,
  TimersScalePlugin,
  InputCountPlugin,
  ColorVisionPlugin,
  KeyboardMapPlugin,
} from '../src';

import { makeRadio, makeSlider, makeButton } from '../TestingUtils';

const initEvent = eventName => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, false, true);
  return event;
};

describe('End to End Test', () => {
  let container;
  const soundButton = makeButton('soundButton');
  const voButton = makeButton('voButton');
  const helpButton = makeButton('helpButton');
  const sfxButton = makeButton('sfxButton');
  const musicButton = makeButton('musicButton');
  const captionsButton = makeButton('captionsButton');
  const pauseButton = makeButton('pauseButton');

  const soundSlider = makeSlider('soundSlider');
  const voSlider = makeSlider('voSlider');
  const sfxSlider = makeSlider('sfxSlider');
  const musicSlider = makeSlider('musicSlider');

  const sensitivitySlider = makeSlider('sensitivitySlider');
  const pointerSlider = makeSlider('pointerSlider');
  const buttonSlider = makeSlider('buttonSlider');
  const layersSlider = makeSlider('layersSlider');

  const hitAreaScaleSlider = makeSlider('hitAreaScaleSlider');
  const dragThresholdScaleSlider = makeSlider('dragThresholdScaleSlider');
  const healthSlider = makeSlider('healthSlider');
  const objectCountSlider = makeSlider('objectCountSlider');
  const completionPercentageSlider = makeSlider('completionPercentageSlider');
  const speedScaleSlider = makeSlider('speedScaleSlider');
  const timersScaleSlider = makeSlider('timersScaleSlider');
  const inputCountSlider = makeSlider('inputCountSlider');

  const colorRadioOne = makeRadio('caption-color', 'default');
  const colorRadioTwo = makeRadio('caption-color', 'inverted');
  const alignRadioOne = makeRadio('caption-align', 'top');
  const alignRadioTwo = makeRadio('caption-align', 'bottom');
  const fontSizeRadioOne = makeRadio('caption-fontSize', 'small');
  const fontSizeRadioTwo = makeRadio('caption-fontSize', 'medium');
  const fontSizeRadioThree = makeRadio('caption-fontSize', 'large');

  const deuteranopia = makeRadio('color-vision-one', 'deuteranopia');
  const tritanopia = makeRadio('color-vision-one', 'tritanopia');
  const protanopia = makeRadio('color-vision-one', 'protanopia');
  const achromatopsia = makeRadio('color-vision-one', 'achromatopsia');
  const none = makeRadio('color-vision-one', 'none');

  const topOne = makeRadio('hud-position-one', 'top');
  const bottomOne = makeRadio('hud-position-one', 'bottom');
  const rightOne = makeRadio('hud-position-one', 'right');
  const leftOne = makeRadio('hud-position-one', 'left');

  const keyContainer = document.createElement('div');
  keyContainer.id = 'keyContainer';

  let keyboardMapPlugin;

  before(() => {

    document.body.append(
      voButton,
      helpButton,
      captionsButton,
      musicButton,
      pauseButton,
      sfxButton,
      soundButton,
      soundSlider,
      voSlider,
      musicSlider,
      sfxSlider,
      sensitivitySlider,
      pointerSlider,
      buttonSlider,
      layersSlider,
      hitAreaScaleSlider,
      dragThresholdScaleSlider,
      healthSlider,
      objectCountSlider,
      completionPercentageSlider,
      speedScaleSlider,
      timersScaleSlider,
      inputCountSlider,
      keyContainer,
      colorRadioOne,
      colorRadioTwo,
      alignRadioOne,
      alignRadioTwo,
      fontSizeRadioOne,
      fontSizeRadioTwo,
      fontSizeRadioThree,
      deuteranopia,
      tritanopia,
      protanopia,
      achromatopsia,
      none,
      topOne,
      bottomOne,
      rightOne,
      leftOne,
    );

    const colorVisionPlugin = new ColorVisionPlugin('input[name=color-vision-one]');
    const captionsTogglePlugin = new CaptionsTogglePlugin('#captionsButton');
    const captionsStylePlugin = new CaptionsStylePlugin('input[name=caption-fontSize]', 'input[name=caption-color]', 'input[name=caption-align]');
    const pausePlugin = new PausePlugin('#pauseButton');

    const soundPlugin = new SoundPlugin({
      voButtons: '#voButton',
      musicButtons: '#musicButton',
      sfxButtons: '#sfxButton',
      soundButtons: '#soundButton',
      soundSliders: '#soundSlider',
      musicSliders: '#musicSlider',
      voSliders: '#voSlider',
      sfxSliders: '#sfxSlider'
    });
    const userDataPlugin = new UserDataPlugin();
    const helpPlugin = new HelpPlugin('#helpButton');
    const controlSensitivityPlugin = new ControlSensitivityPlugin('#sensitivitySlider');
    keyboardMapPlugin = new KeyboardMapPlugin('#keyContainer');

    const pointerSizePlugin = new PointerSizePlugin('#pointerSlider');
    const buttonSizePlugin = new ButtonSizePlugin('#buttonSlider');
    const layersPlugin = new LayersPlugin('#layersSlider');
    const hudPlugin = new HUDPlugin('input[name=hud-position-one]');

    const hitAreaScalePlugin = new HitAreaScalePlugin('#hitAreaScaleSlider');
    const dragThresholdScalePlugin = new DragThresholdScalePlugin('#dragThresholdScaleSlider');
    const healthPlugin = new HealthPlugin('#healthSlider');
    const objectCountPlugin = new ObjectCountPlugin('#objectCountSlider');
    const completionPercentagePlugin = new CompletionPercentagePlugin('#completionPercentageSlider');
    const speedScalePlugin = new SpeedScalePlugin('#speedScaleSlider');
    const timersScalePlugin = new TimersScalePlugin('#timersScaleSlider');
    const inputCountPlugin = new InputCountPlugin('#inputCountSlider');


    container = new Container('.karma-html', {
      plugins: [
        captionsTogglePlugin,
        captionsStylePlugin,
        pausePlugin,
        soundPlugin,
        userDataPlugin,
        helpPlugin,
        controlSensitivityPlugin,
        keyboardMapPlugin,
        pointerSizePlugin,
        buttonSizePlugin,
        layersPlugin,
        hudPlugin,
        hitAreaScalePlugin,
        dragThresholdScalePlugin,
        healthPlugin,
        objectCountPlugin,
        completionPercentagePlugin,
        speedScalePlugin,
        timersScalePlugin,
        inputCountPlugin,
        colorVisionPlugin,
      ]
    });

    //triggering the respond calls for plugins that require them
    colorVisionPlugin.init();
    hudPlugin.init();
    keyboardMapPlugin.init();

    container.client.trigger('features', {
      colorVision: true,
      hudPosition: true,
      keyBinding: true
    });

    keyboardMapPlugin.client.trigger('keyBindings', [
      { actionName: 'Up', defaultKey: 'w' }
    ]);
    hudPlugin.client.trigger('hudPositions', [
      'top',
      'bottom',
    ]);
    colorVisionPlugin.client.trigger('colorFilters', [
      'None',
      'Deuteranopia',
      'Tritanopia',
    ]);
  });

  it('Check all button click events', () => {
    voButton.click();
    helpButton.click();
    captionsButton.click();
    pauseButton.click();
    soundButton.click();
    musicButton.click();
    sfxButton.click();
  });

  it('Check the sound slider events', () => {
    soundSlider.value = String(0.5);
    soundSlider.dispatchEvent(initEvent('change'));
    musicSlider.value = String(0.5);
    musicSlider.dispatchEvent(initEvent('change'));
    sfxSlider.value = String(0.5);
    sfxSlider.dispatchEvent(initEvent('change'));
    voSlider.value = String(0.5);
    voSlider.dispatchEvent(initEvent('change'));
  });

  it('check the slider change events', () => {
    sensitivitySlider.value = String(0.1);
    sensitivitySlider.dispatchEvent(initEvent('change'));
    pointerSlider.value = String(0.2);
    pointerSlider.dispatchEvent(initEvent('change'));
    buttonSlider.value = String(0.3);
    buttonSlider.dispatchEvent(initEvent('change'));
    layersSlider.value = String(0.4);
    layersSlider.dispatchEvent(initEvent('change'));
  });

  it('check the mechanic slider change events', () => {
    hitAreaScaleSlider.value = String(0.3);
    dragThresholdScaleSlider.value = String(0.3);
    healthSlider.value = String(0.3);
    objectCountSlider.value = String(0.3);
    completionPercentageSlider.value = String(0.3);
    speedScaleSlider.value = String(0.3);
    timersScaleSlider.value = String(0.3);
    inputCountSlider.value = String(0.3);

    hitAreaScaleSlider.dispatchEvent(initEvent('change'));
    dragThresholdScaleSlider.dispatchEvent(initEvent('change'));
    healthSlider.dispatchEvent(initEvent('change'));
    objectCountSlider.dispatchEvent(initEvent('change'));
    completionPercentageSlider.dispatchEvent(initEvent('change'));
    speedScaleSlider.dispatchEvent(initEvent('change'));
    timersScaleSlider.dispatchEvent(initEvent('change'));
    inputCountSlider.dispatchEvent(initEvent('change'));
  });

  it('check the key binding change event', () => {
    const event = document.createEvent('Event');
    event.key = 'c';
    keyContainer.querySelector('#keyBoardMapPlugin-Up').click();
    event.initEvent('keyup');
    document.dispatchEvent(event);
  });

  it('Check radio button click events', () => {
    colorRadioOne.click();
    colorRadioTwo.click();
    alignRadioOne.click();
    alignRadioTwo.click();
    fontSizeRadioOne.click();
    fontSizeRadioTwo.click();
    fontSizeRadioThree.click();
    deuteranopia.click();
    tritanopia.click();
    protanopia.click();
    achromatopsia.click();
    none.click();
    topOne.click();
    bottomOne.click();
    rightOne.click();
    leftOne.click();
  });

  it('Should open the path to the game', () => {
    container.openPath('/base/e2e/client.html');
  });

  it('check all bellhop events to make sure they are working', () => {});
  it('features', done => {
    container.client.on('features', () => {
      done();
    });
    container.client.trigger('features');
  });
  it('focus', done => {
    container.client.on('focus', () => {
      done();
    });
    container.client.trigger('focus');
  });
  it('keepFocus', done => {
    container.client.on('keepFocus', () => {
      done();
    });
    container.client.trigger('keepFocus');
  });
  it('userDataRemoved', done => {
    container.client.on('userDataRemoved', () => {
      done();
    });
    container.client.trigger('userDataRemoved');
  });
  it('userDataRead', done => {
    container.client.on('userDataRead', () => {
      done();
    });
    container.client.trigger('userDataRead');
  });
  it('userDataWrite', done => {
    container.client.on('userDataWrite', () => {
      done();
    });
    container.client.trigger('userDataWrite');
  });
});
