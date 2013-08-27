// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
angular.module('ngCsv.config', []).
  value('ngCsv.config', {
      debug: true
  }).
  config(['$compileProvider', function($compileProvider){
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
  }]);

// Modules
angular.module('ngCsv.directives', []);
angular.module('ngCsv',
    [
        'ngCsv.config',
        'ngCsv.directives',
        'ngSanitize'
    ]);
