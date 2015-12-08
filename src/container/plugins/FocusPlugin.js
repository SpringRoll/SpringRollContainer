/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var PageVisibility = include('springroll.PageVisibility');

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(90);

	plugin.setup = function()
	{
		// Add the default option for pauseFocusSelector
		this.options = $.extend(
			{
				pauseFocusSelector: '.pause-on-focus'
			},
			this.options);

		/**
		 * Handle the page visiblity change events, like opening a new tab
		 * or blurring the current page.
		 * @property {springroll.PageVisibility} _pageVisibility
		 * @private
		 */
		this._pageVisibility = new PageVisibility(
			onContainerFocus.bind(this),
			onContainerBlur.bind(this)
		);

		/**
		 * Whether the Game is currently "blurred" (not focused) - for pausing/unpausing
		 * @property {Boolean} _appBlurred
		 * @private
		 * @default  false
		 */
		this._appBlurred = false;

		/**
		 * Always keep the focus on the application iframe
		 * @property {Boolean} _keepFocus
		 * @private
		 * @default  false
		 */
		this._keepFocus = false;

		/**
		 * Whether the Container is currently "blurred" (not focused) - for pausing/unpausing
		 * @property {Boolean} _containerBlurred
		 * @private
		 * @default  false
		 */
		this._containerBlurred = false;

		/**
		 * Delays pausing of application to mitigate issues with asynchronous communication
		 * between Game and Container
		 * @property {int} _focusTimer
		 */
		this._focusTimer = null;

		// Focus on the window on focusing on anything else
		// without the .pause-on-focus class
		this._onDocClick = onDocClick.bind(this);
		$(document).on('focus click', this._onDocClick);

		/**
		 * Focus on the iframe's contentWindow
		 * @method focus
		 */
		this.focus = function()
		{
			this.dom.contentWindow.focus();
		};

		/**
		 * Unfocus on the iframe's contentWindow
		 * @method blur
		 */
		this.blur = function()
		{
			this.dom.contentWindow.blur();
		};

		/**
		 * Manage the focus change events sent from window and iFrame
		 * @method manageFocus
		 * @protected
		 */
		this.manageFocus = function()
		{
			// Unfocus on the iframe
			if (this._keepFocus)
			{
				this.blur();
			}

			// we only need one delayed call, at the end of any
			// sequence of rapidly-fired blur/focus events
			if (this._focusTimer)
			{
				clearTimeout(this._focusTimer);
			}

			// Delay setting of 'paused' in case we get another focus event soon.
			// Focus events are sent to the container asynchronously, and this was
			// causing rapid toggling of the pause state and related issues,
			// especially in Internet Explorer
			this._focusTimer = setTimeout(
				function()
				{
					this._focusTimer = null;
					// A manual pause cannot be overriden by focus events.
					// User must click the resume button.
					if (this._isManualPause) return;

					this.paused = this._containerBlurred && this._appBlurred;

					// Focus on the content window when blurring the app
					// but selecting the container
					if (this._keepFocus && !this._containerBlurred && this._appBlurred)
					{
						this.focus();
					}

				}.bind(this),
				100
			);
		};

		// On elements with the class name pause-on-focus
		// we will pause the game until a blur event to that item
		// has been sent
		var self = this;
		$(this.options.pauseFocusSelector).on('focus', function()
		{
			self._isManualPause = self.paused = true;
			$(this).one('blur', function()
			{
				self._isManualPause = self.paused = false;
				self.focus();
			});
		});
	};

	/**
	 * When the document is clicked
	 * @method _onDocClicked
	 * @private
	 * @param  {Event} e Click or focus event
	 */
	var onDocClick = function(e)
	{
		if (!this.loaded) return;

		var target;

		// Firefox support
		if (e.originalEvent.explicitOriginalTarget)
		{
			target = $(e.originalEvent.explicitOriginalTarget);
		}
		else
		{
			target = $(e.target);
		}
		if (!target.filter(this.options.pauseFocusSelector).length)
		{
			this.focus();
			return false;
		}
	};

	/**
	 * Handle the keep focus event for the window
	 * @method onKeepFocus
	 * @private
	 */
	var onKeepFocus = function(event)
	{
		this._keepFocus = !!event.data;
		this.manageFocus();
	};

	/**
	 * Handle focus events sent from iFrame children
	 * @method onFocus
	 * @private
	 */
	var onFocus = function(e)
	{
		this._appBlurred = !e.data;
		this.manageFocus();
	};

	/**
	 * Handle focus events sent from container's window
	 * @method onContainerFocus
	 * @private
	 */
	var onContainerFocus = function(e)
	{
		this._containerBlurred = false;
		this.manageFocus();
	};

	/**
	 * Handle blur events sent from container's window
	 * @method onContainerBlur
	 * @private
	 */
	var onContainerBlur = function(e)
	{
		//Set both container and application to blurred,
		//because some blur events are only happening on the container.
		//If container is blurred because application area was just focused,
		//the application's focus event will override the blur imminently.
		this._containerBlurred = this._appBlurred = true;
		this.manageFocus();
	};

	plugin.open = function()
	{
		this.client.on(
		{
			focus: onFocus.bind(this),
			keepFocus: onKeepFocus.bind(this),
		});
	};

	plugin.opened = function()
	{
		this.focus();
	};

	plugin.close = function()
	{
		// Stop the focus timer if it's running
		if (this._focusTimer)
		{
			clearTimeout(this._focusTimer);
		}
	};

	plugin.teardown = function()
	{
		$(this.options.pauseFocusSelector).off('focus');
		$(document).off('focus click', this._onDocClick);
		delete this._onDocClick;
		if (this._pageVisibility)
		{
			this._pageVisibility.destroy();
			delete this._pageVisibility;
		}
		delete this.focus;
		delete this.blur;
		delete this.manageFocus;
		delete this._appBlurred;
		delete this._focusTimer;
		delete this._keepFocus;
		delete this._containerBlurred;
	};

}());