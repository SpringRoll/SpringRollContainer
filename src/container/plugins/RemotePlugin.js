/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var $ = include('jQuery');
	var Features = include('springroll.Features');

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(30);

	plugin.setup = function()
	{
		/**
		 * The release object from SpringRoll Connect
		 * @property {Object} release
		 */
		this.release = null;

		/**
		 * Open application based on an API Call to SpringRoll Connect
		 * @method openRemote
		 * @param {string} api The path to API call, this can be a full URL
		 * @param {Object} [options] The open options
		 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
		 * @param {Object} [options.playOptions=null] The optional play options
		 * @param {String} [options.query=''] The application query string options (e.g., "?level=1")
		 */
		this.openRemote = function(api, options, playOptions)
		{
			// This should be deprecated, support for old function signature
			if (typeof options === "boolean")
			{
				options = {
					singlePlay: singlePlay,
					playOptions: playOptions
				};
			}
			options = $.extend(
			{
				query: '',
				playOptions: null,
				singlePlay: false
			}, options);

			this.release = null;

			$.getJSON(api, function(result)
					{
						if (this._destroyed) return;

						if (!result.success)
						{
							/**
							 * There was a problem with the API call
							 * @event remoteError
							 */
							return this.trigger('remoteError', result.error);
						}
						var release = result.data;

						var err = Features.test(release.capabilities);

						if (err)
						{
							return this.trigger('unsupported', err);
						}

						this.release = release;

						// Open the application
						this._internalOpen(release.url + options.query, options);
					}
					.bind(this))
				.fail(function()
					{
						if (this._destroyed) return;

						/**
						 * Fired when the API cannot be called
						 * @event remoteFailed
						 */
						return this.trigger('remoteFailed');
					}
					.bind(this));
		};
	};

	plugin.teardown = function()
	{
		delete this.openRemote;
		delete this.release;
	};

}());