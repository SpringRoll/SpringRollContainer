# SpringRoll Container

The `<iframe>` controller for interacting with SpringRoll applications either by [SpringRoll Connect](https://github.com/SpringRoll/SpringRollConnect) or accessing locally. The Container works both in the context of a Cordova-based application or on a webserver.

## Installation

Install with [NPM](https://www.npmjs.com/).

```bash
npm install springroll-container
```

## Usage

Basic usage for opening a SpringRoll application via a local path. This can be used to open a game with a relative or absolute (e.g. "http://...") path.

```html
<iframe id="game" scrolling="no"></iframe>
<script>
    var container = new springroll.Container({iframeSelector: "#game"});
    container.openPath("game.html");
</script>
```

### Plugins

The Container supports several built-in plugins that mirror the state features in the application/game. These are initialized with HTML elements like buttons or input sliders.

Here's an example of creating a SoundPlugin with a button to toggle the sound within the game and an input slider to control the volume.

```html
<button id="soundButton">Mute</button>
<label for="volume">Volume: </label>
<input type="range" id="volume">
<iframe id="game" scrolling="no"></iframe>
<script>
  var container = new springroll.Container({
    iframeSelector: "#game",
    plugins: [
      new SoundPlugin({
        soundButton: '#soundButton',
        soundSlider: '#volume'
      }),
    ]
  });
	container.openPath('game.html');
</script>
```

If a plugin accepts multiple control elements only the supported options need to be included.
e.g. If a game only supports one volume type then the SoundPlugin doesn't require any of the unused controls like sfxSlider, voButton, etc.

This table describes the options and HTML elements that are used by each plugin

| Plugin | Option | HTML Element | Description |
|---|---|---|---|
| **CaptionsPlugin** | captionsButton | Button | Toggles the display of captions |
| **ControlsPlugin** | sensitivitySlider | Input(range) | Controls the player controls sensitivity |
| **HelpPlugin** | helpButton | Button | Triggers in-game help |
| **HUDPlugin** | positionsContainer | Container Element* | Container element that wraps the position buttons |
| **LayersPlugin** | layersSlider | Input(range) | Controls which distracting layers should be removed |
| **Pauseplugin** | pauseButton | Button | Plays and pause the game |
| **SoundPlugin** | soundButton | Button | Toggles all audio mute |
| **SoundPlugin** | voButton | Button | Toggles only voice-over mute |
| **SoundPlugin** | sfxButton | Button | Toggles only sound effects mute|
| **SoundPlugin** | musicButton | Button | Toggles only music mute |
| **SoundPlugin** | soundSlider | Input(range) | Controls the overall audio volume |
| **SoundPlugin** | voSlider | Input(range) | Controls the voice-over volume |
| **SoundPlugin** | sfxSlider |  Input(range) |Controls the sound effects volume |
| **SoundPlugin** | musicSlider | Input(range) | Controls the music volume |
| **UISizePlugin** | pointerSlider | Input(range) | Controls the size of the mouse pointer |
| **UISizePlugin** | buttonSlider | Input(range) | Controls the size of the UI buttons |

*The HUD Plugin differs slightly from the others in that it only requires a wrapper/container element(`div`, `form`, etc). It requests a list of positions from the game itself and dynamically builds out the radio buttons within that wrapper.



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
