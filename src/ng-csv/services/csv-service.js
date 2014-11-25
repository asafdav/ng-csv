/**
 * Created by asafdav on 15/05/14.
 */
angular.module('ngCsv.services').
  service('CSV', ['$q', function($q)  {

    var EOL = encodeURIComponent('\r\n');
    var BOM = "%ef%bb%bf";
    var DATA_URI_PREFIX = "data:text/csv;charset=utf-8,";

    /**
     * Stringify one field
     * @param data
     * @param delimier
     * @returns {*}
     */
    this.stringifyField = function(data, delimier, quoteText) {
      if (typeof data === 'string') {
        data = data.replace(/"/g, '""'); // Escape double qoutes
        if (quoteText || data.indexOf(',') > -1 || data.indexOf('\n') > -1 || data.indexOf('\r') > -1) data = delimier + data + delimier;
        return encodeURIComponent(data);
      }

      if (typeof data === 'boolean') {
        return data ? 'TRUE' : 'FALSE';
      }

      return data;
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
    this.stringify = function (data, options)
    {
      var def = $q.defer();

      var that = this;
      var csv;
      var csvContent = "";

      var dataPromise = $q.when(data).then(function (responseData)
      {
        responseData = angular.copy(responseData);
        // Check if there's a provided header array
        if (angular.isDefined(options.header) && options.header)
        {
          var encodingArray, headerString;

          encodingArray = [];
          angular.forEach(options.header, function(title, key)
          {
            this.push(that.stringifyField(title, options.txtDelim, options.quoteStrings));
          }, encodingArray);

          headerString = encodingArray.join(options.fieldSep ? options.fieldSep : ",");
          csvContent += headerString + EOL;
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

          infoArray = [];

          angular.forEach(row, function(field, key)
          {
            this.push(that.stringifyField(field, options.txtDelim, options.quoteStrings));
          }, infoArray);

          dataString = infoArray.join(options.fieldSep ? options.fieldSep : ",");
          csvContent += index < arrData.length ? dataString + EOL : dataString;
        });

        // IE uses the BLOB way so no need for DATA_URI_PREFIX
        if(!window.navigator.msSaveOrOpenBlob) {
          csv = DATA_URI_PREFIX;
        }

        // Add BOM if needed
        if (options.addByteOrderMarker){
            csv += BOM;
        }

        // Append the content and resolve.
        csv += csvContent;
        def.resolve(csv);
      });

      if (typeof dataPromise['catch'] === 'function') {
        dataPromise['catch'](function(err) {
          def.reject(err);
        });
      }

      return def.promise;
    };
  }]);
