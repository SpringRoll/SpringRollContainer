/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var SavedData = springroll.SavedData;

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(100);

	plugin.setup = function()
	{
		/**
		 * Should we send bellhop messages for the mute (etc) buttons?
		 * @property {Boolean} sendMutes
		 * @default true
		 */
		this.sendMutes = true;

		/**
		 * Abstract method to handle the muting
		 * @method _setMuteProp
		 * @protected
		 * @param {string} prop The name of the property to save
		 * @param {jquery} button Reference to the jquery button
		 * @param {boolean} muted  If the button is muted
		 */
		this._setMuteProp = function(prop, button, muted)
		{
			button.removeClass('unmuted muted')
				.addClass(muted ? 'muted' : 'unmuted');

			SavedData.write(prop, muted);
			if (this.client && this.sendMutes)
			{
				this.client.send(prop, muted);
			}
		};

		/**
		 * Disable a button
		 * @method disableButton
		 * @private
		 * @param {jquery} button The button to disable
		 */
		this._disableButton = function(button)
		{
			button.removeClass('enabled')
				.addClass('disabled');
		};
	};

	plugin.teardown = function()
	{
		delete this._disableButton;
		delete this._setMuteProp;
		delete this.sendMutes;
	};

}());