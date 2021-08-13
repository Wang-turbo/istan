"use strict";
exports.module = true;
var babel_traverse_1 = require("babel-traverse");
var babel_generator_1 = require("babel-generator");
var _ = require("lodash");
var fs_1 = require("fs");
var parser = require("babylon");
function parseCode(source) {
    return parser.parse(source, { sourceType: 'module' });
}
exports.parseCode = parseCode;
;
function readCode(filename) {
    return fs_1.readFileSync(filename).toString('utf8');
}
exports.readCode = readCode;
;
function isStatement(path) {
    var type = path.type;
    return ((type.match(/statement$/i) || (type.toLowerCase() === 'variabledeclaration')) &&
        (type.toLowerCase() !== 'blockstatement'));
}
exports.isStatement = isStatement;
;
function traverse(tree, onEachPath, onExit) {
    babel_traverse_1["default"](tree, {
        enter: function (path) {
            if (!path.node.loc) {
                return;
            }
            return onEachPath(path);
        },
        exit: function (path) {
            if (path.type === 'Program') {
                onExit(path);
            }
        }
    });
}
exports.traverse = traverse;
;
function toPlainObjectRecursive(obj) {
    return _.transform(_.toPlainObject(obj), function (result, value, key) {
        result[key] = _.toPlainObject(value);
        return result;
    }, {});
}
exports.toPlainObjectRecursive = toPlainObjectRecursive;
;
function generateCode(tree) {
    var code = babel_generator_1["default"](tree, {
        comments: false
    }).code;
    return code;
}
exports.generateCode = generateCode;
;
function toLCOV(coverageReport) {
    var report = 'SF:source.js\n';
    _.each(coverageReport.c, function (counter, statementId) {
        var line = coverageReport.statementMap[statementId].start.line;
        report += "DA:" + line + "," + counter + "\n";
    });
    report += 'end_of_record';
    return report;
}
exports.toLCOV = toLCOV;
;
