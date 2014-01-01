ngCsv - Export to CSV using AngularJS
======

An AngularJS simple directive that turns arrays and objects into downloadable CSV files,


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

##### New! - Now accepts a header row as parameter
Just provide csv-header attribute. 
  ```html
  <button type="button" ng-csv="getArray()" csv-header="['Field A', 'Field B', 'Field C']" filename="test.csv">Export</button>
  ```


## Example
You can check out this live example here: http://jsfiddle.net/asafdav/dR6Nb/


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/asafdav/ng-csv/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

