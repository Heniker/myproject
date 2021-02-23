import { getDataExtractorApi, createGraphFromPointers, } from "@hediet/debug-visualizer-data-extraction";
getDataExtractorApi().registerDefaultExtractors();
setTimeout(function () {
    new Main().run();
}, 0);
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.prototype.run = function () {
        var head = new DoublyLinkedListNode("1");
        head.setNext(new DoublyLinkedListNode("2"));
        head.next.setNext(new DoublyLinkedListNode("3"));
        var tail = new DoublyLinkedListNode("4");
        head.next.next.setNext(tail);
        reverse(new DoublyLinkedList(head, tail));
        console.log("finished");
    };
    return Main;
}());
function reverse(list) {
    // Open a new Debug Visualizer
    // and enter `visualize()`!
    var visualize = function () {
        return createGraphFromPointers({
            last: last,
            "list.head": list.head,
            "list.tail": list.tail
        }, function (i) { return ({
            id: i.id,
            label: i.name,
            color: finished.has(i) ? "lime" : undefined,
            edges: [
                { to: i.next, label: "next" },
                { to: i.prev, label: "prev", color: "lightgray" },
            ].filter(function (r) { return !!r.to; })
        }); });
    };
    // Finished nodes have correct pointers,
    // their next node is also finished.
    var finished = new Set();
    var last = null;
    list.tail = list.head;
    while (list.head) {
        list.head.prev = list.head.next;
        list.head.next = last;
        finished.add(list.head);
        last = list.head;
        list.head = list.head.prev;
    }
    list.head = last;
}
var DoublyLinkedList = /** @class */ (function () {
    function DoublyLinkedList(head, tail) {
        this.head = head;
        this.tail = tail;
    }
    return DoublyLinkedList;
}());
var id = 0;
var DoublyLinkedListNode = /** @class */ (function () {
    function DoublyLinkedListNode(name) {
        this.name = name;
        this.id = (id++).toString();
        this.next = null;
        this.prev = null;
    }
    DoublyLinkedListNode.prototype.setNext = function (val) {
        val.prev = this;
        this.next = val;
    };
    return DoublyLinkedListNode;
}());
