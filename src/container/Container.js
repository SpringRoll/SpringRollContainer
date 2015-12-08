/**
 * @module Container
 * @namespace springroll
 */
(function(document, undefined)
{
	//Import classes
	var EventDispatcher = include('springroll.EventDispatcher'),
		Features = include('springroll.Features'),
		Bellhop = include('Bellhop'),
		$ = include('jQuery');

	/**
	 * The application container
	 * @class Container
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {string} iframeSelector jQuery selector for application iframe container
	 * @param {object} [options] Optional parameteres
	 * @param {string} [options.helpButton] jQuery selector for help button
	 * @param {string} [options.captionsButton] jQuery selector for captions button
	 * @param {string} [options.soundButton] jQuery selector for captions button
	 * @param {string} [options.voButton] jQuery selector for vo button
	 * @param {string} [options.sfxButton] jQuery selector for sounf effects button
	 * @param {string} [options.musicButton] jQuery selector for music button
	 * @param {string} [options.pauseButton] jQuery selector for pause button
	 * @param {string} [options.pauseFocusSelector='.pause-on-focus'] The class to pause
	 *        the application when focused on. This is useful for form elements which
	 *        require focus and play better with Application's keepFocus option.
	 */
	var Container = function(iframeSelector, options)
	{
		EventDispatcher.call(this);

		/**
		 * The options
		 * @property {Object} options
		 * @readOnly
		 */
		this.options = options ||
		{};

		/**
		 * The name of this class
		 * @property {string} name
		 */
		this.name = 'springroll.Container';

		/**
		 * The current iframe jquery object
		 * @property {jquery} iframe
		 */
		this.main = $(iframeSelector);

		/**
		 * The DOM object for the iframe
		 * @property {Element} dom
		 */
		this.dom = this.main[0];

		/**
		 * Communication layer between the container and application
		 * @property {Bellhop} client
		 */
		this.client = null;

		/**
		 * The current release data
		 * @property {Object} release
		 */
		this.release = null;

		/**
		 * Check to see if a application is loaded
		 * @property {Boolean} loaded
		 * @readOnly
		 */
		this.loaded = false;

		/**
		 * Check to see if a application is loading
		 * @property {Boolean} loading
		 * @readOnly
		 */
		this.loading = false;

		// Bind close failed handler
		this._onCloseFailed = this._onCloseFailed.bind(this);

		// Setup plugins
		var plugins = Container._plugins;
		for (var i = 0; i < plugins.length; i++)
		{
			plugins[i].setup.call(this);
		}
	};

	/**
	 * The current version of the library
	 * @property {String} version
	 * @static
	 * @readOnly
	 * @default VERSION
	 */
	Container.version = VERSION;

	//Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = EventDispatcher.extend(Container);

	/**
	 * The collection of Container plugins
	 * @property {Array} _plugins
	 * @static
	 * @private
	 */
	Container._plugins = [];

	/**
	 * Open a application or path
	 * @method _internalOpen
	 * @protected
	 * @param {string} path The full path to the application to load
	 * @param {Object} [options] The open options
	 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
	 * @param {Object} [options.playOptions=null] The optional play options
	 */
	p._internalOpen = function(path, options)
	{
		options = $.extend(
		{
			singlePlay: false,
			playOptions: null
		}, options);

		this.reset();

		// Dispatch event for unsupported browsers
		// and then bail, don't continue with loading the application
		var err = Features.basic();
		if (err)
		{
			/**
			 * Fired when the application is unsupported
			 * @event unsupported
			 * @param {String} err The error message
			 */
			return this.trigger('unsupported', err);
		}

		this.loading = true;

		this.initClient();

		// Open plugins
		var plugins = Container._plugins;
		for (var i = 0; i < plugins.length; i++)
		{
			plugins[i].open.call(this);
		}

		//Open the application in the iframe
		this.main
			.addClass('loading')
			.prop('src', path);

		// Respond with data when we're ready
		this.client.respond('singlePlay', options.singlePlay);
		this.client.respond('playOptions', options.playOptions);

		/**
		 * Event when request to open an application has begin either by
		 * calling `openPath` or `openRemote`
		 * @event open
		 */
		this.trigger('open');
	};

	/**
	 * Open a application or path
	 * @method openPath
	 * @param {string} path The full path to the application to load
	 * @param {Object} [options] The open options
	 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
	 * @param {Object} [options.playOptions=null] The optional play options
	 */
	p.openPath = function(path, options, playOptions)
	{
		options = options ||
		{};

		// This should be deprecated, support for old function signature
		if (typeof options === "boolean")
		{
			options = {
				singlePlay: singlePlay,
				playOptions: playOptions
			};
		}
		this._internalOpen(path, options);
	};

	/**
	 * Set up communication layer between site and application.
	 * May be called from subclasses if they create/destroy Bellhop instances.
	 * @protected
	 * @method initClient
	 */
	p.initClient = function()
	{
		//Setup communication layer between site and application
		this.client = new Bellhop();
		this.client.connect(this.dom);

		//Handle bellhop events coming from the application
		this.client.on(
		{
			loading: onLoading.bind(this),
			loadDone: onLoadDone.bind(this), // @deprecated use 'loaded' instead
			loaded: onLoadDone.bind(this),
			endGame: onEndGame.bind(this),
			localError: onLocalError.bind(this)
		});
	};

	/**
	 * Removes the Bellhop communication layer altogether.
	 * @protected
	 * @method destroyClient
	 */
	p.destroyClient = function()
	{
		if (this.client)
		{
			this.client.destroy();
			this.client = null;
		}
	};

	/**
	 * Handle the local errors
	 * @method onLocalError
	 * @private
	 * @param  {Event} event Bellhop event
	 */
	var onLocalError = function(event)
	{
		this.trigger(event.type, event.data);
	};

	/**
	 * The game is starting to load
	 * @method onLoading
	 * @private
	 */
	var onLoading = function()
	{
		/**
		 * Event when a application start loading, first even received
		 * from the Application.
		 * @event opening
		 */
		this.trigger('opening');
	};

	/**
	 * Reset the mutes for audio and captions
	 * @method onLoadDone
	 * @private
	 */
	var onLoadDone = function()
	{
		this.loading = false;
		this.loaded = true;
		this.main.removeClass('loading');

		var plugins = Container._plugins;
		for (var i = 0; i < plugins.length; i++)
		{
			plugins[i].opened.call(this);
		}

		/**
		 * Event when the application gives the load done signal
		 * @event opened
		 */
		this.trigger('opened');
	};

	/**
	 * The application ended and destroyed itself
	 * @method onEndGame
	 * @private
	 */
	var onEndGame = function()
	{
		this.reset();
	};

	/**
	 * Reset all the buttons back to their original setting
	 * and clear the iframe.
	 * @method reset
	 */
	p.reset = function()
	{
		var wasLoaded = this.loaded || this.loading;

		// Destroy in the reverse priority order
		if (wasLoaded)
		{
			var plugins = Container._plugins;
			for (var i = plugins.length - 1; i >= 0; i--)
			{
				plugins[i].closed.call(this);
			}
		}

		// Remove bellhop instance
		this.destroyClient();

		// Reset state
		this.loaded = false;
		this.loading = false;

		// Clear the iframe src location
		this.main.attr('src', '')
			.removeClass('loading');

		if (wasLoaded)
		{
			this.off('localError', this._onCloseFailed);

			/**
			 * Event when a application closes
			 * @event closed
			 */
			this.trigger('closed');
		}
	};

	/**
	 * Tell the application to start closing
	 * @method close
	 */
	p.close = function()
	{
		if (this.loading || this.loaded)
		{
			var plugins = Container._plugins;
			for (var i = plugins.length - 1; i >= 0; i--)
			{
				plugins[i].close.call(this);
			}

			/**
			 * Event when a application starts closing
			 * @event close
			 */
			this.trigger('close');

			/**
			 * There was an uncaught iframe error destroying the game on closing
			 * @event localError
			 * @param {Error} error The error triggered
			 */
			this.once('localError', this._onCloseFailed);

			// Start the close
			this.client.send('close');
		}
		else
		{
			this.reset();
		}
	};

	/**
	 * If there was an error when closing, reset the container
	 * @method _onCloseFailed
	 * @private
	 */
	p._onCloseFailed = function()
	{
		this.reset(); // force close the app
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.reset();

		s.destroy.call(this);

		// Destroy in the reverse priority order
		var plugins = Container._plugins;
		for (var i = plugins.length - 1; i >= 0; i--)
		{
			plugins[i].teardown.call(this);
		}

		this.main = null;
		this.options = null;
		this.dom = null;
	};

	namespace('springroll').Container = Container;

}(document));