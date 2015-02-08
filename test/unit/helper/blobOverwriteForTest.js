var createObjectUrl;

helper = {
  enableBlobForTesting: function() {

    // as in http://stackoverflow.com/questions/15030906/how-to-replace-the-deprecated-blobbuilder-with-the-new-blob-constructor
    Blob = (function() {
      var nativeBlob = Blob;

      // Add unprefixed slice() method.
      if (Blob.prototype.webkitSlice) {
        Blob.prototype.slice = Blob.prototype.webkitSlice;
      }
      else if (Blob.prototype.mozSlice) {
        Blob.prototype.slice = Blob.prototype.mozSlice;
      }

      // Temporarily replace Blob() constructor with one that checks support.
      return function(parts, properties) {
        try {
          Blob.prototype.typeForTest = function() {
            return properties.type.toLowerCase();
          };
          // Restore native Blob() constructor, so this check is only evaluated once.
          Blob = nativeBlob;
          var blobInstance = new Blob(parts || [], properties || {});
          // as defined in http://www.w3.org/TR/FileAPI/#dfn-Blob type should be lower-case
          blobInstance.type = properties.type.toLowerCase();
          return blobInstance;
        }
        catch (e) {
          // If construction fails provide one that uses BlobBuilder.
          Blob = function(parts, properties) {
            var bb = new (WebKitBlobBuilder || MozBlobBuilder), i;
            for (i in parts) {
              bb.append(parts[i]);
            }
            var blob = bb.getBlob(properties && properties.type ? properties.type : undefined);
            blob.type = properties.type.toLowerCase();
            return blob;
          };
        }
      };
    }());
  },
  mockCreateObjectURL: function() {
    window = window || {};
    window.URL = window.URL || {};
    createObjectUrl = window.URL.createObjectURL || {};

  },
  unmockCreateObjectURL: function() {
    window.URL.createObjectURL = createObjectUrl;
  }
};
