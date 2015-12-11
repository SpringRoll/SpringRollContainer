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
		 * @property {jquery} helpButton
		 */
		this.helpButton = $(this.options.helpButton)
			.click(function()
				{
					if (!this.paused && !this.helpButton.hasClass('disabled'))
					{
						this.client.send('playHelp');
					}
				}
				.bind(this));

		// Handle pause
		this.on('pause', function(paused)
		{
			// Disable the help button when paused if it's active
			if (paused && !this.helpButton.hasClass('disabled'))
			{
				this.helpButton.data('paused', true);
				this.helpEnabled = false;
			}
			else if (this.helpButton.data('paused'))
			{
				this.helpButton.removeData('paused');
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
				this.helpButton.removeClass('disabled enabled')
					.addClass(enabled ? 'enabled' : 'disabled');

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
		this.on('features', function(features)
			{
				this.helpButton.hide();
				if (features.hints) this.helpButton.show();
			}
			.bind(this));
	};

	plugin.open = function()
	{
		this.client.on('helpEnabled', function(event)
			{
				this.helpEnabled = !!event.data;
			}
			.bind(this));
	};

	plugin.close = function()
	{
		this.client.off('helpEnabled');
		this.helpEnabled = false;
	};

	plugin.teardown = function()
	{
		this.helpButton.off('click');
		delete this.helpButton;
		delete this._helpEnabled;
	};

}());