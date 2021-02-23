import { __spreadArrays } from "tslib";
import * as ts from "typescript";
var MockLanguageServiceHost = /** @class */ (function () {
    function MockLanguageServiceHost(files, compilationSettings) {
        this.files = files;
        this.compilationSettings = compilationSettings;
    }
    MockLanguageServiceHost.prototype.getScriptFileNames = function () {
        return __spreadArrays(this.files.keys());
    };
    MockLanguageServiceHost.prototype.getScriptVersion = function (fileName) {
        return ""; // our files don't change
    };
    MockLanguageServiceHost.prototype.getScriptSnapshot = function (fileName) {
        var content = this.files.get(fileName);
        if (!content) {
            return undefined;
        }
        return {
            dispose: function () { },
            getChangeRange: function () { return undefined; },
            getLength: function () { return content.length; },
            getText: function (start, end) { return content.substr(start, end - start); }
        };
    };
    MockLanguageServiceHost.prototype.getCompilationSettings = function () {
        return this.compilationSettings;
    };
    MockLanguageServiceHost.prototype.getCurrentDirectory = function () {
        return "/";
    };
    MockLanguageServiceHost.prototype.getDefaultLibFileName = function (options) {
        return ts.getDefaultLibFileName(options);
    };
    return MockLanguageServiceHost;
}());
export { MockLanguageServiceHost };
