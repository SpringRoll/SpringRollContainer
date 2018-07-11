/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(50);

	plugin.setup = function()
	{
		/**
		 * Reference to the help button
		 * @property {HTMLElement} helpButton
		 */
		this.helpButton = document.querySelector(this.options.helpButton);

		if (null === this.helpButton)
		{
			return;
		}

		// store the listener so that we can use it later
		this.helpButtonClick = function()
		{
			if (!this.paused && !this.helpButton.classList.contains('disabled'))
			{
				this.client.send('playHelp');
			}
		}.bind(this);

		this.helpButton.addEventListener('click', this.helpButtonClick);

		this.helpButton.tooltip = function()
		{
			// TODO: Add non jQuery tool tips
		};

		// Handle pause
		this.on('pause', function(paused)
		{
			// Disable the help button when paused if it's active
			if (paused && !this.helpButton.classList.contains('disabled'))
			{
				this.helpButton.setAttribute('data-paused', true);
				this.helpEnabled = false;
			}
			else if (this.helpButton.getAttribute('data-paused'))
			{
				this.helpButton.setAttribute('data-paused', '');
				this.helpEnabled = true;
			}
		});

		/**
		 * Set the captions are muted
		 * @property {Boolean} helpEnabled
		 */
		Object.defineProperty(this, 'helpEnabled',
		{
			set: function(enabled)
			{
				this._helpEnabled = enabled;
				this.helpButton.classList.remove('disabled');
				this.helpButton.classList.remove('enabled');
				this.helpButton.classList.add(enabled ? 'enabled' : 'disabled');

				/**
				 * Fired when the enabled status of the help button changes
				 * @event helpEnabled
				 * @param {boolean} enabled If the help button is enabled
				 */
				this.trigger('helpEnabled', enabled);
			},
			get: function()
			{
				return this._helpEnabled;
			}
		});

		// Handle features changed
		this.on(
			'features',
			function(features)
			{
				this.helpButton.style.display = 'none';
				if (features.hints) this.helpButton.style.display = 'inline-block';
			}.bind(this)
		);
	};

	plugin.open = function()
	{
		this.client.on(
			'helpEnabled',
			function(event)
			{
				this.helpEnabled = !!event.data;
			}.bind(this)
		);
	};

	plugin.close = function()
	{
		this.client.off('helpEnabled');
		this.helpEnabled = false;
	};

	plugin.teardown = function()
	{
		if (null === this.helpButton)
		{
			return;
		}

		this.helpButton.removeEventListener('click', this.helpButtonClick);
		delete this.helpButton;
		delete this._helpEnabled;
	};
})();
