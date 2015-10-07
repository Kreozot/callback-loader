# callback-loader
[![Build Status](https://travis-ci.org/Kreozot/callback-loader.svg?branch=master)](https://travis-ci.org/Kreozot/callback-loader)
[![npm version](https://badge.fury.io/js/callback-loader.svg)](https://badge.fury.io/js/callback-loader)

Webpack loader that parses your JS, calls specified functions and replaces their with the results.

## Installation

`npm install callback-loader --save-dev`

## Usage

Source file:

``` javascript
var a = multBy2(10);
var b = mult(10, 3);
var c = concat("foo", "bar");
```

Webpack config:

``` javascript
{
    ...
    callbackLoader: {
        multBy2: function(num) {
            return num * 2;
        },
        mult: function(num1, num2) {
            return num1 * num2;
        },
        concat: function(str1, str2) {
            return '"' + str1 + str2 + '"';
        }
    }
}
```

Result:

``` javascript
var a = 20;
var b = 30;
var c = "foobar";
```

Notice that quotes was added in **concat** function.

### Loader parameters

You can choose which functions will be processed in your query:

``` javascript
'callback?mult&multBy2!example.js'
```

Result for this query will be this:

``` javascript
var a = 20;
var b = 30;
var c = concat("foo", "bar");
```

### Different configs

Webpack config:

``` javascript
{
    ...
    callbackLoader: {
        concat: function(str1, str2) {
            return '"' + str1 + str2 + '"';
        }
    },
    anotherConfig: {
        concat: function(str1, str2) {
            return '"' + str1 + str2 + '-version2"';
        }
    }
}
```

Loader query:

``` javascript
'callback?config=anotherConfig!example.js'
```

Result for this query will be this:

``` javascript
var a = multBy2(10);
var b = mult(10, 3);
var c = "foobar-version2";
```

## Restrictions

No expressions and variables in function arguments yet, sorry. Only raw values.

## Use cases

* Build time cache.
* Using node modules.
* Using any other build-time stuff (compiler directives, version number, parameters, etc)

## Real life example

Ok, let's say we need an array of points for a map in *points.js* file:

``` javascript
module.exports = [
    {
        name: 'Moscow',
        coords: [37.617, 55.756]
    }, {
        name: 'Tokyo',
        coords: [139.692, 35.689]
    }, ...
]
```

But we don't want to search and write coordinates by yourself. We just want to type city names and let Google Maps API do the REST. But at the same time it's not a good idea to send hundreds of requests each time user open your map. Can we do this once in a build time?

Let's write something like this:

``` javascript
module.exports = [
    {
        name: 'Moscow',
        coords: okGoogleGiveMeTheCoords('Moscow, Russia')
    }, {
        name: 'Tokyo',
        coords: okGoogleGiveMeTheCoords('Tokyo, Japan')
    }, ...
]
```

Looks much more pretty, right? Now we just need to implement *okGoogleGiveMeTheCoords* and config callback-loader:

``` javascript
var request = require('sync-request');
...
var webpackConfig = {
    ...
    pointsCallback: {
        okGoogleGiveMeTheCoords: function (address) {
            var response = request('GET', 'http://maps.google.com/maps/api/geocode/json?address=' + address + '&sensor=false');
            var data = JSON.parse(response.getBody());
            var coords = data.results[0].geometry.location;
            return '[' + coords.lng + ', ' + coords.lat + ']';
        }
    }
}
```

Now write a *require* statement:

``` javascript
var points = require('callback?config=pointsCallback!./points.js');
```

And in *points* we have the array from the first example but we didn't write none of coordinates.