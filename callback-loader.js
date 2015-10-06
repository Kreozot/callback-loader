var acorn = require("acorn");
var fs = require('fs');

var source = fs.readFileSync('./test.js');

var indexOffset = 0; //Offset for future replaces
function replaceIn(text, indexFrom, indexTo, replaceText) {
	actualIndexFrom = indexFrom + indexOffset;
	actualIndexTo = indexTo + indexOffset;
	indexOffset = replaceText.length - (indexTo - indexFrom); //Correcting the offset
	return text.substr(0, actualIndexFrom) + replaceText + text.substr(actualIndexTo, text.length);
}

var ast = acorn.parse(source);
console.log(JSON.stringify(ast, null, ' '));