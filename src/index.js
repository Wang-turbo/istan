const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const core = require("@babel/core");
const fs = require("fs");
// 同步读取文件
let sourceCode=fs.readFileSync('./encode.js','utf8');   

const ast = parser.parse(sourceCode, {
    sourceType: "module",
    plugins: [
        "jsx",
        "dynamicImport"
    ],
});
// var countMap = `{ __global__coverage__[startLine]: count }`
let countMap;
let __global__coverage__;
traverse(ast, {
    Program: {
        enter(path, state) {
            // init 
            countMap = {};
        },
        exit(path, state) {
            // global.__global__coverage__ = global.__global__coverage__ || {};
            const body = path.get('body')[0];
            var code = t.expressionStatement(
                t.assignmentExpression(
                    '=',
                    t.memberExpression(
                        t.identifier(
                            'global'
                        ),
                        t.identifier(
                            '__global__coverage__'
                        ),
                    ),
                    t.logicalExpression(
                        '||',
                        t.memberExpression(
                            t.identifier(
                                'global'
                            ),
                            t.identifier(
                                '__global__coverage__'
                            ),
                        ),
                        t.objectExpression(
                            []
                        )
                    )
                )
            );
            body.insertBefore(code);
            // __global__coverage__[line] = count;
            Object.keys(countMap).forEach(line => {
                var code = t.expressionStatement(
                    t.assignmentExpression(
                        '=',
                        t.memberExpression(
                            t.identifier(
                                '__global__coverage__'
                            ),
                            t.identifier(
                                line
                            ),
                            true,
                        ),
                        t.numericLiteral(
                            countMap[line]-1
                        )
                    )
                );
                body.insertBefore(code);
            });
        }
    },
    Statement: {
        exit(path) {
            const node = path.node;
            const loc = node.loc;
            const startLine = loc?.start?.line;
            if (startLine && !countMap[startLine]) {
                if (!countMap[startLine]) {
                    countMap[startLine] = 0;
                }
                const countExpr = t.expressionStatement(
                    t.updateExpression(
                        "++",
                        t.memberExpression(
                            t.identifier(
                                '__global__coverage__'
                            ),
                            t.numericLiteral(
                                startLine
                            ),
                            true,
                        ),
                    )
                );
                countMap[startLine]++;
                path.insertBefore(countExpr);
            }
        },
    },
    Function: {
        exit(path) { 
            // console.log(path.node)
        }
    },
});
const code = core.transformFromAstSync(ast, null, { configFile: false }).code;
// console.log(code)
fs.writeFileSync('./encode.js',code)