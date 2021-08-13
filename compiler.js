"use strict";
exports.module = true;
var instrument_lib_1 = require("./instrument-lib");
var fs = require("fs");
require.extensions['.js'] = function (module, filename) {
    if (filename.match(/source\.js$/)) {
        module._compile(instrument_lib_1["default"](filename), filename);
    }
    else {
        module._compile(fs.readFileSync(filename).toString('utf8'), filename);
    }
};
