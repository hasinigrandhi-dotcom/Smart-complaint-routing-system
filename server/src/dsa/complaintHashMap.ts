/**
 * Simple separate-chaining Hash Map used for fast complaint lookup by key.
 * This academic implementation stores entries in buckets (arrays) and
 * resolves collisions by appending to the bucket.
 */
export type HashMapKey = string | number;

export type HashMapEntry<T> = {
  key: HashMapKey;
  value: T;
};

/**
 * ComplaintHashMap<T>
 *
 * Purpose: provide near O(1) average-time lookup, insertion and deletion by
 * key for in-memory datasets (used in demos and tests). This is a small,
 * educational implementation and is not a replacement for a production-grade
 * map (which JavaScript already provides via `Map`).
 *
 * Main operations: `set`, `get`, `has`, `delete`, `size`, `clear`.
 * Complexity (average): O(1) for get/set/delete; worst-case O(n) for a
 * heavily-colliding key distribution.
 */
export class ComplaintHashMap<T> {
  private buckets: Array<Array<HashMapEntry<T>>>;
  private sizeCount = 0;

  constructor(initialCapacity = 16) {
    this.buckets = new Array(initialCapacity).fill(null).map(() => []);
  }

  set(key: HashMapKey, value: T): void {
    const index = this.hash(key) % this.buckets.length;
    const bucket = this.buckets[index];

    const existingIndex = bucket.findIndex((entry) => entry.key === key);
    if (existingIndex >= 0) {
      bucket[existingIndex] = { key, value };
      return;
    }

    bucket.push({ key, value });
    this.sizeCount += 1;
  }

  get(key: HashMapKey): T | undefined {
    const bucket = this.buckets[this.hash(key) % this.buckets.length];
    const entry = bucket.find((item) => item.key === key);
    return entry ? entry.value : undefined;
  }

  has(key: HashMapKey): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: HashMapKey): boolean {
    const index = this.hash(key) % this.buckets.length;
    const bucket = this.buckets[index];
    const entryIndex = bucket.findIndex((entry) => entry.key === key);

    if (entryIndex === -1) {
      return false;
    }

    bucket.splice(entryIndex, 1);
    this.sizeCount -= 1;
    return true;
  }

  size(): number {
    return this.sizeCount;
  }

  clear(): void {
    this.buckets = new Array(this.buckets.length).fill(null).map(() => []);
    this.sizeCount = 0;
  }

  private hash(key: HashMapKey): number {
    const stringKey = String(key);
    let hash = 0;

    for (let index = 0; index < stringKey.length; index += 1) {
      hash = (hash * 31 + stringKey.charCodeAt(index)) >>> 0;
    }

    return hash;
  }
}
