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
        data:'&ngCsv',
        filename:'@filename',
        header: '&csvHeader',
        txtDelim: '@textDelimiter',
        quoteStrings: '@quoteStrings',
        fieldSep: '@fieldSeparator',
        lazyLoad: '@lazyLoad',
        addByteOrderMarker: "@addBom",
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
              quoteStrings: $scope.quoteStrings,
              addByteOrderMarker: $scope.addByteOrderMarker
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

            $element.addClass($attrs.ngCsvLoadingClass || 'ng-csv-loading');

            CSV.stringify($scope.data(), getBuildCsvOptions()).then(function(csv) {
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
						if (window.navigator.msSaveOrOpenBlob) {
							var blob = new Blob([decodeURIComponent(scope.csv)], {
								type: "text/csv;charset=utf-8;"
							});
							navigator.msSaveBlob(blob, scope.getFilename());
						} else {
							if (window.navigator.appName === 'Microsoft Internet Explorer') {
								var iframe = angular.element('<iframe></iframe>');
								iframe[0].style.display = "none";
								element.append(iframe);

								var doc = null;
								if (iframe[0].contentDocument) // FF Chrome
									doc = iframe[0].contentDocument;
								else if (iframe[0].contentWindow) // IE
									doc = iframe[0].contentWindow.document;




								doc.open("text/plain", "replace");
								doc.write([decodeURIComponent(scope.csv)]);
								doc.close();
								iframe.focus();
								doc.execCommand('SaveAs', true, scope.getFilename());
							} else {
								var downloadLink = angular.element('<a></a>');
								downloadLink.attr('href', scope.csv);
								downloadLink.attr('download', scope.getFilename());

								$document.find('body').append(downloadLink);
								$timeout(function () {
									downloadLink[0].click();
									downloadLink.remove();
								}, null);
							}
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
