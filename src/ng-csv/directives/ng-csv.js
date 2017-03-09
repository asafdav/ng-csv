/**
 * ng-csv module
 * Export Javascript's arrays to csv files from the browser
 *
 * Author: asafdav - https://github.com/asafdav
 */
angular.module('ngCsv.directives').
  directive('ngCsv', ['$parse', '$q', 'CSV', '$document', '$timeout', function ($parse, $q, CSV, $document, $timeout) {
    return {
      restrict: 'AC',
      scope: {
        data: '&ngCsv',
        filename: '@filename',
        header: '&csvHeader',
        columnOrder: '&csvColumnOrder',
        txtDelim: '@textDelimiter',
        decimalSep: '@decimalSeparator',
        quoteStrings: '@quoteStrings',
        fieldSep: '@fieldSeparator',
        lazyLoad: '@lazyLoad',
        addByteOrderMarker: "@addBom",
        ngClick: '&',
        charset: '@charset',
        label: '&csvLabel'
      },
      controller: [
        '$scope',
        '$element',
        '$attrs',
        '$transclude',
        function ($scope, $element, $attrs, $transclude) {
          $scope.csv = '';

          if (!angular.isDefined($scope.lazyLoad) || $scope.lazyLoad != "true") {
            if (angular.isArray($scope.data)) {
              $scope.$watch("data", function (newValue) {
                $scope.buildCSV();
              }, true);
            }
          }

          $scope.getFilename = function () {
            return $scope.filename || 'download.csv';
          };

          function getBuildCsvOptions() {
            var options = {
              txtDelim: $scope.txtDelim ? $scope.txtDelim : '"',
              decimalSep: $scope.decimalSep ? $scope.decimalSep : '.',
              quoteStrings: $scope.quoteStrings,
              addByteOrderMarker: $scope.addByteOrderMarker
            };
            if (angular.isDefined($attrs.csvHeader)) options.header = $scope.$eval($scope.header);
            if (angular.isDefined($attrs.csvColumnOrder)) options.columnOrder = $scope.$eval($scope.columnOrder);
            if (angular.isDefined($attrs.csvLabel)) options.label = $scope.$eval($scope.label);

            options.fieldSep = $scope.fieldSep ? $scope.fieldSep : ",";

            // Replaces any badly formatted special character string with correct special character
            options.fieldSep = CSV.isSpecialChar(options.fieldSep) ? CSV.getSpecialChar(options.fieldSep) : options.fieldSep;

            return options;
          }

          /**
           * Creates the CSV and updates the scope
           * @returns {*}
           */
          $scope.buildCSV = function () {
            var deferred = $q.defer();
            var data = null;

            $element.addClass($attrs.ngCsvLoadingClass || 'ng-csv-loading');

            data = $scope.data();
            if(angular.isFunction(data)){
              data = data();
            }

            CSV.stringify(data, getBuildCsvOptions()).then(function (csv) {
              $scope.csv = csv;
              $element.removeClass($attrs.ngCsvLoadingClass || 'ng-csv-loading');
              deferred.resolve(csv);
            });
            $scope.$apply(); // Old angular support

            return deferred.promise;
          };
        }
      ],
      link: function (scope, element, attrs) {
        function doClick() {
          var charset = scope.charset || "utf-8";
          var ua = navigator.userAgent.toLowerCase();
          var safari, blob ;
          //To findout safari browser
          if (ua.indexOf('safari') != -1) {
            if (ua.indexOf('chrome') > -1) {
              safari = false; //chrome
            } else {
              safari = true; // Safari
            }
          }
          //IE browsers
          if ( ua.match(/msie/gi) || navigator.appName.match(/Internet/gi) || navigator.msMaxTouchPoints !== void 0 ){ 
            //IE 10+ browsers
            if( window.navigator.msSaveOrOpenBlob ) {
              blob = new Blob([scope.csv], {
                type: "text/csv;charset="+ charset + ";"
              });
              navigator.msSaveBlob(blob, scope.getFilename());
            }else{
              //IE9 and below browsers
              csvData = decodeURIComponent(scope.csv);
              var iframe = angular.element('<iframe></iframe>');
              iframe[0].style.display = "none";
              element.append(iframe);
              var doc = null;
              if (iframe[0].contentDocument)
                  doc = iframe[0].contentDocument;
              else if (iframe[0].contentWindow)
                  doc = iframe[0].contentWindow.document;
              doc.open("data:application/csv;charset=utf-8", "replace");
              doc.write(csvData);
              doc.close();
              iframe.focus();
              if(!doc.execCommand('SaveAs', true, scope.getFilename())){
                //doc.execCommand('SaveAs', true, scope.getFilename()) returns false that means file downloading is failed with '.csv' extension. In IE9 '.csv' extension file not downloading properly, So while file saving is failed with extension '.csv' the same file got success while downloading with '.txt' extension and also we will get saveas option to save the file here we can change extension and file name.
                doc.execCommand('SaveAs', true, scope.getFilename()+'.txt');
              }
            }
          }
          //For safari browser
          else if(safari){
            window.open('data:attachment/csv;filename='+scope.getFilename()+';charset=utf-8,' + encodeURI(scope.csv), "csvWindow");
            window.close();
          }
          //Other than safari and IE browsers
          else {
            blob = new Blob([scope.csv], {
              type: "text/csv;charset="+ charset + ";"
            });
            var downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
            var downloadLink = angular.element(downloadContainer.children()[0]);
            downloadLink.attr('href', window.URL.createObjectURL(blob));
            downloadLink.attr('download', scope.getFilename());
            downloadLink.attr('target', '_blank');

            $document.find('body').append(downloadContainer);
            $timeout(function () {
              downloadLink[0].click();
              downloadLink.remove();
            }, null);
          }
        }

        element.bind('click', function (e) {
          scope.buildCSV().then(function (csv) {
            doClick();
          });
          scope.$apply();
        });
      }
    };
  }]);
