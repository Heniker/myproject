import { getDataExtractorApi } from "@hediet/debug-visualizer-data-extraction";
// Registers all existing extractors.
getDataExtractorApi().registerDefaultExtractors();
getDataExtractorApi().registerExtractor({
    id: "my-extractor",
    getExtractions: function (data, collector) {
        if (data instanceof Foo) {
            collector.addExtraction({
                id: "my-extractor",
                name: "My Extractor",
                priority: 2000,
                extractData: function () { return ({ kind: { text: true }, text: "Foo" }); }
            });
        }
    }
});
setTimeout(function () {
    new Main().run();
}, 0);
var Foo = /** @class */ (function () {
    function Foo() {
    }
    return Foo;
}());
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.prototype.run = function () {
        var f = new Foo();
        // visualize `f` here!
        debugger;
    };
    return Main;
}());
