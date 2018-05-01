/**
 * @module Container
 * @namespace springroll
 */
(function()
{
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
			if (typeof options === 'boolean')
			{
				options = {
					singlePlay: singlePlay,
					playOptions: playOptions
				};
			}
			options = Object.assign(
				{
					query: '',
					playOptions: null,
					singlePlay: false
				},
				options
			);

			this.release = null;

			fetch(api)
				.then(
					function(response)
					{
						if (this._destroyed) return;

						if (!response.ok)
						{
							return this.trigger('remoteError', result.error);
						}

						response.json().then(
							function(json)
							{
								var release = json.data;
								var err = Features.test(release.capabilities);

								if (err)
								{
									return this.trigger('unsupported', err);
								}

								this.release = release;
								this._internalOpen(release.url + options.query, options);
							}.bind(this)
						);
					}.bind(this)
				)
				.catch(
					function(err)
					{
						if (this._destroyed) return;

						/**
						 * Fired when the API cannot be called
						 * @event remoteFailed
						 */
						return this.trigger('remoteFailed', err);
					}.bind(this)
				);
		};
	};

	plugin.teardown = function()
	{
		delete this.openRemote;
		delete this.release;
	};
})();