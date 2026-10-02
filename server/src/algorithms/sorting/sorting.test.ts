import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mergeSort, quickSort } from './sorting';

describe('Merge Sort', () => {
  it('returns an empty array for empty input', () => {
    assert.deepEqual(mergeSort([]), []);
  });

  it('returns a single-element array unchanged', () => {
    assert.deepEqual(mergeSort([42]), [42]);
  });

  it('keeps an already sorted array sorted', () => {
    assert.deepEqual(mergeSort([1, 2, 3, 4]), [1, 2, 3, 4]);
  });

  it('sorts a reverse-sorted array', () => {
    assert.deepEqual(mergeSort([9, 7, 5, 3, 1]), [1, 3, 5, 7, 9]);
  });

  it('handles duplicate values', () => {
    assert.deepEqual(mergeSort([4, 2, 2, 1, 3, 2]), [1, 2, 2, 2, 3, 4]);
  });

  it('sorts an unsorted array', () => {
    assert.deepEqual(mergeSort([8, 3, 1, 5, 2, 7, 4]), [1, 2, 3, 4, 5, 7, 8]);
  });

  it('sorts objects with a custom comparator without mutating the original', () => {
    const original = [
      { id: 'b', score: 30 },
      { id: 'a', score: 10 },
      { id: 'c', score: 20 }
    ];

    const sorted = mergeSort(original, (left, right) => left.score - right.score);
    assert.deepEqual(sorted, [
      { id: 'a', score: 10 },
      { id: 'c', score: 20 },
      { id: 'b', score: 30 }
    ]);
    assert.deepEqual(original, [
      { id: 'b', score: 30 },
      { id: 'a', score: 10 },
      { id: 'c', score: 20 }
    ]);
  });
});

describe('Quick Sort', () => {
  it('returns an empty array for empty input', () => {
    assert.deepEqual(quickSort([]), []);
  });

  it('returns a single-element array unchanged', () => {
    assert.deepEqual(quickSort([13]), [13]);
  });

  it('keeps an already sorted array sorted', () => {
    assert.deepEqual(quickSort([1, 2, 3, 4]), [1, 2, 3, 4]);
  });

  it('sorts a reverse-sorted array', () => {
    assert.deepEqual(quickSort([9, 8, 7, 6, 5]), [5, 6, 7, 8, 9]);
  });

  it('handles duplicate values', () => {
    assert.deepEqual(quickSort([4, 2, 2, 1, 3, 2]), [1, 2, 2, 2, 3, 4]);
  });

  it('sorts an unsorted array', () => {
    assert.deepEqual(quickSort([6, 2, 8, 1, 4, 9]), [1, 2, 4, 6, 8, 9]);
  });

  it('sorts objects with a custom comparator without mutating the original', () => {
    const original = [
      { id: 'b', score: 5 },
      { id: 'a', score: 1 },
      { id: 'c', score: 3 }
    ];

    const sorted = quickSort(original, (left, right) => left.score - right.score);
    assert.deepEqual(sorted, [
      { id: 'a', score: 1 },
      { id: 'c', score: 3 },
      { id: 'b', score: 5 }
    ]);
    assert.deepEqual(original, [
      { id: 'b', score: 5 },
      { id: 'a', score: 1 },
      { id: 'c', score: 3 }
    ]);
  });
});
