/**
 * SearchComparator compares an item in a collection to a target value and
 * returns 0 for equality, negative if `item < target`, positive if `item > target`.
 */
export type SearchComparator<T> = (item: T, target: T) => number;

/*
 * Linear Search:
 * - Check every element in sequence until the target is found.
 * - This is useful when the list is not sorted or is very small.
 *
 * Time complexity: O(n)
 * Space complexity: O(1)
 */
export function linearSearch<T>(items: T[], target: T, compare: SearchComparator<T> = (item, targetValue) => {
  return item === targetValue ? 0 : 1;
}): number {
  for (let index = 0; index < items.length; index += 1) {
    if (compare(items[index], target) === 0) {
      return index;
    }
  }

  return -1;
}

/*
 * Binary Search:
 * - Input must already be sorted according to the same comparison key.
 * - We repeatedly inspect the midpoint and discard the half that cannot contain the target.
 *
 * Time complexity: O(log n)
 * Space complexity: O(1) because this implementation is iterative.
 *
 * Important: Binary Search is only appropriate on sorted input. If the data is unsorted,
 * the algorithm can produce incorrect results. The caller must ensure the array is sorted
 * according to the same ordering used in the comparator.
 */
export function binarySearch<T>(items: T[], target: T, compare: SearchComparator<T>): number {
  let left = 0;
  let right = items.length - 1;
  let foundIndex = -1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const comparison = compare(items[middle], target);

    if (comparison === 0) {
      foundIndex = middle;
      right = middle - 1;
      continue;
    }

    if (comparison < 0) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  return foundIndex;
}
