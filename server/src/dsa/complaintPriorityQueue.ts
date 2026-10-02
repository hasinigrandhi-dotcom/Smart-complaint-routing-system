/**
 * ComplaintQueueItem represents a simplified complaint payload used by the
 * priority queue. It stores identifying fields and a numeric `priorityScore`
 * used to order complaints for processing.
 *
 * Fields:
 * - `id`, `title`: identifiers for display and lookup
 * - `priorityScore`: numeric score; higher values indicate higher priority
 * - `createdAt`: used as a tie-breaker (older complaints preferred)
 */
export interface ComplaintQueueItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  category?: string;
  severity?: number;
  urgency?: number;
  priorityScore: number;
  createdAt: Date | string;
}

/**
 * MaxComplaintPriorityQueue
 *
 * Purpose: keep complaints ordered by `priorityScore` (highest first). When
 * priority scores are equal, older complaints (earlier `createdAt`) are
 * preferred. This is implemented as a binary max-heap stored in an array.
 *
 * Main operations:
 * - `enqueue(item)`: insert a new complaint into the heap (O(log n))
 * - `extract()`: remove and return the highest-priority complaint (O(log n))
 * - `peek()`: view the current highest-priority complaint (O(1))
 *
 * Usage in SCRS: used by automated processing flows to select the next
 * complaint to process according to the computed priority score.
 */
export class MaxComplaintPriorityQueue {
  private heap: ComplaintQueueItem[] = [];

  constructor(initialItems: ComplaintQueueItem[] = []) {
    initialItems.forEach((item) => this.enqueue(item));
  }

  enqueue(item: ComplaintQueueItem): number {
    const complaint: ComplaintQueueItem = {
      ...item,
      priorityScore: Number(item.priorityScore) || 0,
      createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt)
    };

    this.heap.push(complaint);
    this.bubbleUp(this.heap.length - 1);
    return this.heap.length;
  }

  extract(): ComplaintQueueItem | null {
    if (this.heap.length === 0) {
      return null;
    }

    const root = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return root ?? null;
  }

  peek(): ComplaintQueueItem | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  toArray(): ComplaintQueueItem[] {
    return this.heap.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  }

  private bubbleUp(index: number) {
    let currentIndex = index;

    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      if (!this.shouldSwap(currentIndex, parentIndex)) {
        break;
      }

      this.swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  private bubbleDown(index: number) {
    let currentIndex = index;

    while (true) {
      const leftIndex = 2 * currentIndex + 1;
      const rightIndex = 2 * currentIndex + 2;
      let candidateIndex = currentIndex;

      if (leftIndex < this.heap.length && this.shouldSwap(leftIndex, candidateIndex)) {
        candidateIndex = leftIndex;
      }

      if (rightIndex < this.heap.length && this.shouldSwap(rightIndex, candidateIndex)) {
        candidateIndex = rightIndex;
      }

      if (candidateIndex === currentIndex) {
        break;
      }

      this.swap(currentIndex, candidateIndex);
      currentIndex = candidateIndex;
    }
  }

  private shouldSwap(candidateIndex: number, parentIndex: number): boolean {
    const candidate = this.heap[candidateIndex];
    const parent = this.heap[parentIndex];

    if (!candidate || !parent) {
      return false;
    }

    return this.compareComplaints(candidate, parent) > 0;
  }

  private compareComplaints(left: ComplaintQueueItem, right: ComplaintQueueItem): number {
    if (left.priorityScore !== right.priorityScore) {
      return left.priorityScore - right.priorityScore;
    }

    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();

    return rightTime - leftTime;
  }

  private swap(leftIndex: number, rightIndex: number) {
    const temp = this.heap[leftIndex];
    this.heap[leftIndex] = this.heap[rightIndex];
    this.heap[rightIndex] = temp;
  }
}
