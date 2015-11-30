# SpringRoll Container

The `<iframe>` controller for interacting with SpringRoll applications either by [SpringRoll Connect](https://github.com/SpringRoll/SpringRollConnect) or accessing locally. The Container works both in the context of a Cordova-based application or on a webserver.

## Installation

Install with [Bower](http://bower.io/).

```bash
bower install springroll-container
```

Install with [NPM](https://www.npmjs.com/).

```bash
npm install springroll-container
```

## Usage 

Basic usage for opening a SpringRoll application via a local path. This can be used to open a game with a relative or absolute (e.g. "http://...") path.

```html
<iframe id="game" scrolling="no"></iframe>
<script>
    var container = new springroll.Container("#game");
    container.openPath("game.html");
</script>
```

### Custom Interface Elements

The Container supports custom interface elements for managing things like toggle captions and sound. Here's an example of creating a button to toggle the sound within the game.

```html
<button id="soundButton">Mute</button>
<iframe id="game" scrolling="no"></iframe>
<script>
	var container = new springroll.Container("#game", {
	    soundButton: "#soundButton"
	});
	container.openPath('game.html');
</script>
```

| Option | Description |
|---|---|
| **helpButton** | Triggers in-game help |
| **captionsButton** | Toggles the display of captions |
| **soundButton** | Toggles all audio mute |
| **voButton** | Toggles only voice-over mute |
| **sfxButton** | Toggles only sound effects mute|
| **musicButton** | Toggles only music mute |
| **pauseButton** | Plays and pause the game |

##Documentation

[API Documentation](http://springroll.github.io/SpringRollContainer/) has full documentation for the Container.

##License

Copyright (c) 2015 [CloudKid](http://github.com/cloudkidstudio)

Released under the MIT License.
