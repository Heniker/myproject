import { getDataExtractorApi } from "@hediet/debug-visualizer-data-extraction";
getDataExtractorApi().registerDefaultExtractors();
/*
Visualize this expression:
```ts
hedietDbgVis.markedGrid(
    array,
    hedietDbgVis.tryEval(["i", "j", "left", "right"])
)
```
*/
// From https://github.com/AvraamMavridis/Algorithms-Data-Structures-in-Typescript/blob/master/algorithms/quickSort.md
var array = [1, 2, 33, 31, 1, 2, 63, 123, 6, 32, 943, 346, 24];
var sorted = quickSort(array, 0, array.length - 1);
console.log(sorted);
function swap(array, i, j) {
    var _a;
    _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
}
/**
 * Split array and swap values
 *
 * @param {Array<number>} array
 * @param {number} [left=0]
 * @param {number} [right=array.length - 1]
 * @returns {number}
 */
function partition(array, left, right) {
    if (left === void 0) { left = 0; }
    if (right === void 0) { right = array.length - 1; }
    var pivot = Math.floor((right + left) / 2);
    var pivotVal = array[pivot];
    var i = left;
    var j = right;
    while (i <= j) {
        while (array[i] < pivotVal) {
            i++;
        }
        while (array[j] > pivotVal) {
            j--;
        }
        if (i <= j) {
            swap(array, i, j);
            i++;
            j--;
        }
    }
    return i;
}
/**
 * Quicksort implementation
 *
 * @param {Array<number>} array
 * @param {number} [left=0]
 * @param {number} [right=array.length - 1]
 * @returns {Array<number>}
 */
function quickSort(array, left, right) {
    if (left === void 0) { left = 0; }
    if (right === void 0) { right = array.length - 1; }
    var index;
    if (array.length > 1) {
        index = partition(array, left, right);
        if (left < index - 1) {
            quickSort(array, left, index - 1);
        }
        if (index < right) {
            quickSort(array, index, right);
        }
    }
    return array;
}
