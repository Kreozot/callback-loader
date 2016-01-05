var should = require("should");
var path = require("path");
var loader = require("../");

loader.cacheable = function () {};

describe("loader", function () {

	var options,
		context;

	beforeEach(function() {
		options = {
			callbackLoader: {
				multBy2: function(num) {
					return num * 2;
				},
				mult: function(num1, num2) {
					return num1 * num2;
				},
				concat: function(str1, str2) {
					return '"' + str1 + str2 + '"';
				},
				getSecond: function(obj) {
					return obj['second'];
				},
				urlParse: function (urls) {
			    	return '"' + urls.arg1 + '"';
			    }
			},
			callbackLoader2: {
				multBy2: function(num) {
					return num * 2;
				},
				mult: function(num1, num2) {
					return num1 * num2;
				},
				concat: function(str1, str2) {
					return '"' + str1 + str2 + '-version2"';
				}
			}
		}

		context = {
			cacheable: function() {},
			options: options
		};
	});

	it("should process all functions without query", function() {
		context.query = '';
		loader.call(context, 'var a = multBy2(10); var b = mult(10, 3);')
			.should.be.eql(
				'var a = 20; var b = 30;'
			);
	});

	it("should process complicated structure", function() {
		context.query = '';
		loader.call(context, 'var a = multBy2(10); var b = mult(10, 3); var c = multBy2(12); var d = mult(12, 3);')
			.should.be.eql(
				'var a = 20; var b = 30; var c = 24; var d = 36;'
			);
	});

	it("should process one function with one parameter", function() {
		context.query = '?multBy2';
		loader.call(context, 'var a = multBy2(10); var b = mult(10, 3);')
			.should.be.eql(
				'var a = 20; var b = mult(10, 3);'
			);
	});

	it("should process multiple function with multiple parameters", function() {
		context.query = '?multBy2&mult';
		loader.call(context, 'var a = multBy2(10); var b = mult(10, 3);')
			.should.be.eql(
				'var a = 20; var b = 30;'
			);
	});

	it("should process function with float args", function() {
		context.query = '?multBy2';
		loader.call(context, 'var a = multBy2(1.2);')
			.should.be.eql(
				'var a = 2.4;'
			);
	});

	it("should process function with string args", function() {
		context.query = '';
		loader.call(context, 'var a = concat("foo", "bar");')
			.should.be.eql(
				'var a = "foobar";'
			);
	});

	it("should take another config", function() {
		context.query = '?config=callbackLoader2';
		loader.call(context, 'var a = concat("foo", "bar");')
			.should.be.eql(
				'var a = "foobar-version2";'
			);
	});

	it("should process function with object args", function() {
		context.query = '';
		var result = loader.call(context, 'var a = getSecond({first: 1, second: 2});')
			.should.be.eql(
				'var a = 2;'
			);
	});

	it("should not breaks at urls", function() {
		context.query = '';
		loader.call(context, 'const url = urlParse({arg1: "http://localhost:8000/", arg2: "http://localhost:8000/"});')
			.should.be.eql(
				'const url = "http://localhost:8000/";'
			);
	});

});