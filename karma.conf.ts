// Karma configuration
// Generated on Sun Aug 05 2018 09:06:40 GMT+0900 (Japan Standard Time)

import webpackConfig from './webpack.config';
import { platform } from 'os';

const isCI = process.env.CI === 'true';
let browsers: string[];
if (!isCI) {
  browsers = ['ChromeHeadless'];
} else if (platform() === 'darwin') {
  browsers = ['Safari'];
} else if (platform().startsWith('win')) {
  browsers = ['IE'];
} else if (isCI) {
  browsers = ['ChromeHeadless'];
}

const config = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'mocha',
      // 'karma-typescript'
    ],

    // list of files / patterns to load in the browser
    files: [
      // 'src/**/*.spec.js',
      // 'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.ts': ['webpack'],
      '**/*.tsx': ['webpack'],
    },

    webpack: {
      ...webpackConfig,
      mode: isCI ? 'production' : 'development',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
      'progress',
      // 'karma-typescript',
    ],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: !isCI,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: isCI,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.json',
    },

    browserNoActivityTimeout: 10 * 1000,
  });
};
export default config;
