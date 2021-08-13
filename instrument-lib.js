"use strict";
exports.module = true;
var template = require("babel-template");
var valueToNode = require('babel-types').valueToNode;
var utils_1 = require("./utils");
var statementCounter = 0;
var coverage = {};
var onEachPath = function (path) {
    if (utils_1.isStatement(path)) {
        var statementId = ++statementCounter;
        coverage = coverage || {};
        coverage.c = coverage.c || {};
        coverage.c[statementId] = 0;
        coverage.statementMap = coverage.statementMap || {};
        coverage.statementMap[statementId] = utils_1.toPlainObjectRecursive(path.node.loc);
        path.insertBefore(template("\n          __coverage__.c[\"" + statementId + "\"]++\n        ")());
    }
};
var onExitProgram = function (path) {
    path.node.body.unshift(template("\n        __coverage__ = COVERAGE\n    ")({
        'COVERAGE': valueToNode(coverage)
    }));
};
function instrument(filename) {
    var source = utils_1.readCode(filename);
    var tree = utils_1.parseCode(source);
    utils_1.traverse(tree, onEachPath, onExitProgram);
    return utils_1.generateCode(tree);
}
console.log(instrument(__dirname + '/../source.js'));
exports["default"] = instrument;
