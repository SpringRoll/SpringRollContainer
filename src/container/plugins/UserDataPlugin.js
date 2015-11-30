/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var SavedDataHandler = include('springroll.SavedDataHandler');

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(40);

	plugin.setup = function()
	{
		/**
		 * The external handler class, must include `remove`, `write`, `read` methods
		 * make it possible to use something else to handle the external, default
		 * is to use cookies/localStorage. See {{#crossLink "springroll.SavedDataHandler"}}{{/crossLink}}
		 * as an example.
		 * @property {Object} userDataHandler
		 * @default springroll.SavedDataHandler
		 */
		this.userDataHandler = new SavedDataHandler();
	};

	plugin.open = function()
	{
		this.client.on(
		{
			userDataRemove: onUserDataRemove.bind(this),
			userDataRead: onUserDataRead.bind(this),
			userDataWrite: onUserDataWrite.bind(this),
		});
	};

	/**
	 * Handler for the userDataRemove event
	 * @method onUserDataRemove
	 * @private
	 */
	var onUserDataRemove = function(event)
	{
		var client = this.client;
		this.userDataHandler.remove(event.data, function()
		{
			client.send(event.type);
		});
	};

	/**
	 * Handler for the userDataRead event
	 * @method onUserDataRead
	 * @private
	 */
	var onUserDataRead = function(event)
	{
		var client = this.client;
		this.userDataHandler.read(event.data, function(value)
		{
			client.send(event.type, value);
		});
	};

	/**
	 * Handler for the userDataWrite event
	 * @method onUserDataWrite
	 * @private
	 */
	var onUserDataWrite = function(event)
	{
		var data = event.data;
		var client = this.client;
		this.userDataHandler.write(data.name, data.value, function()
		{
			client.send(event.type);
		});
	};

	plugin.teardown = function()
	{
		this.userDataHandler = null;
	};

}());