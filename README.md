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
For example, if the container has the `CaptionsTogglePlugin` enabled with a corresponding button to toggle captions but the game doesn't actually _have_ captions, the container will hide the captions toggle button automatically.

### PausePlugin, HelpPlugin:
```javascript
import { PausePlugin, HelpPlugin, Container } from 'springroll-container';

const container = new Container("#game", {
  plugins: [
    new PausePlugin('button#pause-button'), // Pauses or unpauses the game
    new HelpPlugin('button#help'), // requests a hint or help from the game
  ]
});
container.openPath('game.html');
```

`PausePlugin` sets a className of 'paused' or 'unpaused' on individual pause buttons.

### Captions:
There are two plugins that interact with captions: `CaptionsTogglePlugin`, and `CaptionsStylePlugin`.
`CaptionsTogglePlugin` allows the user to hide or show the captions in the game.
`CaptionsStylePlugin` allows the user to control the size, placement, and color of the captions.

```javascript
import { CaptionsStylePlugin, CaptionsToggleplugin, Container } from 'springroll-container';

const container = new Container('#game', {
  plugins: [
    new CaptionsTogglePlugin('#captions'),
    new CaptionsStylePlugin(
      // expects exactly three(3) radio buttons with values "small", "medium", and "large" indicating caption font sizes.
      'input[name=captions-font-size]',

      // expects exactly two(2) radio buttons with values "default" (black background, white text),
      // and "inverted" (black text, white background) for caption color schemes
      'input[name=captions-font-color]',

      // expects exactly two(2) radio buttons values "top" and "bottom".
      // Indicating that captions should be placed at the top or bottom of the screen.
      'input[name=captions-alignment]',
    ),
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

const container = new Container('#game', {
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
`SoundPlugin` will set a class of `muted` or `unmuted` on each button as they are toggled

### Mechanics:
Mechanics are various configurable aspects of the game that can determine how a user plays the game (see table below for details).
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

const container = new Container('#game', {
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

const container = new Container('#game', {
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

const container = new Container('#game', {
  plugins: [
    // expects exactly four(4) radio buttons with values "top", "bottom", "left", "right,
    new HUDPlugin('#hud-position-button-selector', {
      defaultValue: "top" //the initial starting value, defaults to "top"
    }),
  ]
});

container.openPath('game.html');
```

The HUD Plugin requests the supported positions directly from the game itself and builds out an internal list of positions dynamically,
e.g. if the game supports Top and Bottom HUD docking (stored internally as `['top', 'bottom']`) then the plugin will hide the "left" and "right"
radio buttons so only the valid ones are displayed to users.

