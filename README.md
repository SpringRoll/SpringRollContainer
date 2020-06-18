# SpringRoll Container

The SpringRoll Container is `<iframe>` controller for interacting with SpringRoll applications hosted locally or in [SpringRoll Connect](https://github.com/SpringRoll/SpringRollConnect).

## Installation

The SpringRoll Container is [available on npm](https://www.npmjs.com/package/springroll-container). Install it with

```bash
npm install --save springroll-container
```

## Glossary
Here's a handful of libraries and terms that we'll use throughout this document:
- [SpringRoll](https://github.com/SpringRoll/SpringRoll) an JavaScript library for building portable and accessible HTML5 games
- [Bellhop](https://github.com/SpringRoll/Bellhop) an event-based wrapper around the [`postMessage` API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [SpringRollConnect](https://github.com/SpringRoll/SpringRollConnect) a content-management system for SpringRoll games.
  The SpringRoll Container can interact with a SpringRollConnect server to embed a game that is hosted remotely.

## Examples

The following examples assume that you've create an HTML page with an iframe on it:

```html
<iframe id="game" scrolling="no"></iframe>
```

and that you've imported this module:

```javascript
import { Container } from 'springroll-container';
```

### Opening a Local Game

```javascript
const container = new Container({
    iframeSelector: '#game'
});

container.openPath('local/path/to/game.html');
```

### Opening a Game Hosted at Another Domain

```javascript
const container = new Container({
  iframeSelector: '#game'
});

container.openLocal('https://example.com/path/to/game.html');
```

### Opening a Game Hosted on SpringRollConnect

```javascript
const container = new Container({
  iframeSelector: '#game'
});

container.openRemote('https://springroll-connect.example.com/api/release/game-slug');
```

### Opening a Game with a Pause Button

```javascript
import { PausePlugin, Container } from 'springroll-container';

const container = new Container({
  iframeSelector: '#game',
  plugins: [
    // Assuming that there is a <button id="pause-button" /> on the page somewhere
    new PausePlugin('button#pause-button'),
  ]  
});

container.openPath('path/to/game.html');
```

## Plugins

The Container has several built-in plugins that allow the user to control various aspects of a game/application.
These are initialized with either a query selector string (ala [document.querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector))
or an `HTMLElement`.

### PausePlugin, HelpPlugin:
```javascript
import { PausePlugin, HelpPlugin, Container } from 'springroll-container';

const container = new springroll.Container({
  iframeSelector: "#game",
  plugins: [
    //all three plugins here expect an HTML Button Element and take a single selector string
    new PausePlugin('#pause-button-selector'), //Pauses or unpauses the game
    new HelpPlugin('#help-button-selector'), //requests a hint or help from the game
  ]
});
container.openPath('game.html');
```
PausePlugin sets a className of 'paused' or 'unpaused' on individual pause buttons.

### CaptionsPlugin:
```javascript
import { CaptionsPlugin, Container } from 'springroll-container';

const container = new springroll.Container({
  iframeSelector: "#game",
  plugins: [
    new CaptionsPlugin({
      captionsButtons: '#caption-button-selector',
      //the three following options control caption styles, as radio buttons using the group name is ideal for selecting multiple radio buttons.

      //expects exactly three(3) radio buttons with values "sm", "md", and "lg" indicating caption font sizes.
      fontSizeRadios: 'input[name=font-size-radio-name]',

      //expects exactly two(2) radio buttons with values "default" (black background, white text),
      //and "inverted" (black text, white background) for caption color schemes
      colorRadios: 'input[name=color-radio-name]',

       //expects exactly two(2) radio buttons values "top" and "bottom".
      //Indicating that captions should be placed at the top or bototm of the screen.
       alignmentRadios: 'input[name=alignment-radio-name]',
    })
  ]
});
container.openPath('game.html');
```
CaptionsPlugin sets a class of `muted` or `unmuted` on the caption buttons as they are toggled.

### SoundPlugin:
```javascript
import { SoundPlugin, Container } from 'springroll-container';

const container = new springroll.Container({
  iframeSelector: "#game",
  plugins: [
    //The SoundPlugin has 4 different audio types and can take a button(for mute/unmute) and/or an input slider(for volume control)
    new SoundPlugin({
      //Sliders expect an HTML Input Element of type="range"
      //Buttons in the SoundPlugin expect an HTML Button Element
      soundButtons: '#soundButton', //mutes or unmutes all game audio
      soundSliders: '#soundSlider', //controls the game's audio volume
      musicButtons: '#musicButton', //mutes or unmutes the music
      musicSliders: '#musicSlider', //controls the game's music volume
      voButtons: '#voButton', //mutes or unmutes the voice over
      voSliders: '#voSlider', //controls the game's voice over volume
      sfxButtons: '#sfxButton', //mutes or unmutes the game's sound effects
      sfxSliders: '#sfxSlider', //controls the game's sound effects volume
    }),
  ]
});
container.openPath('game.html');
```
SoundPlugin will set a class of `muted` or `unmuted` on each button as they are toggled

### MechanicsPlugin:
```javascript
import { MechanicsPlugin, Container } from 'springroll-container';

const container = new springroll.Container({
  iframeSelector: "#game",
  plugins: [
    //The MechanicsPlugin offers many different types of "difficulty" so your game can offer fine grained control over their experience to the user. Explanations of the options are below
    //MechanicsPlugin also accepts an [optional] initial value for its difficulty types
    new MechanicsPlugin({
      //Sliders expect an HTML Input Element of type="range"
      hitAreaScaleSliders: '#hitAreaScaleSlider',
      //All difficulty values run 0.0 to 1.0. Default = 0.5
      defaultHitAreaScale = 0.5,
      dragThresholdScaleSliders: '#dragThresholdScaleSlider',
      defaultDragThresholdScale = 0.5,
      healthSliders: '#healthSlider',
      defaultHealth = 0.5,
      objectCountSliders: '#objectCountSlider',
      defaultObjectCount = 0.5,
      completionPercentageSliders: '#completionPercentageSlider',
      defaultCompletionPercentage = 0.5,
      speedScaleSliders: '#speedScaleSlider',
      defaultSpeedScale = 0.5,
      timersScaleSliders: '#timersScaleSlider',
      defaultTimersScale = 0.5,
      inputCountSliders: '#inputCountSlider',
      defaultInputCount = 0.5,
    }),
  ]
});
container.openPath('game.html');
```
MechanicsPlugin Options:

See the [Springroll Application Docs](https://github.com/SpringRoll/SpringRoll/tree/master/src "Springroll Application Documentation") for more detailed information.
| Feature             | Key               | Description   |
| ------------------- | ----------------- | ------------- |
| Hit Area Scale      | hitAreaScale      | Allows the player to define how large or small they want hit boxes for clicking/touching to be in the game. Gives the player the ability to make elements easier or harder to hit. |
| Drag Threshold Area | dragThresholdArea | Allows the player to define how sensitive they want object drag detection to be. More or less sensitivity can make certain game challenges more completable for players |
| Health              | health            | Allows the player to define how many attempts, retries, lives, or health they have in the game. |
| Object Count | objectCount | Allows the player to define how many objects, hidden or otherwise, are required to complete objectives throughout gameplay.  |
| Speed Scale | speedScale | Allows the player to define how quickly or slowly game mechanics move. |
| Completion Percentage | completionPercentage | Allows the player to define what percentage of a task is required to be finished to complete that task. |
| Timer Scale | timerScale | Allows the player to adjust timers in game to give more or less time to complete tasks. |
| Input Count | inputCount | Allows the player to define how many clicks, taps, or keyboard inputs are required to complete objectives.  |


### UISizePlugin, LayersPlugin:
```javascript
import { UISizePlugin, LayersPlugin, Container } from 'springroll-container';

const container = new springroll.Container({
  iframeSelector: "#game",
  plugins: [
    //UISizePlugin also accepts an [optional] initial value for its two options
    new UISizePlugin({
      //Expects an HTML Input Element of type="range"
      pointerSliders: '#pointer-slider-selector', //controls the size of the pointer
      pointerSize: 0.5, //pointer size goes from 0.0 to 1.0. Default = 0.5
      //Expects an HTML Input Element of type="range"
      buttonSliders: '#button-slider-selector', //controls the size of UI buttons
      buttonSize: 0.5, // button size goes from 0.0 to 1.0. Default = 0.5
    }),
    //LayersPlugin controls the progressive removal of distracting game layers. I.e. the higher the slider the more layers should be hidden from player view.
    new LayersPlugin({
      //Expects an HTML Input Element of type="range"
      layersSliders: '#layers-slider-selector' // goes from 0.0 to 1.0
    }),
  ]
});
container.openPath('game.html');
```
The following plugins require an extra bit of configuration from the game application to function correctly:

### HUDPlugin
```javascript
import { HUDPlugin, Container } from 'springroll-container';

const container = new springroll.Container({
  iframeSelector: "#game",
  plugins: [
    //HUDPlugin expects a button element/selector string
    new HUDPlugin({
      hudSelectorButtons: '#hud-position-button-selector' //toggles through the available HUD positions reported by the game
    }),
  ]
});
	container.openPath('game.html');
```
*The HUDPlugin requests the supported positions directly from the game itself and builds out an internal array of positions dynamically
e.g. if the game supports ['top', 'bottom'] then the Plugin will toggle between those two options whenever the button is clicked. See [the SpringRoll Application Class docs](https://github.com/SpringRoll/SpringRoll/tree/v2/src#handling-state-change) for more information on the request format.

The HUDPlugin will display the current position as a data attribute on the button itself.

### ControlsPlugin
```javascript
import { ControlsPlugin, Container } from 'springroll-container';

const container = new springroll.Container({
  iframeSelector: "#game",
  plugins: [
    //ControlsPlugin also accepts an [optional] initial value for its control sensitivity
    new ControlsPlugin({
      //Expects an HTML Input Element of type="range"
      sensitivitySliders: '#sensitivity-slider-selector',
      defaultSensitivity: 0.5, //control sensitivity goes from 0.0 to 1.0. Default = 0.5
      keyContainers: '#key-container', // container element that will contain the mappable key buttons.
    }),
  ]
});
container.openPath('game.html');
```
*The Key Binding functionality of the ControlsPlugin works similarly to the HUDPlugin in that it requests information from the Springroll Application. See [the SpringRoll Application Class docs](https://github.com/SpringRoll/SpringRoll/tree/v2/src#handling-state-change) for more information on the request format.

Keybindings are tracked visually by setting the textContent of the buttons themselves.

### ColorVisionPlugin
```javascript
import { ColorVisionPlugin, Container } from 'springroll-container';

const container = new springroll.Container({
  iframeSelector: "#game",
  plugins: [
    new ColorVisionPlugin({
      colorSelects: '#color-vision-dropdown-selector' //the plugin expects a <select> element
    }),
  ]
});
container.openPath('game.html');
```
*The color vision dropdown builds out the options dynamically based on what the application reports back. See [the SpringRoll Application Class docs](https://github.com/SpringRoll/SpringRoll/tree/v2/src#handling-state-change) for more information on the request format.

### Multiple Plugin Controls
All Plugins accept one or more HTML elements as controls in their constructor.
For example the SoundPlugin can accept more than one volume slider or button if your set up requires it:
```javascript
  new SoundPlugin({
    soundButtons: '#soundButton, #soundButtonTwo',
    soundSliders: '#soundSlider',
    musicButtons: '#musicButton',
    musicSliders: '#musicSlider, #musicSliderTwo',
  });
```
As long as the string you pass to the constructor is a valid selector string the plugin will use anything you pass to it. The plugins will keep settings in sync across the controls if neccessary as well. Sliders will update each other, buttons will set a dataSet attribute or class (see individual plugin sections for the exact attribute), and any other controls will match each other appropriately.

*Note: at this time there is no support for multiple HTMLElements as parameters. If you are passing an HTMLElement as the parameter rather than a selector string you cannot pass multiple controls. If you do wish to use multiple controls, pass the plugin a selector string instead.

### Play Options
The `openPath` method of the Container provides a mechanism for providing options directly to the game, called
`playOptions`:

```javascript
var container = new springroll.Container('#game');
container.openPath('game.html', {
    playOptions: {
        difficulty: 7,
        theme: 'blue'
    }
});
```

In a SpringRoll Application, the Container Client Plugin [mirrors this data directly onto the object](https://github.com/SpringRoll/SpringRoll/blob/master/src/container-client/ContainerClientPlugin.js#L316).
Once the application finishes its `init` process, this data will be available directly on the application instance:

```javascript
var app = new springroll.Application({
  // various options here
});

app.on('init', function() {
  springroll.Debug.log('Play Options are', app.playOptions); // { difficulty: 7, theme: 'blue' }
});
```

Any JSON-serializable object can be set as a `playOption`.

## Documentation

[API Documentation](http://springroll.github.io/SpringRollContainer/) has full documentation for the Container.

## License

Copyright (c) 2018 [SpringRoll](http://github.com/SpringRoll)

Released under the MIT License.
