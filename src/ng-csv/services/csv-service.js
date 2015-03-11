/**
 * Created by asafdav on 15/05/14.
 */
angular.module('ngCsv.services').
  service('CSV', ['$q', function ($q) {

    var EOL = '\r\n';
    var BOM = "\ufeff";

    /**
     * Stringify one field
     * @param data
     * @param options
     * @returns {*}
     */
    this.stringifyField = function (data, options) {
      if (options.decimalSep === 'locale' && this.isFloat(data)) {
        return data.toLocaleString();
      }

      if (options.decimalSep !== '.' && this.isFloat(data)) {
        return data.toString().replace('.', options.decimalSep);
      }

      if (typeof data === 'string') {
        data = data.replace(/"/g, '""'); // Escape double qoutes

        if (options.quoteStrings || data.indexOf(',') > -1 || data.indexOf('\n') > -1 || data.indexOf('\r') > -1) {
            data = options.txtDelim + data + options.txtDelim;
        }

        return data;
      }

      if (typeof data === 'boolean') {
        return data ? 'TRUE' : 'FALSE';
      }

      return data;
    };

    /**
     * Helper function to check if input is float
     * @param input
     * @returns {boolean}
     */
    this.isFloat = function (input) {
      return +input === input && (!isFinite(input) || Boolean(input % 1));
    };

    /**
     * Creates a csv from a data array
     * @param data
     * @param options
     *  * header - Provide the first row (optional)
     *  * fieldSep - Field separator, default: ',',
     *  * addByteOrderMarker - Add Byte order mark, default(false)
     * @param callback
     */
    this.stringify = function (data, options) {
      var def = $q.defer();

      var that = this;
      var csv = "";
      var csvContent = "";

      var dataPromise = $q.when(data).then(function (responseData) {
        responseData = angular.copy(responseData);
        // Check if there's a provided header array
        if (angular.isDefined(options.header) && options.header) {
          var encodingArray, headerString;

          encodingArray = [];
          angular.forEach(options.header, function (title, key) {
            this.push(that.stringifyField(title, options));
          }, encodingArray);

          headerString = encodingArray.join(options.fieldSep ? options.fieldSep : ",");
          csvContent += headerString + EOL;
        }

        var arrData = [];

        if (angular.isArray(responseData)) {
          arrData = responseData;
        }
        else if (angular.isFunction(responseData)) {
          arrData = responseData();
        }

        angular.forEach(arrData, function (row, index) {
          var dataString, infoArray;

          infoArray = [];

          angular.forEach(row, function (field, key) {
            this.push(that.stringifyField(field, options));
          }, infoArray);

          dataString = infoArray.join(options.fieldSep ? options.fieldSep : ",");
          csvContent += index < arrData.length ? dataString + EOL : dataString;
        });

        // Add BOM if needed
        if (options.addByteOrderMarker) {
          csv += BOM;
        }

        // Append the content and resolve.
        csv += csvContent;
        def.resolve(csv);
      });

      if (typeof dataPromise['catch'] === 'function') {
        dataPromise['catch'](function (err) {
          def.reject(err);
        });
      }

      return def.promise;
    };
  }]);
