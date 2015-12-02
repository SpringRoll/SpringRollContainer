/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var Container;

	/**
	 * Responsible for creating properties, methods to 
	 * the SpringRoll Container when it's created.
	 *
	 *	var plugin = new ContainerPlugin();
	 *	plugin.setup = function()
	 *	{
	 *		// Do setup here
	 *	};
	 *
	 * @class ContainerPlugin
	 * @constructor
	 * @param {int} [priority=0] The priority, higher priority
	 *        plugins are setup, preloaded and destroyed first.
	 */
	var ContainerPlugin = function(priority)
	{
		if (!Container)
		{
			Container = include('springroll.Container');
		}

		/**
		 * The priority of the plugin. Higher numbers handled first. This should be set
		 * in the constructor of the extending ContainerPlugin.
		 * @property {int} priority
		 * @default 0
		 * @private
		 */
		this.priority = priority || 0;

		/**
		 * When the Container is being initialized. This function 
		 * is bound to the Container. This should be overridden.
		 * @method setup
		 */
		this.setup = function() {};

		/**
		 * Called when an application is opening and before the 
		 * app has completely finished loading.
		 * @method open 
		 */
		this.open = function() {};

		/**
		 * Called when an application is opening and before the 
		 * app has completely finished loading.
		 * @method opened 
		 */
		this.opened = function() {};

		/**
		 * Called when an application has begun to be closed.
		 * @method close 
		 */
		this.close = function() {};

		/**
		 * Called when an application is closed completely.
		 * @method closed
		 */
		this.closed = function() {};

		/**
		 * When the Container is being destroyed. This function 
		 * is bound to the Container. This should be overridden.
		 * @method teardown
		 */
		this.teardown = function() {};

		// Add the plugin to Container
		Container._plugins.push(this);
		Container._plugins.sort(function(a, b)
		{
			return b.priority - a.priority;
		});
	};

	// Assign to namespace
	namespace('springroll').ContainerPlugin = ContainerPlugin;

}());