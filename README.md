ng-csv
======

Simple directive that turns arrays and objects into downloadable CSV files


## Usage
1. Add ng-csv.min.js to your main file (index.html)

2. Set `ngCsv` as a dependency in your module
  ```javascript
  var myapp = angular.module('myapp', ['ngCsv'])
  ```

3. Add ng-csv directive to the wanted element, example:
  ```html
  <button type="button" ng-csv="getArray()" filename="test.csv">Export</button>
  ```

## Example
You can check out this live example here: http://jsfiddle.net/asafdav/dR6Nb/
