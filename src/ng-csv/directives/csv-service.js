/**
 * Created by asafdav on 15/05/14.
 */
angular.module('ngCsv.services', []).
  service('CSV', ['$q', function($q)  {

    /**
     * Stringify one field
     * @param data
     * @param delimier
     * @returns {*}
     */
    this.stringifyField = function(data, delimier) {
      if (typeof data === 'string') {
        data = data.replace(/"/g, '""'); // Escape double qoutes
        if (delimier || data.indexOf(',') > -1 ) data = delimier + data + delimier;
        return data;
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
     * @param callback
     */
    this.stringify = function (data, options, callback)
    {
      var that = this;
      var csvContent = "data:text/csv;charset=utf-8,";
      var csv;

      $q.when(data).then(function (responseData)
      {
        // Check if there's a provided header array
        if (angular.isDefined(options.csvHeader))
        {
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
              this.push(that.stringifyField(title));
            }, encodingArray);
          }

          headerString = encodingArray.join(options.fieldSep ? options.fieldSep : ",");
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
              this.push(options.stringifyField(field));
            }, infoArray);
          }

          dataString = infoArray.join(options.fieldSep ? options.fieldSep : ",");
          csvContent += index < arrData.length ? dataString + "\n" : dataString;
        });

        csv = encodeURI(csvContent);

      }).then(function() {
        callback(csv);
      });

    };
  }]);