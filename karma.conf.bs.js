// const [umd] = require('./rollup.config.mjs');
import { umd } from './rollup.config.mjs';
// require('dotenv').config();
module.exports = function(config) {
  config.set({
    customLaunchers: {
      bs_ie_windows_7: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11',
        os: 'Windows',
        os_version: '7'
      }
    },
    browserStack: {
      username: process.env.BROWSER_STACK_USER,
      accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
      video: false
    },
    frameworks: ['mocha', 'chai'],

    files: [{ pattern: 'src/index.spec.js', watched: true }],
    preprocessors: { 'src/**/*.js': ['babel', 'rollup'] },
    rollupPreprocessor: umd,
    reporters: ['progress'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['bs_ie_windows_7'],
    autoWatch: true,
    concurrency: Infinity,
    singleRun: true
  });
};
