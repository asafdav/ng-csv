// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
angular.module('ngCsv.config', []).
  value('ngCsv.config', {
      debug: true
  }).
  config(['$compileProvider', function($compileProvider){
    if (angular.isDefined($compileProvider.urlSanitizationWhitelist)) {
      $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
    } else {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
    }
  }]);

// Modules
angular.module('ngCsv.directives', ['ngCsv.services']);
angular.module('ngCsv.services', []);
angular.module('ngCsv',
    [
        'ngCsv.config',
        'ngCsv.services',
        'ngCsv.directives',
        'ngSanitize'
    ]);

// Common.js package manager support (e.g. ComponentJS, WebPack)
if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'ngCsv';
}
