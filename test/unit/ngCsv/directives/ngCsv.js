'use strict';
/* jshint indent: 2*/
// Set the jasmine fixture path
// jasmine.getFixtures().fixturesPath = 'base/';

describe('ngCsv directive', function () {

  var $compile;
  var $rootScope;

  // Load the myApp module, which contains the directive
  beforeEach(module('ngCsv.directives'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.test = [[1, 2, 3], [4, 5, 6]];
    $rootScope.testObj = [{a: 1, b: 2, c: 3}, {a: 4, b: 5, c: 6}];
  }));

  it('Replaces the element with the appropriate content', function () {
    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='test'></div>") ($rootScope);
    // fire all the watches
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.html()).toMatch(/<div class="element"/);
    expect(element.html()).toMatch(/a class="hidden.*" ng-hide="true"/gi);
  });

  it('Sets default filename', function () {
    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='test'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.html()).toContain('download="download.csv"');
  });

  it('Accepts ng-click attribute ', function () {
    $rootScope.clicked = false;
    // Create click handler
    $rootScope.clickTest = function() {
      $rootScope.clicked = true;
    }

    // Make sure clicked is false
    expect($rootScope.clicked).toBeFalsy();

    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='test' ng-click='clickTest()'></div>")($rootScope);
    element.triggerHandler('click');

    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.html()).toContain('download="download.csv"');

    // Check if clickTest was executed
    expect($rootScope.clicked).toBeTruthy();
  });

  it('Sets the provided filename', function () {
    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='test' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.html()).toContain('download="custom.csv"');
  });


  it('Builds the csv format correctly', function () {
    // Compile a piece of HTML containing the directive
    var element = $compile("<div ng-csv='test' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toBe($rootScope.test);
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,1,2,3%0D%0A4,5,6%0D%0A');
  });

  it('Accepts $scope expressions as ng-csv', function () {
    // Compile a piece of HTML containing the directive
    $rootScope.getTest = function () {return [[1, 2, 3], [4, 5, 6]]; };
    var element = $compile("<div ng-csv='getTest()' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.getTest());
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,1,2,3%0D%0A4,5,6%0D%0A');
  });

  it('Creates a header row if provided', function () {
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
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,A,B,C%0D%0A1,2,3%0D%0A4,5,6%0D%0A');
  });

  it('Accepts optional text-delimiter attribute (input array)', function () {
    $rootScope.testDelim = [[1, 'a', 2], ['b', 'c', 3]];
    var element = $compile(
      '<div ng-csv="testDelim" text-delimiter=\'"\'' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);

    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testDelim);
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,1,%22a%22,2%0D%0A%22b%22,%22c%22,3%0D%0A');
  });

  it('Accepts optional text-delimiter attribute (input object)', function () {
    $rootScope.testDelim = [{a: 1, b: 'a', c: 2}, {a: 'b', b: 'c', c: 3}];
    var element = $compile(
      '<div ng-csv="testDelim" text-delimiter=\'"\'' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);

    $rootScope.$digest();

    var scope = element.isolateScope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testDelim);
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,1,%22a%22,2%0D%0A%22b%22,%22c%22,3%0D%0A');
  });

  it('Accepts optional field-separator attribute (input array)', function () {
    var element = $compile(
      '<div ng-csv="test" field-separator=\';\'' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);
    $rootScope.$digest();

    var scope = element.isolateScope();
    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.test);
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,1;2;3%0D%0A4;5;6%0D%0A');
  });

  it('Accepts optional field-separator attribute (input object)', function () {
    var element = $compile(
      '<div ng-csv="testObj" field-separator=\';\'' +
      ' filename="custom.csv">' +
      '</div>')($rootScope);
    $rootScope.$digest();

    var scope = element.isolateScope();
    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.testObj);
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,1;2;3%0D%0A4;5;6%0D%0A');
  });

  it('Accepts dynamic field-separator attribute (input object)', function () {
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
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,1;2;3%0D%0A4;5;6%0D%0A');
  });
});
