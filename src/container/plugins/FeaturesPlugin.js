/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(90);

	plugin.open = function()
	{
		this._onFeatures = onFeatures.bind(this);
		this.client.on('features', this._onFeatures);
	};

	plugin.close = function()
	{
		this.client.off('features', this._onFeatures);
		delete this._onFeatures;
	};

	var onFeatures = function(event)
	{
		/**
		 * The features supported by the application
		 * @event features
		 * @param {Boolean} data.vo If VO vo context is supported
		 * @param {Boolean} data.music If music context is supported
		 * @param {Boolean} data.sound If Sound is supported
		 * @param {Boolean} data.sfx If SFX context is supported
		 * @param {Boolean} data.captions If captions is supported
		 * @param {Boolean} data.hints If hinting is supported
		 */
		this.trigger('features', event.data);
	};

}());