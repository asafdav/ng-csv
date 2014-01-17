(function(window, document) {

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
angular.module('ngCsv.directives', []);
angular.module('ngCsv',
    [
        'ngCsv.config',
        'ngCsv.directives',
        'ngSanitize'
    ]);
/**
 * ng-csv module
 * Export Javascript's arrays to csv files from the browser
 *
 * Author: asafdav - https://github.com/asafdav
 */
angular.module('ngCsv.directives', []).
  directive('ngCsv', ['$parse', function ($parse) {
    return {
      restrict: 'AC',
      replace: true,
      transclude: true,
      scope: {
        data:'&ngCsv',
        filename:'@filename',
        header: '&csvHeader',
        txtDelim: '@textDelimiter',
        fieldSep: '@fieldSeparator',
        ngClick: '&'
      },
      controller: [
        '$scope',
        '$element',
        '$attrs',
        '$transclude',
        function ($scope, $element, $attrs, $transclude) {
          $scope.csv = '';

          $scope.$watch(function (newValue) {
            $scope.buildCsv();
          }, true);

          $scope.buildCsv = function () {
            var data = $scope.data();
            var csvContent = 'data:text/csv;charset=utf-8,';

            // Check if there's a provided header array
            var header = $scope.header();
            if (header) {
              var encodingArray = [];
              angular.forEach(header, function (title) {
                this.push(title);
              }, encodingArray);

              var headerString = encodingArray.join($scope.fieldSep || ',');
              csvContent += headerString + '\r\n';
            }

            // Process the data
            angular.forEach(data, function (row, index) {
              var infoArray = [];
              angular.forEach(row, function (field) {
                if (typeof field === 'string' && $scope.txtDelim) {
                  field = $scope.txtDelim + field + $scope.txtDelim;
                }
                this.push(field);
              }, infoArray);
              dataString = infoArray.join($scope.fieldSep || ',');
              csvContent += index < data.length ? dataString + '\r\n' : dataString;
            });

            $scope.csv = encodeURI(csvContent);
            return $scope.csv;
          };

          $scope.getFilename = function () {
            return $scope.filename || 'download.csv';
          };
        }
      ],
      template: '<div class="csv-wrap">' +
        '<div class="element" ng-transclude></div>' +
        '<a class="hidden-link" ng-hide="true" ng-href="{{ csv }}"' +
        ' download="{{ getFilename() }}"></a>' +
        '</div>',
      link: function (scope, element, attrs) {
        var subject = angular.element(element.children()[0]),
            link = angular.element(element.children()[1]);

        subject.bind('click', function (e) {
          link[0].click();
          if (!!scope.ngClick) {
            scope.ngClick();
          }
        });
      }
    };
  }]);
})(window, document);