basePath = '';

files = [
  JASMINE,
  JASMINE_ADAPTER,

  // Libraries
  'bower_components/angular/angular.js',
  'bower_components/angular-sanitize/angular-sanitize.js',
  'bower_components/angular-mocks/angular-mocks.js',

  // App
  'src/ngCsv/*.js',
  'src/ngCsv/directives/*.js',

  // Test specs
  'test/unit/**/*.js',
  'test/unit/**/**/*.js'
];

autoWatch = true;

browsers = ['Chrome'];

// reporters = ['progress'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};