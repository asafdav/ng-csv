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

ngCsv attributes
----------------
* ng-csv: The data array
* filename: The filename that will be stored on the user's computer
* csv-header: If provided, would use this attribute to create a header row

    ```html
  <button type="button" ng-csv="getArray()" csv-header="['Field A', 'Field B', 'Field C']" filename="test.csv">Export</button>
  ```

* field-separator: Defines the field separator character (default is)
* text-delimiter: If provided, will use this characters to "escape" string values
* lazy-load: If defined and set to true, ngCsv will generate the data string only on demand. See the lazy_load example for more details. 


## Example
You can check out this live example here: http://jsfiddle.net/asafdav/dR6Nb/


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/asafdav/ng-csv/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

