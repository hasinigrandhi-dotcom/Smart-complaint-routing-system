import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MaxComplaintPriorityQueue } from './complaintPriorityQueue';

describe('MaxComplaintPriorityQueue', () => {
  it('inserts complaints and maintains heap order', () => {
    const queue = new MaxComplaintPriorityQueue();

    queue.enqueue({ id: 'a', title: 'Low', priorityScore: 20, createdAt: new Date('2024-01-01T00:00:00Z') });
    queue.enqueue({ id: 'b', title: 'High', priorityScore: 80, createdAt: new Date('2024-01-02T00:00:00Z') });
    queue.enqueue({ id: 'c', title: 'Medium', priorityScore: 50, createdAt: new Date('2024-01-03T00:00:00Z') });

    assert.equal(queue.peek()?.id, 'b');
    assert.equal(queue.size(), 3);
  });

  it('peeks at the highest-priority complaint', () => {
    const queue = new MaxComplaintPriorityQueue([
      { id: 'a', title: 'A', priorityScore: 30, createdAt: new Date('2024-01-01T00:00:00Z') },
      { id: 'b', title: 'B', priorityScore: 90, createdAt: new Date('2024-01-02T00:00:00Z') },
      { id: 'c', title: 'C', priorityScore: 60, createdAt: new Date('2024-01-03T00:00:00Z') }
    ]);

    assert.equal(queue.peek()?.id, 'b');
  });

  it('extracts the highest-priority complaint', () => {
    const queue = new MaxComplaintPriorityQueue([
      { id: 'a', title: 'A', priorityScore: 25, createdAt: new Date('2024-01-01T00:00:00Z') },
      { id: 'b', title: 'B', priorityScore: 75, createdAt: new Date('2024-01-02T00:00:00Z') },
      { id: 'c', title: 'C', priorityScore: 40, createdAt: new Date('2024-01-03T00:00:00Z') }
    ]);

    assert.equal(queue.extract()?.id, 'b');
    assert.equal(queue.peek()?.id, 'c');
  });

  it('handles empty queue behavior', () => {
    const queue = new MaxComplaintPriorityQueue();

    assert.equal(queue.isEmpty(), true);
    assert.equal(queue.size(), 0);
    assert.equal(queue.peek(), null);
    assert.equal(queue.extract(), null);
  });

  it('breaks ties using older creation time first', () => {
    const queue = new MaxComplaintPriorityQueue();

    queue.enqueue({ id: 'a', title: 'Later', priorityScore: 55, createdAt: new Date('2024-01-03T00:00:00Z') });
    queue.enqueue({ id: 'b', title: 'Earlier', priorityScore: 55, createdAt: new Date('2024-01-01T00:00:00Z') });

    assert.equal(queue.peek()?.id, 'b');
    assert.equal(queue.extract()?.id, 'b');
    assert.equal(queue.extract()?.id, 'a');
  });
});
