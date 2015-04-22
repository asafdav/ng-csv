'use strict';
/* jshint indent: 2*/
// Set the jasmine fixture path
// jasmine.getFixtures().fixturesPath = 'base/';

describe('ngCsv service', function () {
  var CSV;

  beforeEach(function() {
    module('ngCsv.services');

    inject(function (_CSV_) {
      CSV = _CSV_;
    });
  });

  describe('isFloat', function () {
    it('should return true if input is float', function () {
      var testCases = [
      13.37,
      0.01,
      1.01,
      -13.37
      ];

      angular.forEach(testCases, function (testCase) {
        expect(CSV.isFloat(testCase)).toBeTruthy();
      });
    });

    it('should return false if input is not float (but an integer)', function() {
      var testCases = [
      1.00,
      0.00,
      -1.00,
      1,
      0,
      -1
      ];

      angular.forEach(testCases, function (testCase) {
        expect(CSV.isFloat(testCase)).toBeFalsy();
      });
    });

    it('should return false if input is not an integer', function() {
      var testCases = [
      'abc',
      '13.37',
      null,
      {},
      function () {
      },
      [],
      false,
      true
      ];

      angular.forEach(testCases, function (testCase) {
        expect(CSV.isFloat(testCase)).toBeFalsy();
      });
    });
  });

  describe('isSpecialChar', function () {
    it('should return true if input is a special char with an escaped backslash', function () {
      var testCases = [
        '\\t',
        '\\b',
        '\\v',
        '\\f',
        '\\r'
      ];

      angular.forEach(testCases, function (testCase) {
        expect(CSV.isSpecialChar(testCase)).toBeTruthy();
      });
    });

    it('should return false if input is NOT a special char with an escaped backslash ', function () {
      var testCases = [
        '\t',
        '\b',
        '\v',
        '\f',
        '\r',
         6,
        'A',
        true
      ];

      angular.forEach(testCases, function (testCase) {
        expect(CSV.isSpecialChar(testCase)).toBeFalsy();
      });
    });    


  });


});
