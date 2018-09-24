require('dotenv').config();
module.exports = function(config) {
  config.set({
    customLaunchers: {
      bs_chrome_mac: {
        base: 'BrowserStack',
        browser: 'chrome',
        browser_version: '69.0',
        os: 'OS X',
        os_version: 'Yosemite'
      },
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
    frameworks: ['mocha', 'chai', 'polyfill'],
    polyfill: [
      'Promise',
      'fetch',
      'Array.prototype.forEach',
      'Object.assign',
      'AudioContext'
    ],
    files: [{ pattern: 'src/**/*.spec.js', watched: false }],
    preprocessors: {
      'src/**/*.js': ['babel'],
      'src/**/*.spec.js': ['webpack']
    },
    babelPreprocessor: {
      presets: () => [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'entry',
            targets: {
              ie: '11'
            }
          }
        ]
      ]
    },
    webpackMiddleware: { stats: 'errors-only' },
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
