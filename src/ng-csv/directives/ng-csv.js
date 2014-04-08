/**
 * ng-csv module
 * Export Javascript's arrays to csv files from the browser
 *
 * Author: asafdav - https://github.com/asafdav
 */
angular.module('ngCsv.directives', []).
  directive('ngCsv', ['$parse', '$q', function ($parse, $q) {
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

            var deferred = $q.defer();
            var promise = deferred.promise;

            promise.then(function () 
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
                    this.push(title);
                  }, encodingArray);
                }

                headerString = encodingArray.join(",");
                csvContent += headerString + "\n";
              }

              var arrData;

              if (angular.isArray(data))
                arrData = data;
              else
                arrData = data();

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
                    this.push(field);
                  }, infoArray);
                }

                dataString = infoArray.join(",");
                csvContent += index < arrData.length ? dataString + "\n" : dataString;
              });

              $scope.csv = encodeURI(csvContent);

              }).then(function () 
              {
                callback();
              });

              deferred.resolve();
            }

            $scope.getFilename = function () 
            {
              return $scope.filename || 'download.csv';
            }
        }
      ],
      template: '<div class="csv-wrap">' +
        '<div class="element" ng-transclude></div>' +
        '<a class="hidden-link" ng-hide="true" ng-href="{{ csv }}" download="{{ getFilename() }}"></a>' +
        '</div>',
      link: function (scope, element, attrs) {
        var subject = angular.element(element.children()[0]),
            link = angular.element(element.children()[1]);

        function doClick()
        {
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
    }
  }]);
