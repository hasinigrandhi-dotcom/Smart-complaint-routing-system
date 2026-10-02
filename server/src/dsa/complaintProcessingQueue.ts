/**
 * ProcessingQueueItem represents an item placed into the FIFO processing
 * queue. It contains enough complaint metadata for processing and display.
 */
export interface ProcessingQueueItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  category?: string;
  severity?: number;
  urgency?: number;
  priorityScore?: number;
  createdAt: Date | string;
}

/**
 * ComplaintProcessingQueue
 *
 * Purpose: a simple FIFO queue used to model sequential processing of
 * complaints. Implemented as an array with a `front` index to avoid O(n)
 * shifts on dequeues. Periodic compaction slices the underlying array to
 * reclaim memory when the `front` grows.
 *
 * Main operations:
 * - `enqueue(item)`: add to tail (amortized O(1))
 * - `dequeue()`: remove from head (amortized O(1))
 * - `peek()`, `size()`, `isEmpty()`
 *
 * Usage in SCRS: demonstrates FIFO processing (e.g., worker queues) and
 * contrasts with priority-based processing provided by the heap.
 */
export class ComplaintProcessingQueue {
  private items: ProcessingQueueItem[] = [];
  private front = 0;

  constructor(initialItems: ProcessingQueueItem[] = []) {
    this.items = initialItems.map((item) => ({
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt)
    }));
    this.front = 0;
  }

  enqueue(item: ProcessingQueueItem): number {
    this.items.push({
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt)
    });

    return this.items.length - this.front;
  }

  dequeue(): ProcessingQueueItem | null {
    if (this.isEmpty()) {
      return null;
    }

    const first = this.items[this.front];
    this.front += 1;

    if (this.front * 2 >= this.items.length) {
      this.items = this.items.slice(this.front);
      this.front = 0;
    }

    return first ?? null;
  }

  peek(): ProcessingQueueItem | null {
    if (this.isEmpty()) {
      return null;
    }

    return this.items[this.front] ?? null;
  }

  isEmpty(): boolean {
    return this.front >= this.items.length;
  }

  size(): number {
    return this.items.length - this.front;
  }

  toArray(): ProcessingQueueItem[] {
    return this.items.slice(this.front).map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  }
}
