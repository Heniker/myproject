import { enableHotReload, registerUpdateReconciler, getReloadCount, hotCallExportedFunction, } from "@hediet/node-reload";
enableHotReload();
registerUpdateReconciler(module);
import { registerDefaultExtractors } from "@hediet/debug-visualizer-data-extraction";
registerDefaultExtractors();
if (getReloadCount(module) === 0) {
    // set interval so that the file watcher can detect changes in other files.
    setInterval(function () {
        hotCallExportedFunction(module, run);
    }, 1000);
}
export function run() {
    new Demo().run();
}
var Demo = /** @class */ (function () {
    function Demo() {
        this.f = new Foo(new Foo(undefined));
        this.arr = [new Foo(this.f), this.f];
        this.set = new Set([this.arr[0], new Foo(new Foo(this.arr[1]))]);
    }
    Demo.prototype.run = function () {
        debugger;
    };
    return Demo;
}());
var Foo = /** @class */ (function () {
    function Foo(next) {
        this.next = next;
    }
    return Foo;
}());
