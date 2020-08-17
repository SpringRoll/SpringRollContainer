# Authoring Plugins

Writing a plugin for Container is relatively simple but there are some differences based on whether it is going to be a built-in plugin, or external.

Plugins for Container should take the form of an ES6 module, preferably with a named export. E.g.:
```javascript
export class ContainerPlugin() {...}
```

When developing a plugin for Container v2.x there are 3 main lifecycle hooks to keep in mind: `preload`, `init`, and `start`.

`preload()`: Preload must return a `Promise`. It can be async. The method is passed the entire [PluginManager](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/PluginManager.js) object. In general, most plugins will only need to access the [Bellhop client](https://github.com/SpringRoll/Bellhop). However, the entire `PluginManager` object is available should you require it.
*Note: if this method is missing or the returned promise is rejected, Container will automatically discard your plugin and it will not be loaded in properly.*

Example:
```javascript
export class ContainerPlugin() {
  constructor() {...}

  async preload({ client }) {
    this.client = client;
  }
}
```

`init()`: The init method is called once all plugin `preload` promises have resolved. Most setup that involves interacting with the Springroll Application via Bellhop would happen here. Any event listeners (bellhop or otherwise) should go here. `init()` is also passed the `PluginManager` class object if required.

`start()`: The `start()` method is called after all preloaded plugins have finished their `init()` calls. This method allows plugins to depend on others by allowing a second plugin to `start()` after a first plugin has ran `init()`. This can help ease race conditions between plugins, as they are not guarenteed to call `init()` in a consistent order. Similarly to `preload()`, `start()` is also passed the `PluginManager` class object if required.

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

However, some more customized plugins plugins may have additional concerns. These are detailed below.```

## External Plugin
External Plugins are generally specific to an application or organization and follow the above blueprint. They don't tend to follow a Springroll Application feature like `sound` or `captions`, and may just be additional custom functionality for your particular page. In this case, you can implement the methods you need for your plugin with no additional considerations.

## Porting Container v1.x plugins to v2.x
Exactly how you go about porting your plugin from the SpringRollContainer 1 to 2 will depend on how the original plugin was written. The `init()` function for Container 2.0 plugins will loosely correspond to the older `setup()` from Container 1.0.

The older hook methods `open` and `opened` should now be implemented as event listeners in the main plugin.:
```javascript
export class MyPlugin {
  preload() {
    return Promise.resolve();
  }

  init({ client }) {
    client.on('opened', () => {
      // do things
    });

    client.on('open', () => {
      // do things
    });
  }
}
```


## Internal a.k.a. Built-In Plugins
If you're developing for SpringrollContainer directly the process is still the same but there are base plugin classes available to keep your plugins DRY and more consistent.

### [BasePlugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/base-plugins/BasePlugin.js)
[Example Plugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/plugins/KeyboardMapPlugin.js)
The most barebones plugin class avaialable. Should be used if none of the other plugins match your needs.
Provides very basic implementations of `preload()`, `init()`, and `start()`.

| It also provides a few useful helper functions: | |
| --- | --- |
| `SendProperty(prop, value)` | Sends a single property and it's value through Bellhop to the application. `prop` should match the springroll feature name. Also [saves the property](https://github.com/SpringRoll/SpringRollContainer#saved-data-api) for re-use |
| `warn(warningText)` | prints out an informative console warning |
---

### [ButtonPlugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/base-plugins/ButtonPlugin.js)
[Example Plugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/plugins/CaptionsTogglePlugin.js)
The `ButtonPlugin` is useful for any plugin that requires a `mute` state (i.e. on or off). It extends the `BasePlugin` and has access to all of the methods above.
| It also includes: | |
| --- | --- |
| `_setMuteProp(prop, button, muted)` | Sets the current state of the property, and sends it to the application. This also handles applying styles to the button or buttons to match. `button` can be a single instance of a button or an array of matching buttons.
---

### [SliderPlugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/base-plugins/SliderPlugin.js)
[Example Plugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/plugins/LayersPlugin.js)
If your plugin requires a range input to control volume or a similar setting this plugin will handle most of it. It can only accept one setting to control however so if you require more than one setting (e.g. `MusicVolume` and `VoiceOverVolume`) consider breaking it out into multiple plugins or just using `BasePlugin`. If your plugin extends this base class all you have to do is pass the configuration options through the `super()` call and the `SliderPlugin` handles the rest.

### [RadioGroupPlugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/base-plugins/RadioGroupPlugin.js)
[Example Plugin](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/plugins/ColorVisionPlugin.js)
The RadioGroupPlugin is used for any plugin that uses groups of radio buttons to allow selection between pre-determined options. Similarly to the SliderPlugin above, the RadioGroupPlugin handles most of the set up behind the scenes and you won't have to interact directly with any of its methods.

### UI-Elements
Container also provides a few base ui-element classes to help set up any HTML controls you have. These are:
- [Slider](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/ui-elements/Slider.js)
- [Button](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/ui-elements/Button.js)
- [RadioGroup](https://github.com/SpringRoll/SpringRollContainer/blob/main/src/ui-elements/RadioGroup.js)

Note: these are used automatically by the `RadioGroupPlugin` and `SliderPlugin`. So these should only be required if you're not using one of those two as your base.
