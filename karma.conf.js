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
  const browsers = [...Object.keys(HEADLESS_LAUNCHERS)];
  if (!USING_TRAVIS) {
    return browsers;
  }
  if (USING_SL) {
    browsers.push(...Object.keys(SL_LAUNCHERS));
  }
  return browsers;
}

module.exports = config => {
  config.set({
    basePath: '',
    frameworks: ['esm', 'mocha', 'chai', 'sinon', 'source-map-support'],

    browsers: determineBrowsers(),
    browserDisconnectTimeout: 300000,
    browserNoActivityTimeout: 360000,
    captureTimeout: 420000,

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

    files: [{ pattern: 'packages/**/*.test.ts', type: 'module' }],

    plugins: [
      // load plugin
      require.resolve('@open-wc/karma-esm'),

      // fallback: resolve any karma- plugins
      'karma-*'
    ],

    reporters: ['mocha', 'coverage-istanbul'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,

    mochaReporter: {
      showDiff: true
    },

    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: 'coverage',
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

    esm: {
      coverage: true,
      babel: true,
      nodeResolve: true,
      fileExtensions: ['.ts'],
      compatibility: 'esm',
      babelModernExclude: [
        '**/node_modules/sinon/**/*',
        '**/node_modules/mocha/**/*',
        '**/node_modules/chai/**/*',
        '**/node_modules/sinon/chai/**/*'
      ],
      customBabelConfig: {
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            {
              decoratorsBeforeExport: true
            }
          ],
          '@babel/plugin-proposal-class-properties'
        ],
        presets: ['@babel/preset-typescript']
      }
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
      concurrency: 10,
      transports: ['polling'],
      browserDisconnectTolerance: 3,
      reporters: ['saucelabs', 'mocha']
    });
  }
};
