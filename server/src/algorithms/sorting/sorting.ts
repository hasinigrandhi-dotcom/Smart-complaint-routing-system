/**
 * Comparator<T> compares two items and returns:
 * - negative number if left < right
 * - zero if equal
 * - positive number if left > right
 */
export type Comparator<T> = (left: T, right: T) => number;

export function defaultCompare<T>(left: T, right: T): number {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

/*
 * Merge Sort:
 * - Divide the list into two halves.
 * - Recursively sort each half.
 * - Merge the two sorted halves into one sorted list.
 *
 * Time complexity: O(n log n)
 * Space complexity: O(n) for the temporary arrays used during merge
 *
 * This implementation returns a new sorted array instead of mutating the input,
 * which keeps the algorithm easier to reason about and test in an academic demo.
 */
export function mergeSort<T>(items: T[], compare: Comparator<T> = defaultCompare as Comparator<T>): T[] {
  if (items.length <= 1) {
    return [...items];
  }

  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), compare);
  const right = mergeSort(items.slice(middle), compare);

  return merge(left, right, compare);
}

function merge<T>(left: T[], right: T[], compare: Comparator<T>): T[] {
  const merged: T[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (compare(left[leftIndex], right[rightIndex]) <= 0) {
      merged.push(left[leftIndex]);
      leftIndex += 1;
    } else {
      merged.push(right[rightIndex]);
      rightIndex += 1;
    }
  }

  while (leftIndex < left.length) {
    merged.push(left[leftIndex]);
    leftIndex += 1;
  }

  while (rightIndex < right.length) {
    merged.push(right[rightIndex]);
    rightIndex += 1;
  }

  return merged;
}

/*
 * Quick Sort:
 * - Pick the last element as the pivot.
 * - Partition the array so values less than or equal to the pivot move to the left side.
 * - Recurse on the left and right partitions.
 *
 * Time complexity:
 * - Average: O(n log n)
 * - Worst case: O(n^2) when the pivot constantly splits the list poorly.
 *
 * Space complexity:
 * - O(log n) recursion stack on average
 * - O(n) worst case in the most unbalanced partitioning situations
 *
 * The chosen partition approach is simple and easy to explain during a viva:
 * the pivot is the last element, and every smaller item is moved before it.
 */
export function quickSort<T>(items: T[], compare: Comparator<T> = defaultCompare as Comparator<T>): T[] {
  const copy = [...items];

  if (copy.length <= 1) {
    return copy;
  }

  quickSortInPlace(copy, 0, copy.length - 1, compare);
  return copy;
}

function quickSortInPlace<T>(items: T[], start: number, end: number, compare: Comparator<T>): void {
  if (start >= end) {
    return;
  }

  const pivotIndex = partition(items, start, end, compare);
  quickSortInPlace(items, start, pivotIndex - 1, compare);
  quickSortInPlace(items, pivotIndex + 1, end, compare);
}

function partition<T>(items: T[], start: number, end: number, compare: Comparator<T>): number {
  const pivot = items[end];
  let smallerIndex = start;

  for (let currentIndex = start; currentIndex < end; currentIndex += 1) {
    if (compare(items[currentIndex], pivot) <= 0) {
      swap(items, smallerIndex, currentIndex);
      smallerIndex += 1;
    }
  }

  swap(items, smallerIndex, end);
  return smallerIndex;
}

function swap<T>(items: T[], leftIndex: number, rightIndex: number): void {
  const temp = items[leftIndex];
  items[leftIndex] = items[rightIndex];
  items[rightIndex] = temp;
}
