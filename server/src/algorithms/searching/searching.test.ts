import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { binarySearch, linearSearch } from './searching';

describe('Linear Search', () => {
  it('finds an existing value', () => {
    assert.equal(linearSearch([3, 7, 1, 9, 4], 9), 3);
  });

  it('returns -1 for an unsuccessful search', () => {
    assert.equal(linearSearch([10, 20, 30], 25), -1);
  });

  it('finds the first element', () => {
    assert.equal(linearSearch([5, 9, 2], 5), 0);
  });

  it('finds the last element', () => {
    assert.equal(linearSearch([5, 9, 2], 2), 2);
  });

  it('returns -1 for an empty array', () => {
    assert.equal(linearSearch([], 5), -1);
  });

  it('handles duplicate values by returning the first match', () => {
    assert.equal(linearSearch([8, 2, 2, 7, 2], 2), 1);
  });
});

describe('Binary Search', () => {
  it('finds a value in sorted input', () => {
    const values = [1, 3, 5, 8, 10, 14, 20];
    assert.equal(binarySearch(values, 8, (item, target) => item - target), 3);
  });

  it('returns -1 for an unsuccessful search', () => {
    const values = [1, 3, 5, 8, 10, 14, 20];
    assert.equal(binarySearch(values, 9, (item, target) => item - target), -1);
  });

  it('finds the first element in sorted input', () => {
    const values = [2, 4, 6, 8, 10];
    assert.equal(binarySearch(values, 2, (item, target) => item - target), 0);
  });

  it('finds the last element in sorted input', () => {
    const values = [2, 4, 6, 8, 10];
    assert.equal(binarySearch(values, 10, (item, target) => item - target), 4);
  });

  it('returns -1 for an empty array', () => {
    assert.equal(binarySearch([], 5, (item, target) => item - target), -1);
  });

  it('handles duplicates by returning the first matching index', () => {
    const values = [2, 2, 2, 4, 6];
    assert.equal(binarySearch(values, 2, (item, target) => item - target), 0);
  });

  it('works correctly on sorted input when using a custom comparator', () => {
    const complaints = [
      { id: 'c1', priorityScore: 10 },
      { id: 'c2', priorityScore: 20 },
      { id: 'c3', priorityScore: 35 },
      { id: 'c4', priorityScore: 50 }
    ];

    const result = binarySearch(complaints, { id: 'c3', priorityScore: 35 }, (item, target) => {
      return item.priorityScore - target.priorityScore;
    });

    assert.equal(result, 2);
  });
});
