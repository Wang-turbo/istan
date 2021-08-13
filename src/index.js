const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const core = require("@babel/core");
const fs = require("fs");
// 同步读取文件 sources
let sourceCode=fs.readFileSync('./sources.js','utf8');   
const ast = parser.parse(sourceCode, {
    sourceType: "module",
    plugins: [
        "jsx",
        "dynamicImport"
    ],
});
// var countMap = `{ __global__coverage__[startLine]: count }`
let countMap;
let __coverage__;
traverse(ast, {
    Program: {
            enter(path, state) {
                // init 
                countMap = {};
            },
            exit(path, state) {
                const body = path.get('body')[0];
                // global.__global__coverage__ = global.__global__coverage__ || {};
                var code = t.expressionStatement(
                    t.assignmentExpression(
                        '=',
                        t.memberExpression(
                            t.identifier(
                                'global'
                            ),
                            t.identifier(
                                '__coverage__'
                            ),
                        ),
                        t.logicalExpression(
                            '||',
                            t.memberExpression(
                                t.identifier(
                                    'global'
                                ),
                                t.identifier(
                                    '__coverage__'
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
                                    '__coverage__'
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
                    // __global__coverage__[line]++;
                    const countExpr = t.expressionStatement(
                        t.updateExpression(
                            "++",
                            t.memberExpression(
                                t.identifier(
                                    '__coverage__'
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
});
const code = core.transformFromAstSync(ast, null, { configFile: false }).code;
fs.writeFileSync('./sources-test.js', code)
