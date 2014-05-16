/**
 * ng-csv module
 * Export Javascript's arrays to csv files from the browser
 *
 * Author: asafdav - https://github.com/asafdav
 */
angular.module('ngCsv.directives').
  directive('ngCsv', ['$parse', '$q', 'CSV', function ($parse, $q, CSV) {
    return {
      restrict: 'AC',
      replace: true,
      transclude: true,
      scope: {
        data:'&ngCsv',
        filename:'@filename',
        header: '&csvHeader',
        txtDelim: '@textDelimiter',
        quoteStrings: '@quoteStrings',
        fieldSep: '@fieldSeparator',
        lazyLoad: '@lazyLoad',
        ngClick: '&'
      },
      controller: [
        '$scope',
        '$element',
        '$attrs',
        '$transclude',
        function ($scope, $element, $attrs, $transclude) {
          $scope.csv = '';

          if (!angular.isDefined($scope.lazyLoad) || $scope.lazyLoad != "true")
          {
            if (angular.isArray($scope.data))
            {
              $scope.$watch("data", function (newValue) {
                $scope.buildCSV();
              }, true);
            }
          }

          $scope.getFilename = function ()
          {
            return $scope.filename || 'download.csv';
          };

          function getBuildCsvOptions() {
            var options = {
              txtDelim: $scope.txtDelim ? $scope.txtDelim : '"',
              quoteStrings: $scope.quoteStrings
            };
            if (angular.isDefined($attrs.csvHeader)) options.header = $scope.$eval($scope.header);
            options.fieldSep = $scope.fieldSep ? $scope.fieldSep : ",";

            return options;
          }

          /**
           * Creates the CSV and updates the scope
           * @returns {*}
           */
          $scope.buildCSV = function() {
            var deferred = $q.defer();

            CSV.stringify($scope.data(), getBuildCsvOptions()).then(function(csv) {
              $scope.csv = csv;
              deferred.resolve(csv);
            });
            $scope.$apply(); // Old angular support

            return deferred.promise;
          };
        }
      ],
      template: '<div class="csv-wrap">' +
        '<div class="element" ng-transclude></div>' +
        '<a class="hidden-link" ng-hide="true" ng-href="{{ csv }}" download="{{ getFilename() }}"></a>' +
        '</div>',
      link: function (scope, element, attrs) {
        var subject = angular.element(element.children()[0]),
            link = angular.element(element.children()[1]);

        function doClick() {
          link[0].href = "";
          link[0].click();
          link[0].href = scope.csv;
          link[0].click();
        }

        subject.bind('click', function (e) 
        {
          scope.buildCSV().then(function(csv) {
            doClick();
          });

          if (!!scope.ngClick) {
            scope.ngClick();
          }
        });
      }
    };
  }]);
