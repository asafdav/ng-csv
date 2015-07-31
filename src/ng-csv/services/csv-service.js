/**
 * Created by asafdav on 15/05/14.
 */
angular.module('ngCsv.services').
  service('CSV', ['$q', function ($q) {

    var EOL = '\r\n';
    var BOM = "\ufeff";
    var SEP = "sep=";

    var specialChars = {
      '\\t': '\t',
      '\\b': '\b',
      '\\v': '\v',
      '\\f': '\f',
      '\\r': '\r'
    };

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
        data = data.replace(/"/g, '""'); // Escape double quotes

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
        //responseData = angular.copy(responseData);//moved to row creation
                
        // Add separator if needed
        if (options.addSeparator) {
            var sepString = SEP + (options.fieldSep ? options.fieldSep : ",");
            csvContent += sepString + EOL;
        }         
                
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

        angular.forEach(arrData, function (oldRow, index) {
          var row = angular.copy(arrData[index]);
          var dataString, infoArray;

          infoArray = [];

          angular.forEach(row, function (field, key) {
            this.push(that.stringifyField(field, options));
          }, infoArray);

          dataString = infoArray.join(options.fieldSep ? options.fieldSep : ",");
          csvContent += index < arrData.length ? dataString + EOL : dataString;
        });
                
        //deal with the character set   
        options.charset = options.charset || "utf-8";
        options.charset = options.charset.toLowerCase();  
        if(options.charset === "utf-8") {
          csv = that.utf8Encode(csvContent, options.addByteOrderMarker);
        } else if(options.charset === "utf-16") {
          csv = that.utf16Encode(csvContent, options.addByteOrderMarker);
        } else if(options.charset === "utf-16le") {
          csv = that.utf16leEncode(csvContent);
        } else if(options.charset === "utf-16be") {
          csv = that.utf16beEncode(csvContent);
        } else {
          // Add BOM if needed
          if (options.addByteOrderMarker) {
           csv += BOM;
          }

          // Append the content
          csv += csvContent;
        }
                
        //resolve
        def.resolve(csv);
      });

      if (typeof dataPromise['catch'] === 'function') {
        dataPromise['catch'](function (err) {
          def.reject(err);
        });
      }

      return def.promise;
    };

    /**
     * Helper function to check if input is really a special character
     * @param input
     * @returns {boolean}
     */
    this.isSpecialChar = function(input){
      return specialChars[input] !== undefined;
    };

    /**
     * Helper function to get what the special character was supposed to be
     * since Angular escapes the first backslash
     * @param input
     * @returns {special character string}
     */
    this.getSpecialChar = function (input) {
      return specialChars[input];
    };
        
    /**
     * Helper function to encode the content as a utf-16 byte array
     * @param content
     * @param addBOM
     * @returns {utf-16 encoded byte array}
     */
    this.utf16Encode = function(content, addBOM) {
      var bytes = [];
      if (addBOM) {
        bytes.push(0xfe, 0xff);  //Big Endian Byte Order Marks
      }
            
      for (var i = 0; i < content.length; i++) {
        var charCode = content.charCodeAt(i);
        bytes.push((charCode & 0xff00) >>> 8);  //high byte
        bytes.push(charCode & 0xff);  //low byte
      }
      
      return new Uint8Array(bytes);
    };
        
    /**
     * Helper function to encode the content as a utf-16be byte array
     * @param content
     * @returns {utf-16be encoded byte array}
     */   
    this.utf16beEncode = function (content) {
      return this.utf16Encode(content);
    };
        
    /**
     * Helper function to encode the content as a utf-16le byte array
     * @param content
     * @returns {utf-16le encoded byte array}
     */
    this.utf16leEncode = function (content) {
      var bytes = [];
            
      for (var i = 0; i < content.length; i++) {
        var charCode = content.charCodeAt(i);
        bytes.push(charCode & 0xff);  //low byte
        bytes.push((charCode & 0xff00) >>> 0x8);  //high byte
      }

      return new Uint8Array(bytes);
    };
        
    /**
     * Helper function to encode the content as a utf-8 byte array
     * @param content
     * @param addBOM
     * @returns {utf-8 encoded byte array}
     */
    this.utf8Encode = function(content, addBOM) {
      var bytes = [];
      if (addBOM) {
        bytes.push(0xef, 0xbb, 0xbf);
      }
            
      for (var i = 0; i < content.length; i++) {
        var charCode = content.charCodeAt(i);
                
        if (charCode < 0x80) {
          bytes.push(charCode);
        } else if ((charCode > 0x7f) && (charCode < 0x800)) {
          bytes.push((charCode >> 0x6) | 0xc0);
          bytes.push((charCode & 0x3f) | 0x80);
        } else {
          bytes.push((charCode >> 0xc) | 0xe0);
          bytes.push(((charCode >> 0x6) & 0x3f) | 0x80);
          bytes.push((charCode & 0x3f) | 0x80);
        }
      }
      
      return new Uint8Array(bytes);
    };
  }]);
