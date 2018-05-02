/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(80);

	plugin.setup = function()
	{
		/**
		 * Reference to the pause application button
		 * @property {HTMLElement} pauseButton
		 */
		this.pauseButton = document.querySelectorAll(this.options.pauseButton);

		this.toggleButtonStyles = function(element, paused)
		{
			element.classList.remove('unpaused');
			element.classList.remove('paused');

			element.classList.add(paused ? 'paused' : 'unpaused');
		}.bind(this);

		this.isNodeList = function(nodeList)
		{
			return (
				typeof nodeList.length !== 'undefined' &&
				typeof nodeList.item !== 'undefined'
			);
		};

		if (this.isNodeList(this.pauseButton))
		{
			for (var i = 0, length = this.pauseButton.length; i < length; i++)
			{
				this.pauseButton[i].addEventListener('click', onPauseToggle.bind(this));
			}
		}
		else
		{
			this.pauseButton.addEventListener('click', onPauseToggle.bind(this));
		}

		/**
		 * If the application is currently paused manually
		 * @property {boolean} _isManualPause
		 * @private
		 * @default false
		 */
		this._isManualPause = false;

		/**
		 * If the current application is paused
		 * @property {Boolean} _disablePause
		 * @private
		 * @default false
		 */
		this._disablePause = false;

		/**
		 * If the current application is paused
		 * @property {Boolean} _paused
		 * @private
		 * @default false
		 */
		this._paused = false;

		/**
		 * If the current application is paused
		 * @property {Boolean} paused
		 * @default false
		 */
		Object.defineProperty(this, 'paused',
		{
			set: function(paused)
			{
				if (!this._disablePause)
				{
					this._paused = paused;

					if (this.client)
					{
						this.client.send('pause', paused);
					}
					/**
					 * Fired when the pause state is toggled
					 * @event pause
					 * @param {boolean} paused If the application is now paused
					 */
					/**
					 * Fired when the application resumes from a paused state
					 * @event resumed
					 */
					/**
					 * Fired when the application becomes paused
					 * @event paused
					 */
					this.trigger(paused ? 'paused' : 'resumed');
					this.trigger('pause', paused);

					// Set the pause button state
					if (this.pauseButton)
					{
						if (this.isNodeList(this.pauseButton))
						{
							for (
								var i = 0, length = this.pauseButton.length; i < length; i++
							)
							{
								this.toggleButtonStyles(this.pauseButton[i], paused);
							}
						}
						else
						{
							this.toggleButtonStyles(this.pauseButton);
						}
					}
				}
			},
			get: function()
			{
				return this._paused;
			}
		});

		this.on(
			'features',
			function(features)
			{
				if (features.disablePause) this._disablePause = true;
			}.bind(this)
		);
	};

	/**
	 * Toggle the current paused state of the application
	 * @method onPauseToggle
	 * @private
	 */
	var onPauseToggle = function()
	{
		this.paused = !this.paused;
		this._isManualPause = this.paused;
	};

	plugin.opened = function()
	{
		if (this.isNodeList(this.pauseButton))
		{
			for (var i = 0, length = this.pauseButton.length; i < length; i++)
			{
				this.pauseButton[i].classList.remove('disabled');
			}
			i = undefined;
			length = undefined;
		}
		else
		{
			this.pauseButton.classList.remove('disabled');
		}
		// Reset the paused state
		this.paused = this._paused;
	};

	plugin.close = function()
	{
		this._disableButton(this.pauseButton);
		this.paused = false;
	};

	plugin.teardown = function()
	{
		if (this.isNodeList(this.pauseButton))
		{
			for (var i = 0, length = this.pauseButton.length; i < length; i++)
			{
				this.pauseButton[i].removeEventListener(
					'click',
					onPauseToggle.bind(this)
				);
			}
			i = undefined;
			length = undefined;
		}
		else
		{
			this.pauseButton.removeEventListener('click', onPauseToggle.bind(this));
		}
		delete this.pauseButton;
		delete this._isManualPause;
		delete this._paused;
	};
})();