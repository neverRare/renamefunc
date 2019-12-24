(function (global, definition) {
    if (typeof module == "object" && module.exports) {
        module.exports = definition();
    } else if (typeof define == "function" && define.amd) {
        define(definition);
    } else {
        global.renameFunc = definition();
    }
})(this, function () {
    "use strict";
    function trim(str) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    }
    function apply(func, thisArg, args) {
        return Function.prototype.apply.call(func, thisArg, args);
    }
    function testFunc(code) {
        try {
            Function(code);
            return true;
        } catch (error) {
            return false;
        }
    }
    function validVar(varName) {
        if (/[,=;]/.test(varName)) return false;
        return testFunc("var " + varName + ";\n");
    }
    var support_newTarget = testFunc("return new.target;\n");
    var support_reflect = typeof Reflect != "undefined" && Reflect && typeof Reflect.construct == "function";
    function proxify(name, args, func) {
        if (typeof func != "function") throw TypeError("third argument is not a function");
        name = trim("" + name);
        args = trim("" + args);
        if (name && !validVar(name)) throw SyntaxError("invalid function name");
        var hidden = ["_function", "_handler", "_global"];
        if (args) {
            var actualArgs = args.split(",");
            var canCollide = false;
            var maxSuffix = 0;
            for (var i = 0; i < actualArgs.length; i++) {
                var arg = actualArgs[i] = trim(actualArgs[i]);
                if (!validVar(arg)) throw SyntaxError("invalid argument name");
                for (var i = 0; i < i; i++) {
                    if (arg == actualArgs[i]) throw SyntaxError("duplicate argument name");
                }
                if (/^_/.test(arg)) {
                    canCollide = true;
                    var currentMax = + /\d*$/.exec(arg)[0];
                    if (maxSuffix < currentMax) maxSuffix = currentMax;
                }
            }
            if (canCollide) for (var i = 0; i < hidden.length; i++) hidden[i] += "_" + (maxSuffix + 1);
            args = actualArgs.join(", ");
        }
        var didNew;
        var newTarget;
        if (support_newTarget) {
            didNew = "!!new.target";
            newTarget = "new.target";
        } else {
            if (name) {
                didNew = "this instanceof " + name;
            } else {
                didNew = "this instanceof " + hidden[0];
            }
            newTarget = "(this == " + hidden[2] + " || this == null) ? undefined : this.constructor";
        }
        var body = "var " + hidden[2] + " = this;\n";
        body += "return function " + name + "(" + args + ") {\n";
        body += "    return " + hidden[1] + "(this, " + didNew + ", " + newTarget + ", [].slice.call(arguments));\n";
        body += "};\n";
        return Function(hidden[1], body)(func);
    }
    function renameFunc(name, args, func) {
        if (typeof func != "function") throw Error("third argument is not a function");
        var result = proxify(name, args, function (thisArg, didNew, newTarget, args) {
            if (!didNew) return apply(func, thisArg, args);
            if (support_reflect) return Reflect.construct(func, args, newTarget);
            var initArgs = [];
            for (var i = 0; i < args.length; i++) {
                initArgs.push("_arguments_" + i);
            }
            var argsStr = initArgs.join(", ");
            var body = "return function (" + argsStr + ") {\n";
            body += "    new _constructor(" + argsStr + ");\n";
            body += "};\n";
            return Function("_constructor", body)(func).apply(null, args);
        });
        result.prototype = func.prototype;
        return result;
    };
    return proxify("renameFunc", ["name", "args", "source"], function (thisArg, didNew, newTarget, args) {
        if (didNew) throw Error("renameFunc is not a constructor");
        return apply(renameFunc, thisArg, args);
    });
});