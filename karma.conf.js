const [umd] = require('./rollup.config');
module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [{ pattern: 'src/index.spec.js', watched: true }],
    preprocessors: { 'src/**/*.js': ['babel', 'rollup'] },
    rollupPreprocessor: umd,
    reporters: ['progress'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    autoWatch: true,
    concurrency: Infinity,
    browserDisconnectTimeout: 10000
  });
};
