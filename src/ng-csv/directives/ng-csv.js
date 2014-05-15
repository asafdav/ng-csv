/**
 * ng-csv module
 * Export Javascript's arrays to csv files from the browser
 *
 * Author: asafdav - https://github.com/asafdav
 */
angular.module('ngCsv.directives', ['ngCsv.services']).
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
                $scope.buildCsv($scope.data(), function() { } );
              }, true);
            }
          }

          $scope.buildCsv = function (data, callback) 
          {
            var csvContent = "data:text/csv;charset=utf-8,";

            $q.when(data).then(function (responseData)
            {
              // Check if there's a provided header array
              if (angular.isDefined($attrs.csvHeader)) 
              {
                var header = $scope.$eval($scope.header);
                var encodingArray, headerString;

                if (angular.isArray(header)) 
                {
                  encodingArray = header;
                } 
                else 
                {
                  encodingArray = [];
                  angular.forEach(header, function(title, key)
                  {
                    this.push(CSV.stringifyField(title));
                  }, encodingArray);
                }

                headerString = encodingArray.join($scope.fieldSep ? $scope.fieldSep : ",");
                csvContent += headerString + "\n";
              }

              var arrData;

              if (angular.isArray(responseData)) {
                arrData = responseData;
              }
              else {
                arrData = responseData();
              }

              angular.forEach(arrData, function(row, index)
              {
                var dataString, infoArray;

                if (angular.isArray(row)) 
                {
                  infoArray = row;
                } 
                else 
                {
                  infoArray = [];

                  angular.forEach(row, function(field, key)
                  {
                    this.push(CSV.stringifyField(field));
                  }, infoArray);
                }

                dataString = infoArray.join($scope.fieldSep ? $scope.fieldSep : ",");
                csvContent += index < arrData.length ? dataString + "\n" : dataString;
              });

              $scope.csv = encodeURI(csvContent);

              }).then(function() {
                callback();
              });

            };

            $scope.getFilename = function () 
            {
              return $scope.filename || 'download.csv';
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
          scope.buildCsv(scope.data(), function(){
            doClick();
          });

          if (!!scope.ngClick) {
            scope.ngClick();
          }
        });
      }
    };
  }]);
