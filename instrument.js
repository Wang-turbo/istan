var template = require("babel-template");
var valueToNode = require('babel-types').valueToNode;
var traverse = require("babel-traverse").default;
var generator = require("babel-generator").default;
var _ = require("lodash");
var fs = require("fs");
var parser = require("babylon");
var statementCounter = 0;
var coverage = {};
function instrument(filename) {
    
    var source = fs.readFileSync(filename).toString('utf8');
    var tree = parser.parse(source, { sourceType: 'module' });
    traverse(tree, {
        enter(path) {
            if (!path.node.loc) {
                return;
            }
            var onEachPath = function (path) {
                if ((path.type.match(/statement$/i) || (path.type.toLowerCase() === 'variabledeclaration')) &&
                (path.type.toLowerCase() !== 'blockstatement')) {
                    var statementId = ++statementCounter;
                    coverage = coverage || {};
                    coverage.s = coverage.s || {};
                    coverage.s[statementId] = 0;
                    // coverage.statementMap = coverage.statementMap || {};
                    // // 压缩为一个值 要遍历的对象，每次迭代时调用的函数，定制叠加的值   将开始位置与结束位置聚合在一起
                    // coverage.statementMap[statementId] = _.transform(_.toPlainObject(path.node.loc), function (result, value, key) {
                    //     // 转换 value 为普通对象。 包括继承的可枚举属性。
                    //     result[key] = _.toPlainObject(value);  // key ---- start end
                    //     return result;
                    // }, {});
                    path.insertBefore(template("\n __coverage__.s[\"" + statementId + "\"]++\n")());
                }
            };
            return onEachPath(path);
        },
        exit(path) {
            if (path.type === 'Program') {
                path.node.body.unshift(template("\n__coverage__ = COVERAGE\n")({
                    'COVERAGE': valueToNode(coverage),
                }));
            }
        }
    });
    fs.writeFileSync('ast.json',JSON.stringify(tree))
    return generator(tree, { comments: false }).code;;
}
console.log(instrument(__dirname + '/../source.js'));
