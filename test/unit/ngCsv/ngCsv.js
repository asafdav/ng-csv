'use strict';

// Set the jasmine fixture path
// jasmine.getFixtures().fixturesPath = 'base/';

describe('ngCsv', function () {

  var module;
  var dependencies;
  dependencies = [];

  var hasModule = function (module) {
    return dependencies.indexOf(module) >= 0;
  };

  beforeEach(function () {

    // Get module
    module = angular.module('ngCsv');
    dependencies = module.requires;
  });

  it('should load config module', function () {
    expect(hasModule('ngCsv.config')).toBeTruthy();
  });

  it('should load directives module', function () {
    expect(hasModule('ngCsv.directives')).toBeTruthy();
  });

  it('should load services module', function () {
    expect(hasModule('ngCsv.services')).toBeTruthy();
  });

});
