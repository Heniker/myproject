import * as ts from "typescript";
import { getDataExtractorApi } from "@hediet/debug-visualizer-data-extraction";
// Registers all existing extractors.
getDataExtractorApi().registerDefaultExtractors();
setTimeout(function () {
    new Main().run();
}, 0);
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.prototype.run = function () {
        /*const files = new Map<string, string>([
            [
                "main.ts",
                `
class Test1 {
    public foo(a: number) {
        const x = { a: 5 };
        const y = { a: 5 };
    }
}
`,
            ],
        ]);
        const serviceHost = new MockLanguageServiceHost(files, {});
        const baseService = ts.createLanguageService(
            serviceHost,
            ts.createDocumentRegistry()
        );
        const prog = baseService.getProgram()!;
        debugger;

        const c = prog.getTypeChecker();
        let myValue = undefined; // Visualize `myValue` here!
        const sourceFileAst = prog.getSourceFiles()[0];
        myValue = sourceFileAst;
        console.log("myValue is the source code of the AST");
        debugger;

        myValue = {
            sf: sourceFileAst,
            fn: (n: ts.Node) => {
                try {
                    const t = c.getTypeAtLocation(n);
                    return t ? c.typeToString(t) : undefined;
                } catch (e) {
                    return "" + e;
                }
            },
        };
        console.log("myValue is AST, annotated with type information");
        debugger;

        myValue = {
            sf: sourceFileAst,
            fn: (n: ts.Node) => {
                try {
                    const t = c.getSymbolAtLocation(n);
                    return t ? ts.SymbolFlags[t.flags] : undefined;
                } catch (e) {
                    return "" + e;
                }
            },
        };
        console.log("myValue is AST, annotated with symbol information");
        debugger;*/
        require;
        var sf = ts.createSourceFile("main.ts", "\nclass Test1 {\n\tpublic foo(a: number) {\n\t\tconst x = { a: 5 };\n\t\tconst y = { a: 24 };\n\t}\n}\n\t\t\t", ts.ScriptTarget.ESNext, true);
        var traverse = function (node) {
            ts.forEachChild(node, function (child) {
                traverse(child);
            });
        };
        traverse(sf);
    };
    return Main;
}());
/*
        myValue = {
            kind: { text: true, svg: true },
            text: `
                <svg height="210" width="500">
                    <polygon
                        points="100,10 40,198 190,78 10,78 160,198"
                        style="fill:lime;stroke:purple;stroke-width:5;fill-rule:nonzero;"
                    />
                </svg>
            `,
        };*/