See [the SpringRoll Application Class docs](https://github.com/SpringRoll/SpringRoll/tree/develop/src#responding-to-the-container) for more information on
the request format and how game developers provide those values.

### Controls
There are two plugins associated with in-game controls: `ControlSensitivityPlugin` and `KeyboardMapPlugin`.
The Control Sensitivity Plugin allows the user to determine the sensitivity of custom pointers in game. This plugin expects an HTML Input
The Keyboard Map Plugin allows users to re-map the keys/controls used in-game to something they are more comfortable with.

```javascript
import { ControlSensitivityPlugin, KeyboardMapPlugin, Container } from 'springroll-container';

const container = new Container('#game', {
  plugins: [
    //ControlSensitivityPlugin expects an input of type=range for it's input.
    new ControlSensitivityPlugin('#sensitivity-slider-selector', {
      defaultSensitivity: 0.5, //control sensitivity goes from 0.0 to 1.0. Default = 0.5
    }),
    //The KeyboardMapPlugin expects a div or similar container element as it's selector. It will automatically build out the
    //buttons to use for re-mapping controls based on what the application returns. See note below for HTML structure.
    new KeyboardMapPlugin('#key-container', {
      //you can provide a custom classname that will be attached to each key button that is generated
      customClassName: 'custom-button-class' //default='springrollContainerKeyBinding__button'.
    })
  ]
});
container.openPath('game.html');
```
*The Key Binding functionality of the `KeyboardMapPlugin` works similarly to the HUDPlugin in that it requests information from the Springroll Application. See [the SpringRoll Application Class docs](https://github.com/SpringRoll/SpringRoll/tree/v2/src#handling-state-change) for more information on the request format.

The HTML output within the key container will look like the following:
The className shown is the default, but can be overridden through the `customClassName` option. The IDs are generated based on the action name.

```html
<div id="keyContainer">
  <label for="keyBoardMapPlugin-Up">Up</label>
  <button class="springrollContainerKeyBinding__button" value="Up" id="keyBoardMapPlugin-Up">w</button>
  <label for="keyBoardMapPlugin-Down">Down</label>
  <button class="springrollContainerKeyBinding__button" value="Down"id="keyBoardMapPlugin-Down">s</button>
</div>
```


Keybindings are tracked visually by setting the textContent of the buttons themselves.

### ColorVisionPlugin
```javascript
import { ColorVisionPlugin, Container } from 'springroll-container';

const container = new Container('#game', {
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

## Authoring Plugins

Writing a plugin for Container is relatively simple but there are some differences based on whether it is going to be a built-in plugin, or external.

Plugins for Container should take the form of an ES6 module, preferably with a named export. E.g.:
```javascript
export class ContainerPlugin() {...}
```

When developing a plugin for Container v2.x there are 3 main lifecycle hooks to keep in mind: `preload`, `init`, and `start`.

`preload()`: Preload expects an async method or at least a returned promise. The method is passed the entire [PluginManager](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/PluginManager.js) object. In general all plugins need to access is the [Bellhop client](https://github.com/SpringRoll/Bellhop), but the entire object is available should you require it.
Note: if this method is missing or fails to resolve, Container will automatically discard your plugin and it will not be loaded in properly.

Example:
```javascript
export class ContainerPlugin() {
  constructor() {...}

  async preload({ client }) {
    this.client = client;
  }
}
```

`init()`: the init method is called once the preload promises have all resolved. This method would be where you do most of your plugins setup that involves interacting with the Springroll Application. Any event listeners (bellhop or otherwise), or additional data fetching should go here. Similarly to `preload()` init is also passed the `PluginManager` class object if required.

`start()`: Generally all that your plugin will require is an `init()` method. But, if the case arises where your plugin depends on another plugin the start method exists. This is called after all preloaded plugins have finished their init calls and serves a similar purpose. This can help ease race conditions between plugins, as they are not guarenteed to call `init` in a consistent order. Similarly to `preload()` init is also passed the `PluginManager` class object if required.

In general every plugin will follow a similar blueprint and will look something like this:
```javascript
export class ContainerPlugin() {
  constructor() {...}

  async preload({ client }) {
    this.client = client;
  }

  init() {...}

  start() {...}

  //Any other helper functions required
}
```

But depending on whether the plugin is intended to be external to Container (i.e. application specific), one of the built-in plugins, or even a port from a previous version of Container (pre v2.x) there may be some additional considerations detailed below.

### External Plugin
External Plugins are generally specific to an application or organization and follow the above blueprint. They don't tend to follow a Springroll Application feature, and may just be something additional you need to slot into your page. There are no real extra considerations to take into account.

### Porting Container v1.x plugins to v2.x
Exactly how you go about porting your plugin from the 1.x version to the newer 2.x versions will depend on how the old plugin was written. The new plugins are based around the `init()`, `start()`, and `preload()` hooks. The main similarity is that `init()` will loosely correspond to the older `setup()` function from 1.x. Everything else should be able to proceed as outlined in the [general plugin overview](##Authoring-Plugins) above

### Internal a.k.a. Built-In Plugins
If you're developing for SpringrollContainer directly the process is still the same but there are base plugin classes available to keep your plugins DRY and help with consistency.

#### [BasePlugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/base-plugins/BasePlugin.js)
[Example Plugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/plugins/KeyboardMapPlugin.js)
The most barebones plugin class avaialable. Should be used if none of the other plugins match your needs.
Provides very basic implementations of `preload()`, `init()`, and `start()`.

| It also provides a few useful helper functions: | |
| --- | --- |
| `SendProperty(prop, value)` | Sends a single property and it's value through Bellhop to the application. `prop` should match the springroll feature name. Also [saves the property](https://github.com/SpringRoll/SpringRollContainer#saved-data-api) for re-use |
| `warn(warningText)` | prints out an informative console warning |
---

#### [ButtonPlugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/base-plugins/ButtonPlugin.js)
[Example Plugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/plugins/CaptionsTogglePlugin.js)
The `ButtonPlugin` is useful for any plugin that requires a `mute` state (i.e. on or off). It extends the `BasePlugin` and has access to all of the methods above.
| It also includes: | |
| --- | --- |
| `_setMuteProp(prop, button, muted)` | Sets the current state of the property, and sends it to the application. This also handles applying styles to the button or buttons to match. `button` can be a single instance of a button or an array of matching buttons.
---

#### [SliderPlugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/base-plugins/SliderPlugin.js)
[Example Plugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/plugins/LayersPlugin.js)
If your plugin requires a range input to control volume or a similar setting this plugin will handle most of it. It can only accept one setting to control however so if you require more than one setting (e.g. `MusicVolume` and `VoiceOverVolume`) consider breaking it out into multiple plugins or just using `BasePlugin`. If your plugin extends this base class all you have to do is pass the configuration options through the `super()` call and the `SliderPlugin` handles the rest.

#### [RadioGroupPlugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/base-plugins/RadioGroupPlugin.js)
[Example Plugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/plugins/ColorVisionPlugin.js)
The RadioGroupPlugin is used for any plugin that uses groups of radio buttons to allow selection between pre-determined options. Similarly to the SliderPlugin above, the RadioGroupPlugin handles most of the set up behind the scenes and you won't have to interact directly with any of its methods.

#### UI-Elements
Container also provides a few base ui-element classes to help set up any HTML controls you have. These are:
- [Slider](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/ui-elements/Slider.js)
- [Button](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/ui-elements/Button.js)
- [RadioGroup](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/ui-elements/RadioGroup.js)

Note: these are used automatically by the `RadioGroupPlugin` and `SliderPlugin`. So these should only be required if you're not using one of those two as your base.

## Play Options
The `openPath` method of the Container provides a mechanism for providing options directly to the game, called
`playOptions`:

```javascript
var container = new Container('#game');
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

## Saved Data API
The SavedData API is made up of three classes: `SavedData`, `SavedDataHandler`, and the `UserDataPlugin`.
It allows the container (or the Springroll Application) to store key-value pairs in local or session storage. It is primarily
used to store user data for use across the Springroll environment. Examples are listed below for each class.

### SavedData
The `SavedData` class is the most direct way to access the Container storage options. It is used primarily in plugin classes, but may
be used wherever necessary.

```javascript
import { SavedData } from 'springroll-container';

//the last argument, tempOnly, is optional (defaults to false) and decides whether the value should be saved in session (temporary),
//or local (not temporary) storage.
const tempOnly = false;
SavedData.write('user-value-key', 'user-value', tempOnly);

//SavedData.read() checks localStorage first and then sessionStorage. If the key exists in both only the localStorage will be returned.
let data = SavedData.read('user-value-key'); //data will be either the value in storage, if it exists, or null if it does not.

SavedData.remove('user-value-key'); //removes the value from both local and session storage.
```

### SavedDataHandler
The SavedDataHandler class is used primarily in the `UserDataPlugin` to interact with the `SavedData` class. But can be used directly
if you require a callback when reading or writing from `SavedData`. Like `SavedData` all of the methods are static.
```javascript
import { SavedDataHandler } from 'springroll-container';

SavedDataHandler.write('user-value-name', 'value-to-be-stored', () => console.log('user-value-name written to storage'));

SavedDataHandler.read('user-value-name', value => console.log('Returned value: ' + value));

SavedDataHandler.remove('user-value-name', () => console.log('user-value-name removed from storage'));

```
We don't expect this handler to be used very often, but it is available if required.

### UserDataPlugin
This plugin allows the container to respond to requests from the Springroll Application's [User Data Class](https://github.com/SpringRoll/SpringRoll/tree/master/src/state).
It is included in the container constructor like any other plugin:
```javascript
import { UserDataPlugin, Container } from 'springroll-container';

const container = new Container('#game', {
  plugins: [
    new UserDataPlugin(),
  ]
});
container.openPath('game.html');
```
There is no configuration required for the UserDataPlugin as it just handles requests from the Application.

## License

Copyright (c) 2020 [SpringRoll](http://github.com/SpringRoll)

Released under the MIT License.
