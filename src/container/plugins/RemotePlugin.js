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
			options = Object.merge(
				{
					query: '',
					playOptions: null,
					singlePlay: false
				},
				options
			);

			this.release = null;

			var xhttp = new XMLHttpRequest();

			xhttp.onResponse = function(release)
			{
				var err = Features.test(release.capabilities);

				if (err)
				{
					return this.trigger('unsupported', err);
				}

				this.release = release;
				this._internalOpen(release.url + options.query, options);
			}.bind(this);

			xhttp.onreadystatechange = function()
			{
				if (this.readyState == 4 && this.status == 200)
				{
					this.onResponse(JSON.parse(this.response).data);
				}
			};

			xhttp.open('GET', api, true);
			xhttp.send();
		};
	};

	plugin.teardown = function()
	{
		delete this.openRemote;
		delete this.release;
	};
})();