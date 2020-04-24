const USING_TRAVIS = Boolean(process.env.TRAVIS);
const USING_SAUCE = process.env.TEST_PLATFORM === 'sauce';

const SL_LAUNCHERS = {
  'sl-safari-latest': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'macOS 10.13',
    version: 'latest'
  },
  'sl-ios-13': {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'iPhone X Simulator',
    version: '13.0'
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
    /** See https://stackoverflow.com/a/56136787 */
    prefs: {
      'toolkit.telemetry.reportingpolicy.firstRun': false
    },
    flags: ['-headless']
  }
};

function determineBrowsers() {
  return [...Object.keys(USING_SAUCE ? SL_LAUNCHERS : HEADLESS_LAUNCHERS)];
}

module.exports = config => {
  config.set({
    basePath: '',
    frameworks: ['esm', 'mocha', 'sinon-chai', 'source-map-support'],
    singleRun: true,
    browsers: determineBrowsers(),
    browserDisconnectTimeout: 300000,
    browserDisconnectTolerance: 2,
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

    reporters: ['mocha', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,

    mochaReporter: {
      showDiff: true
    },

    coverageReporter: {
      reporters: [{ type: 'html' }, { type: 'lcovonly' }, { type: 'text-summary' }],
      dir: 'coverage',
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
      compatibility: 'none',
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

  if (USING_SAUCE) {
    config.set({
      sauceLabs: {
        testName: 'Lit Mixins Unit Tests - CI',
        recordVideo: false,
        recordScreenshots: false,
        idleTimeout: 600,
        commandTimeout: 600,
        maxDuration: 5400,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
      },
      concurrency: 10,
      transports: ['polling'],
      browserDisconnectTolerance: 3,
      reporters: ['dots', 'mocha']
    });

    if (USING_TRAVIS) {
      config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
    }
  }
};
