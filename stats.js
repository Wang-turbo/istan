"use strict";
exports.module = true;
var babel_traverse_1 = require("babel-traverse");
var utils_1 = require("./utils");
var statementCounter = 0;
var source = utils_1.readCode('d:\\learning-code-coverage\\source.js');
var tree = utils_1.parseCode(source);
babel_traverse_1["default"](tree, {
    enter: function (path) {
        if (utils_1.isStatement(path)) {
            statementCounter++;
        }
    }
});
console.log("there are " + statementCounter + " statements in the source");
