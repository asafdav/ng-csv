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
        fieldSep: '@fieldSeparator'
      },
      controller: ['$scope', '$element', '$attrs', '$transclude', function (
          $scope, $element, $attrs, $transclude
      ) {
        $scope.csv = '';
        $scope.$watch($scope.data, function (newValue) {
          $scope.buildCsv(newValue);
        }, true);

        $scope.$watch('fieldSep', function() {
          $scope.buildCsv($scope.data());
        });

        $scope.$watch('txtDelim', function() {
          $scope.buildCsv($scope.data());
        });

        $scope.buildCsv = function (data) {
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
        };

        $scope.getFilename = function () {
          return $scope.filename || 'download.csv';
        };
      }],
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
        });
      }
    };
  }]);
