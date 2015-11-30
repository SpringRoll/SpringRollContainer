module.exports = function(grunt)
{
	require('library-grunt')(grunt,
	{
		themePath: '../SpringRollTheme',
		data:
		{
			// Path to the main SpringRoll repo
			corePath: '../SpringRoll',

			// The list of core files to import
			// this should mirror the files in the
			// library.json main list of files
			coreFiles: [
				"src/mixins/Object.js",
				"src/utils/*.js",
				"src/events/EventDispatcher.js",
				"src/core/PageVisibility.js",
				"src/core/utils/SavedData.js"
			]
		}
	});
};