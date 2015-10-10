'use strict';
/* jshint indent: 2*/
// Set the jasmine fixture path
// jasmine.getFixtures().fixturesPath = 'base/';

describe('ngCsv directive', function () {

  var $compile;
  var $rootScope;
  var $timeout;

  // Load the myApp module, which contains the directive
  beforeEach(module('ngCsv.directives'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function (_$compile_, _$rootScope_, $q, _$timeout_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $rootScope.test = [[1, 2, 3], [4, 5, 6]];
    $rootScope.testObj = [{a: 1, b: 2, c: 3}, {a: 4, b: 5, c: 6}];
    $rootScope.testDecimal = [[13.37]];

    var _deferred = $q.defer();
    _deferred.resolve([[1, 2, 3], [4, 5, 6]]);
    $rootScope.testPromise = _deferred.promise;

    _deferred = $q.defer();
    $timeout(function(){_deferred.resolve([[1, 2, 3], [4, 5, 6]])});
    $rootScope.longPromise = _deferred.promise;
  }));

  //This is failing because the current stable build of PhantomJS doesn't support the Blob object. Support for Blobs
  // will be supported in 2.0
  //TODO: Re-enable once PhantomJS 2.0 is released
  xit('Accepts ng-click attribute ', function () {
    $rootScope.clicked = false;
    // Create click handler
    $rootScope.clickTest = function() {
      $rootScope.clicked = true;
    };

    // Make sure clicked is false
    expect($rootScope.clicked).toBeFalsy();

    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='test' ng-click='clickTest()'></div>")($rootScope);
    element.triggerHandler('click');

    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    // Check if clickTest was executed
    expect($rootScope.clicked).toBeTruthy();
  });

  it('Builds the csv format correctly', function (done) {
    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='test' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toBe($rootScope.test);
    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1,2,3\r\n4,5,6\r\n');
      done();
    });
    scope.$apply();
  });

  it('accepts promise as data', function (done) {
    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='testPromise' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1,2,3\r\n4,5,6\r\n');
      done();
    });
    scope.$apply();
  });

  it('Accepts $scope expressions as ng-csv', function (done) {
    // Compile a piece of HTML containing the directive
    $rootScope.getTest = function () {return [[1, 2, 3], [4, 5, 6]]; };
    var element = $compile("<div ng-csv='getTest()' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.getTest());
    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1,2,3\r\n4,5,6\r\n');
      done();
    });
    scope.$apply();
  });

  it('Creates a header row if provided', function (done) {
    // Compile a piece of HTML containing the directive
    var element = $compile(
      '<div ng-csv="test" csv-header="[\'A\',\'B\',\'C\']"' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.test);
    expect(scope.$eval(scope.header)).toEqual(['A', 'B', 'C']);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('A,B,C\r\n1,2,3\r\n4,5,6\r\n');
      done();
    });
    scope.$apply();
  });

  it('Creates a header row using keys if csv-label sets to true', function (done) {
    // Compile a piece of HTML containing the directive
    $rootScope.testDelim = [ {a:1, b:2, c:3}, {a:4, b:5, c:6} ];
    var element = $compile(
      '<div ng-csv="testDelim" csv-label="true" filename="custom.csv"></div>')($rootScope);
    
    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testDelim);
    

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('a,b,c\r\n1,2,3\r\n4,5,6\r\n');
      done();
    });
    scope.$apply();
  });

  it('Accepts optional csv-column-order attribute (input array)', function (done) {
    $rootScope.testDelim = [ {a:1, b:2, c:3}, {a:4, b:5, c:6} ];
    $rootScope.order = [ 'b', 'a', 'c' ];
    var element = $compile(
      '<div ng-csv="testDelim" csv-column-order="order" filename="custom.csv"></div>')($rootScope);

    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testDelim);
    expect(scope.$eval(scope.columnOrder)).toEqual($rootScope.order);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('2,1,3\r\n5,4,6\r\n');
      done();
    });
    scope.$apply();
  });

  it('Accepts optional text-delimiter attribute (input array)', function (done) {
    $rootScope.testDelim = [[1, 'a', 2], ['b', 'c', 3]];
    var element = $compile(
      '<div ng-csv="testDelim" text-delimiter=\'"\' quote-strings="true" ' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);

    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testDelim);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1,"a",2\r\n"b","c",3\r\n');
      done();
    });
    scope.$apply();
  });

  it('Accepts optional text-delimiter attribute (input object)', function (done) {
    $rootScope.testDelim = [{a: 1, b: 'a', c: 2}, {a: 'b', b: 'c', c: 3}];
    var element = $compile(
      '<div ng-csv="testDelim" text-delimiter=\'"\' quote-strings="true" ' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);

    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testDelim);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1,"a",2\r\n"b","c",3\r\n');
      done();
    });
    scope.$apply();
  });

  it('Add optional Byte Order Mark', function (done) {
    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='testPromise' filename='custom.csv' add-bom='true'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('\ufeff1,2,3\r\n4,5,6\r\n');
      done();
    });
    scope.$apply();
  });

  it('Handles commas in fields properly', function (done) {
    $rootScope.testDelim = [{a: 1, b: 'a,b', c: 2}, {a: 'b', b: 'c', c: 3}];
    var element = $compile(
      '<div ng-csv="testDelim"' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);

    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testDelim);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1,"a,b",2\r\nb,c,3\r\n');
      done();
    });
    scope.$apply();
  });

  it('Handles CLR in fields properly', function (done) {
    $rootScope.testDelim = [{a: 1, b: 'a\nb', c: 2}, {a: 'b', b: 'c', c: 3}];
    var element = $compile(
      '<div ng-csv="testDelim"' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);

    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testDelim);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1,"a\nb",2\r\nb,c,3\r\n');
      done();
    });
    scope.$apply();
  });

  it('Handles # in fields properly', function (done) {
    $rootScope.testDelim = [{a: 1, b: 'a#b', c: 2}, {a: 'b', b: 'c', c: 3}];
    var element = $compile(
      '<div ng-csv="testDelim"' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);

    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testDelim);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1,a#b,2\r\nb,c,3\r\n');
      done();
    });
    scope.$apply();
  });

  it('Accepts optional field-separator attribute (input array)', function (done) {
    var element = $compile(
      '<div ng-csv="test" field-separator=\';\'' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);
    $rootScope.$digest();

    var scope = element.isolateScope();
    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.test);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1;2;3\r\n4;5;6\r\n');
      done();
    });
    scope.$apply();
  });

  it('Accepts optional field-separator attribute (input object)', function (done) {
    var element = $compile(
      '<div ng-csv="testObj" field-separator=\';\'' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);
    $rootScope.$digest();

    var scope = element.isolateScope();
    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testObj);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1;2;3\r\n4;5;6\r\n');
      done();
    });
    scope.$apply();
  });

  it('Accepts dynamic field-separator attribute (input object)', function (done) {
    $rootScope.sep = '\t';
    var element = $compile(
      '<div ng-csv="testObj" field-separator="{{sep}}"' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);
    $rootScope.$digest();
    $rootScope.sep = ';';
    $rootScope.$digest();

    var scope = element.isolateScope();
    // Check that the compiled element contains the templated content
    expect(scope.fieldSep).toBe($rootScope.sep);
    expect(scope.$eval(scope.data)).toEqual($rootScope.testObj);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1;2;3\r\n4;5;6\r\n');
      done();
    });
    scope.$apply();
  });

  it('Accepts special characters in field-separator attribute', function (done) {
    $rootScope.sep = '\t';
    var element = $compile(
      '<div ng-csv="testObj" field-separator="{{sep}}"' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);
    $rootScope.$digest();

    var scope = element.isolateScope();
    // Check that the compiled element contains the templated content
    expect(scope.fieldSep).toBe($rootScope.sep);
    expect(scope.$eval(scope.data)).toEqual($rootScope.testObj);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('1\t2\t3\r\n4\t5\t6\r\n');
      done();
    });
    scope.$apply();
  });

  it('adds and removes loading class with promise', function (done) {
    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='longPromise' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    var scope = element.isolateScope();

    scope.buildCSV(scope.data).then(function() {
      expect(element.hasClass('ng-csv-loading')).toBe(false);
      done();
    });

    expect(element.hasClass('ng-csv-loading')).toBe(true);
    $timeout.flush();
    scope.$apply();
  });

  it('Handles undefined variables without raising any exception', function (done) {
    var element = $compile(
      '<div ng-csv="undefinedVariable" field-separator="{{sep}}"' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);
    $rootScope.$digest();
    $rootScope.sep = ';';
    $rootScope.$digest();

    var scope = element.isolateScope();
    // Check that the compiled element has indeed undefined variable
    expect(scope.$eval(scope.data)).toEqual(undefined);

    scope.buildCSV(scope.data).then(function() {
      expect(scope.csv).toBe('');
      done();
    });
    scope.$apply();
  });

  describe('charset attribute', function () {

    beforeEach(function () {
      helper.enableBlobForTesting();
      helper.mockCreateObjectURL();
    });

    afterEach(function () {
      helper.unmockCreateObjectURL();
    });

    it('is UTF-8 as default', function () {
      var element = $compile(
        '<div ng-csv="testObj" ' +
        ' filename="custom.csv">' +
        '</div>')($rootScope);

      window.URL.createObjectURL = function (blob) {
        expect(blob).toBeDefined();
        // for some reason blob.type can't be querried with PhantomJS - therefore I created typeForTest.
        // It will be available only in test!
        // It shall be removed when updating PhantomJS to 2.0
        expect(blob.type || blob.typeForTest()).toBe("text/csv;charset=utf-8;");
      };

      angular.element(element).triggerHandler('click');
    });

    it('can be set to UTF-8', function () {

      var element = $compile(
        '<div ng-csv="testObj" ' +
        ' filename="custom.csv"' +
        ' charset="utf-8">' +
        '</div>')($rootScope);

      window.URL.createObjectURL = function (blob) {
        expect(blob.type).toBe("text/csv;charset=utf-8;");
      };

      angular.element(element).triggerHandler('click');
    });

    it('can be set to ISO-8859-1', function () {
      var element = $compile(
        '<div ng-csv="testObj" ' +
        ' filename="custom.csv"' +
        ' charset="iso-8859-1">' +
        '</div>')($rootScope);

      window.URL.createObjectURL = function (blob) {
        expect(blob.type).toBe("text/csv;charset=iso-8859-1;");
      };

      angular.element(element).triggerHandler('click');
    });

  });

  it('should convert decimal values to localeString if decimal-separator="locale"', function(done) {
    $rootScope.decSep = 'locale';

    var element = $compile(
      '<div ng-csv="testDecimal" decimal-separator="{{decSep}}"' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);

      $rootScope.$digest();

      var scope = element.isolateScope();

      expect(scope.decimalSep).toBe($rootScope.decSep);

      scope.buildCSV(scope.data).then(function() {
        var locale = $rootScope.testDecimal[0][0].toLocaleString();

        expect(scope.csv).toBe(locale + '\r\n');
        done();
      });

    scope.$apply();
  });

  it('should convert decimal values using the decimal-separator option', function(done) {
    $rootScope.decSep = ',';

    var element = $compile(
      '<div ng-csv="testDecimal" decimal-separator="{{decSep}}"' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);

      $rootScope.$digest();

      var scope = element.isolateScope();

      expect(scope.decimalSep).toBe($rootScope.decSep);

      scope.buildCSV(scope.data).then(function() {
        expect(scope.csv).toBe('13,37\r\n');
        done();
      });

    scope.$apply();
  });
});
