# SpringRoll Container

The SpringRoll Container is an `<iframe>` controller for interacting with SpringRoll applications hosted locally or in [SpringRoll Connect](https://github.com/SpringRoll/SpringRollConnect).

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

The following examples assume that you've created an HTML page with an iframe on it:

```html
<iframe id="game" scrolling="no"></iframe>
```

and that you've imported this module:

```javascript
import { Container } from 'springroll-container';
```

### Opening a Local Game

```javascript
const container = new Container('#game');

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
const container = new Container('#game');

container.openRemote('https://springroll-connect.example.com/api/release/game-slug');
```

### Opening a Game with a Pause Button

```javascript
import { PausePlugin, Container } from 'springroll-container';

const container = new Container('#game', {
  plugins: [
    // Assuming that there is a <button id="pause-button" /> on the page somewhere
    new PausePlugin('button#pause-button'),
  ]
});

container.openPath('path/to/game.html');
```

## Plugins

The Container has several built-in plugins that allow the user to control various aspects of a game/application.
These are initialized with either a query selector string (similar to what you would pass to [document.querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector))
or an `HTMLElement`.

Plugins in the SpringRollContainer correspond to a matching [feature in SpringRoll Core](https://github.com/SpringRoll/SpringRoll/tree/develop/src#features).
If the container has a plugin enabled corresponding to a feature that the game doesn't contain, the container will automatically _hide the corresponding UI element_.
For example, if the container has the `CaptionsPlugin` enabled with a corresponding button to toggle captions but the game doesn't actually _have_ captions, the container will hide the captions toggle button automatically.

### PausePlugin, HelpPlugin:
```javascript
import { PausePlugin, HelpPlugin, Container } from 'springroll-container';

const container = new springroll.Container("#game", {
  plugins: [
    new PausePlugin('button#pause-button'), // Pauses or unpauses the game
    new HelpPlugin('button#help'), // requests a hint or help from the game
  ]
});
container.openPath('game.html');
```
PausePlugin sets a className of 'paused' or 'unpaused' on individual pause buttons.

### Captions:
There are two plugins that interact with captions: CaptionsTogglePlugin, and CaptionsStylePlugin.
CaptionsTogglePlugin allows the user to hide or show the captions in the game.
CaptionsStylePlugin allows the user to control the size, placement, and color of the captions.

```javascript
import { CaptionsStylePlugin, CaptionsToggleplugin, Container } from 'springroll-container';

const container = new springroll.Container('#game', {
  plugins: [
    new CaptionsTogglePlugin({
      captionsButtons: '#captions',
    }),
    new CaptionsStylePlugin({
      // expects exactly three(3) radio buttons with values "small", "medium", and "large" indicating caption font sizes.
      fontSizeRadios: 'input[name=captions-font-size]',

      // expects exactly two(2) radio buttons with values "default" (black background, white text),
      // and "inverted" (black text, white background) for caption color schemes
      colorRadios: 'input[name=captions-font-color]',

      // expects exactly two(2) radio buttons values "top" and "bottom".
      // Indicating that captions should be placed at the top or bottom of the screen.
      alignmentRadios: 'input[name=captions-alignment]',
    }),
  ]
});
container.openPath('game.html');
```

Typical HTML for powering the captions plugin might look like this:

```html
<button id="captions">Toggle Captions</button>

<div>
  <label><input name="captions-font-size" value="sm" /> Small</label>
  <label><input name="captions-font-size" value="md" /> Medium</label>
  <label><input name="captions-font-size" value="lg" /> Large</label>
</div>

<div>
  <label><input name="captions-font-color" value="default" /> Default</label>
  <label><input name="captions-font-color" value="inverted" /> Inverted</label>
</div>

<div>
  <label><input name="captions-alignment" value="top" /> Default</label>
  <label><input name="captions-alignment" value="bottom" /> Inverted</label>
</div>
```

Note that the captions plugin sets a class of `muted` or `unmuted` on the caption buttons as they are toggled.

### SoundPlugin:
The sound plugin allows users to control the volume of individual audio channels within the game.
SpringRoll supports three audio channels: VO, SFX, and Music and we encourage developers to use them as it empowers users to customize their game play to suite their needs.

The sound plugin supports a total of eight controls:
- A global sound mute
- Mute buttons for each of the three audio channels mentioned above - VO, SFX, Music
- A global sound volume slider
- Volume sliders for each of the three audio channels mentioned above - VO, SFX, Music

```javascript
import { SoundPlugin, Container } from 'springroll-container';

const container = new springroll.Container('#game', {
  plugins: [
    new SoundPlugin({
      soundButtons: '#soundButton', // mutes or unmutes all game audio
      musicButtons: '#musicButton', // mutes or unmutes the music
      voButtons: '#voButton', // mutes or unmutes the voice over
      sfxButtons: '#sfxButton', // mutes or unmutes the game's sound effects

      // The sound button expects these to be HTML range inputs
      soundSliders: '#soundSlider', // controls the game's audio volume
      musicSliders: '#musicSlider', // controls the game's music volume
      voSliders: '#voSlider', // controls the game's voice-over volume
      sfxSliders: '#sfxSlider', // controls the game's sound effects volume
    }),
  ]
});
container.openPath('game.html');
```
SoundPlugin will set a class of `muted` or `unmuted` on each button as they are toggled

### Mechanics:
Mechanics are various aspects of the game that the determine how a user plays the game (see table below for details).
Some games will support many of these features, some none at all. We doubt one game will use all of them though.

Each plugin is responsible for one of the listed mechanics and should be provided a
[HTML range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range), and an optional default value.
Each mechanic's value will range between 0 to 1, and the default initial value is aways 0.5.

```javascript
import {
  HitAreaScalePlugin, DragThresholdScalePlugin, HealtPlugin, ObjectCountPlugin,
  CompletionPercentagePlugin, SpeedScalePlugin, TimersScalePlugin, InputCountPlugin,
  Container
  } from 'springroll-container';

const container = new springroll.Container('#game', {
  plugins: [
      new HitAreaScalePlugin('#hitAreaScaleSlider', {defaultHitAreaScale = 0.5}),
      new DragThresholdScalePlugin('#dragThresholdScaleSlider', {defaultDragThresholdScale = 0.5}),
      new HealthPlugin('#healthSlider', {defaultHealth = 0.5}),
      new ObjectCountPlugin('#objectCountSlider', {defaultObjectCount = 0.5}),
      new CompletionPercentagePlugin('#completionPercentageSlider', {defaultCompletionPercentage = 0.5}),
      new SpeedScalePlugin('#speedScaleSlider', {defaultSpeedScale = 0.5}),
      new TimersScalePlugin('#timersScaleSlider', {defaultTimersScale = 0.5}),
      new InputCountPlugin('#inputCountSlider', {defaultInputCount = 0.5}),
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


### PointerSizePlugin, ButtonSizePlugin, LayersPlugin:
The Button Size plugin allows users to control the size of buttons within the game. The size value ranges from 0 to 1, defaulting to 0.5.

The Pointer Size plugin allows users to control the size of custom pointers within the game. The size value ranges from 0 to 1, defaulting to 0.5.

The Layers plugin allows users to hide distracting layers within a game. This is a ranged value from 0 to 1. 0 indicates "show all layers"
whereas 1 indicates "hide all distracting layers". By default, this value is 0.

Note that each game may implement this differently.

Note that these plugins accept HTML range inputs, rather than buttons.

```javascript
import { ButtonSizePlugin, PointerSizePlugin, LayersPlugin, Container } from 'springroll-container';

const container = new springroll.Container('#game', {
  plugins: [
    new ButtonSizePlugin('#button-slider-selector', {
      defaultButtonSize: 0.5, // button size goes from 0.0 to 1.0. Default = 0.5
    }),

    new PointerSizePlugin('#pointer-slider-selector', {
      defaultPointerSize: 0.5, //pointer size goes from 0.0 to 1.0. Default = 0.5
    }),

    new LayersPlugin('#layers-slider-selector', {
      defaultValue = 0 // goes from 0.0 to 1.0
    })
  ]
});

container.openPath('game.html');
```

### HUDPlugin
The HUD plugin allows users to position HUD elements within a game by docking to different sides of the screen.

```javascript
import { HUDPlugin, Container } from 'springroll-container';

const container = new springroll.Container('#game', {
  plugins: [
    // expects exactly four(4) radio buttons with values "top", "bottom", "left", "right,
    new HUDPlugin('#hud-position-button-selector', {
      defaultValue: "top" //the initial starting value, defaults to "top"
    }),
  ]
});

container.openPath('game.html');
```

The HUDPlugin requests the supported positions directly from the game itself and builds out an internal list of positions dynamically,
e.g. if the game supports Top and Bottom HUD docking (stored internally as `['top', 'bottom']`) then the plugin will hide the "left" and "right"
radio buttons so only the valid ones are displayed to users.

See [the SpringRoll Application Class docs](https://github.com/SpringRoll/SpringRoll/tree/develop/src#responding-to-the-container) for more information on
the request format and how game developers provide those values.

### ControlsPlugin
```javascript
import { ControlsPlugin, Container } from 'springroll-container';

const container = new springroll.Container('#game', {
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

const container = new springroll.Container('#game', {
  plugins: [
    // expects exactly five(5) radio buttons with values "none", "achromatopsia", "tritanopia", "deuteranopia",
    // and "protanopia" indicating the types of color visions supported.
    new ColorVisionPlugin('input[name=color-vision-radios]'{
      defaultValue: 'none' // initial checked radio box, defaults to "none"
    }),
  ]
});
container.openPath('game.html');
```
*The color vision radio group builds out the supported values dynamically based on what the application reports back and hides
any unsupported values. See [the SpringRoll Application Class docs](https://github.com/SpringRoll/SpringRoll/tree/v2/src#handling-state-change)
for more information on the request format.

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
