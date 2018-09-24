module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    reporters: ['karmaHTML', 'progress'],
    client: {
      karmaHTML: {
        auto: true,
        source: [{ src: '/e2e/client.html', tag: 'client' }],
        width: '100vw',
        height: '100vh'
      }
    },
    files: [
      { pattern: 'e2e/**/*.spec.js', watched: false },
      { pattern: 'e2e/*.html', served: true },
      {
        pattern: 'e2e/**/!(*.spec).js',
        watched: true,
        served: true,
        included: false
      }
    ],
    preprocessors: {
      'e2e/**/*.spec.js': ['webpack']
    },
    webpackMiddleware: { stats: 'errors-only' },
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    proxies: {
      '/js/': '/base/e2e/',
      'html/': '/base/e2e'
    }
  });
};
