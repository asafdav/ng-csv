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
          var stringifyCell = function(data) {
            if (typeof data === 'string') {
              data = data.replace(/"/g, '""'); // Escape double qoutes
              if ($scope.txtDelim) data = $scope.txtDelim + data + $scope.txtDelim;
              return data;
            }

            if (typeof data === 'boolean') {
              return data ? 'TRUE' : 'FALSE';
            }

            return data;
          };

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
                this.push(stringifyCell(field));
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
