'use strict';

angular.module('ngClipboard', []).
  value('ZeroClipboardPath', '//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/1.1.7/ZeroClipboard.swf').
  directive('clipCopy', ['$window', 'ZeroClipboardPath', function ($window, ZeroClipboardPath) {
    return {
      scope: {
        clipCopy: '&',
        clipClick: '&'
      },
      restrict: 'A',
      link: function (scope, element, attrs) {
        // Create the clip object
        var clip = new ZeroClipboard( element, {
          moviePath: ZeroClipboardPath,
          trustedDomains: ['*'],
          allowScriptAccess: "always"          
        });

        clip.on( 'mousedown', function(client) {
          client.setText(scope.$eval(scope.clipCopy));
          if (angular.isDefined(attrs.clipClick)) {
            scope.$apply(scope.clipClick);
          }
        });
      }
    }
  }]);
