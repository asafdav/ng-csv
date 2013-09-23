/**
 * ng-csv module
 * Export Javascript's arrays to csv files from the browser
 *
 * Author: asafdav - https://github.com/asafdav
 */
angular.module('ngCsv.directives', []).
  directive('ngCsv', ['$parse', function($parse) {
    return {
      restrict: 'AC',
      replace: true,
      transclude: true,
      scope: { data:'&ngCsv', filename:'@filename', header: '&csvHeader'},
      controller: ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) {
        $scope.csv = "";
        $scope.$watch($scope.data, function(newValue, oldValue) {
          $scope.buildCsv(newValue);
        }, true);

        $scope.buildCsv = function(data) {
          var csvContent = "data:text/csv;charset=utf-8,";

          // Check if there's a provided header array
          if (angular.isDefined($attrs.csvHeader)) {
            var header = $scope.$eval($scope.header);
            var encodingArray, headerString;
            if (angular.isArray(header)) {
              encodingArray = header;
            } else {
              encodingArray = [];
              angular.forEach(header, function(title, key){
                this.push(title);
              }, encodingArray);
            }

            headerString = encodingArray.join(",");
            csvContent += headerString + "\n";
          }

          // Process the data
          angular.forEach(data, function(row, index){
            var dataString, infoArray;

            if (angular.isArray(row)) {
              infoArray = row;
            } else {
              infoArray = [];
              angular.forEach(row, function(field, key){
                this.push(field);
              }, infoArray);
            }

            dataString = infoArray.join(",");
            csvContent += index < data.length ? dataString + "\n" : dataString;
          });

          $scope.csv = encodeURI(csvContent);
        };

        $scope.getFilename = function() {
          return $scope.filename ? $scope.filename : "download.csv";
        };
      }],
      template: '<div class="csv-wrap">' +
        '<div class="element" ng-transclude></div>' +
        '<a class="hidden-link" ng-hide="true" ng-href="{{ csv }}" download="{{ getFilename() }}"></a>' +
      '</div>',
      link: function(scope, element, attrs) {
        var subject = angular.element(element.children()[0]),
            link = angular.element(element.children()[1]);

        subject.bind('click', function(e) {
          link[0].click();
        });
      }
    };
  }]);
