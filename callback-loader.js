var astQuery = require("ast-query");
var loaderUtils = require("loader-utils");

module.exports = function (source) {
	var query = loaderUtils.parseQuery(this.query);
	var configKey = query.config || 'callbackLoader';

	var functions = this.options[configKey];
	var functionNames = Object.keys(query).filter(function (key) {
		return key !== 'config';
	});
	if (functionNames.length === 0) {
		functionNames = Object.keys(functions);
	}

	//Offset for future replaces
	var indexOffset = 0;

	//Replace substring between *indexFrom* and *indexTo* in *text* with *replaceText*
	function replaceIn(text, indexFrom, indexTo, replaceText) {
		var actualIndexFrom = indexFrom + indexOffset;
		var actualIndexTo = indexTo + indexOffset;
		//Correcting the offset
		indexOffset = indexOffset + replaceText.length - (indexTo - indexFrom);
		return text.substr(0, actualIndexFrom) + replaceText + text.substr(actualIndexTo, text.length);
	}

	var ast = astQuery(source);

	functionNames.forEach(function (funcName) {
		var query = ast.callExpression(funcName);

		query.nodes.forEach(function (node) {
			var args = node.arguments.map(function (argument) {
				if (argument.type !== 'Literal') {
					throw 'Error when parsing arguments of function ' + funcName + '. Only absolute values accepted. Index: ' + argument.range[0];
				}
				return argument.value;
			});
			var value = functions[funcName].apply(null, args);
			source = replaceIn(source, node.range[0], node.range[1], value.toString());
		});
	});

	return source;
}
