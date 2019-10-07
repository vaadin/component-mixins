const path = require('path');

const USING_TRAVIS = Boolean(process.env.TRAVIS);
const USING_SL = Boolean(process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY);

const SL_LAUNCHERS = {
  'sl-safari-11': {
    base: 'SauceLabs',
    browserName: 'safari',
    version: '11',
    platform: 'macOS 10.13'
  }
};

const HEADLESS_LAUNCHERS = {
  /** See https://github.com/travis-ci/travis-ci/issues/8836#issuecomment-348248951 */
  ChromeHeadlessNoSandbox: {
    base: 'ChromeHeadless',
    flags: ['--no-sandbox']
  },
  FirefoxHeadless: {
    base: 'Firefox',
    flags: ['-headless']
  }
};

function determineBrowsers() {
  if (!USING_TRAVIS) {
    return ['Chrome', 'Firefox'];
  }
  const browsers = [...Object.keys(HEADLESS_LAUNCHERS)];
  if (USING_SL) {
    browsers.push(...Object.keys(SL_LAUNCHERS));
  }
  return browsers;
}

module.exports = config => {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon'],

    browsers: determineBrowsers(),
    browserDisconnectTimeout: 300000,
    browserNoActivityTimeout: 360000,
    captureTimeout: 420000,
    concurrency: USING_SL ? 10 : 1,
    customLaunchers: { ...SL_LAUNCHERS, ...HEADLESS_LAUNCHERS },

    client: {
      mocha: {
        reporter: 'html',
        ui: 'bdd'
      },
      chai: {
        includeStack: true
      }
    },

    files: ['test/index.ts'],

    preprocessors: {
      'test/index.ts': ['webpack', 'sourcemap']
    },

    reporters: ['mocha', 'coverage-istanbul'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,

    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, 'coverage'),
      combineBrowserReports: true,
      skipFilesWithNoCoverage: true,
      thresholds: {
        global: {
          statements: 90,
          lines: 90,
          branches: 90,
          functions: 90
        }
      }
    },

    webpack: {
      devtool: 'inline-source-map',
      mode: 'development',
      resolve: {
        // Enable resolving .ts imports files without extensions
        extensions: ['.ts', '.js'],

        // Prefer ES module dependencies when declared in package.json
        mainFields: ['es2015', 'module', 'main']
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'awesome-typescript-loader',
            options: {
              silent: true,
              useCache: true,
              cacheDirectory: 'node_modules/.cache/awesome-typescript-loader'
            }
          },
          {
            test: /\.ts$/,
            loader: 'istanbul-instrumenter-loader',
            enforce: 'post',
            include: path.resolve('./packages'),
            exclude: /node_modules|\.test\.ts$/,
            options: {
              esModules: true
            }
          }
        ]
      }
    },

    webpackMiddleware: {
      stats: 'errors-only'
    },

    webpackServer: {
      noInfo: true
    }
  });

  // See https://github.com/karma-runner/karma-sauce-launcher/issues/73
  if (USING_TRAVIS) {
    config.set({
      sauceLabs: {
        idleTimeout: 300,
        testName: 'Lit Mixins Unit Tests - CI',
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
      },
      // Attempt to de-flake Sauce Labs tests on Travis CI.
      transports: ['polling'],
      browserDisconnectTolerance: 3,
      reporters: ['saucelabs', 'mocha']
    });
  }
};
