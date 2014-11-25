module.exports = function(config) {
  config.set({
    basePath: "",

    files: [

      // Libraries
      'bower_components/angular/angular.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-mocks/angular-mocks.js',

      // App
      'src/ng-csv/*.js',
      'src/ng-csv/directives/*.js',
      'src/ng-csv/services/*.js',

      // Test specs
      'test/unit/**/*.js',
      'test/unit/**/**/*.js'
    ],

    frameworks: ["jasmine"],

    autoWatch: true,

	singleRune:false,

    browsers: ['PhantomJS'],
    //browsers: ['Chrome'],

// reporters = ['progress'];

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }
  });
}
