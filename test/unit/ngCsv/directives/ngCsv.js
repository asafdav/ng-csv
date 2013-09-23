'use strict';

// Set the jasmine fixture path
// jasmine.getFixtures().fixturesPath = 'base/';

describe('ngCsv directive', function() {

  var $compile;
  var $rootScope;

  // Load the myApp module, which contains the directive
  beforeEach(module('ngCsv.directives'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('Replaces the element with the appropriate content', function() {
    // Compile a piece of HTML containing the directive
    $rootScope.test = [[1,2,3], [4,5,6]];
    var element = $compile("<div ng-csv='test'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.html()).toContain('<div class="element"');
    expect(element.html()).toContain('<a class="hidden-link" ng-hide="true"');
  });

  it('Sets default filename', function() {
    // Compile a piece of HTML containing the directive
    $rootScope.test = [[1,2,3], [4,5,6]];
    var element = $compile("<div ng-csv='test'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.html()).toContain('download="download.csv"');
  });

  it('Sets the provided filename', function() {
    // Compile a piece of HTML containing the directive
    $rootScope.test = [[1,2,3], [4,5,6]];
    var element = $compile("<div ng-csv='test' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.html()).toContain('download="custom.csv"');
  });


  it('Builds the csv format correctly', function() {
    // Compile a piece of HTML containing the directive
    $rootScope.test = [[1,2,3], [4,5,6]];
    var element = $compile("<div ng-csv='test' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.scope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toBe($rootScope.test);
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,1,2,3%0A4,5,6%0A');
  });

  it('Accepts $scope expressions as ng-csv', function() {
    // Compile a piece of HTML containing the directive
    $rootScope.getTest = function() {return [[1,2,3], [4,5,6]]};
    var element = $compile("<div ng-csv='getTest()' filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.scope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.getTest());
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,1,2,3%0A4,5,6%0A');
  });

  it('Creates a header row if provided', function() {
    // Compile a piece of HTML containing the directive
    $rootScope.test = [[1,2,3], [4,5,6]];
    var element = $compile("<div ng-csv='test' csv-header=\"['A','B','C']\" filename='custom.csv'></div>")($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    var scope = element.scope();

    // Check that the compiled element contains the templated content
    expect(scope.$eval(scope.data)).toEqual($rootScope.test);
    expect(scope.$eval(scope.header)).toEqual(['A','B','C']);
    expect(scope.csv).toBe('data:text/csv;charset=utf-8,A,B,C%0A1,2,3%0A4,5,6%0A');
  });

});
