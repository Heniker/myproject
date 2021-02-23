"use strict";
// visualize `data`
var data = new Array();
var curValue = 0;
for (var j = 0; j < 100; j++) {
    addManyRandomValues();
}
function addManyRandomValues() {
    for (var i = 0; i < 100; i++) {
        addRandomValue();
    }
}
function addRandomValue() {
    var delta = Math.random()
        > 0.5 ? 1 : -1;
    data.push(curValue);
    curValue += delta;
}
