import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ComplaintProcessingQueue } from './complaintProcessingQueue';

describe('ComplaintProcessingQueue', () => {
  it('enqueues items', () => {
    const queue = new ComplaintProcessingQueue();
    queue.enqueue({ id: 'a', title: 'Complaint A', createdAt: new Date('2024-01-01T00:00:00Z') });

    assert.equal(queue.size(), 1);
    assert.equal(queue.peek()?.id, 'a');
  });

  it('dequeues items in FIFO order', () => {
    const queue = new ComplaintProcessingQueue();
    queue.enqueue({ id: 'a', title: 'Complaint A', createdAt: new Date('2024-01-01T00:00:00Z') });
    queue.enqueue({ id: 'b', title: 'Complaint B', createdAt: new Date('2024-01-02T00:00:00Z') });

    assert.equal(queue.dequeue()?.id, 'a');
    assert.equal(queue.dequeue()?.id, 'b');
  });

  it('peeks at the next complaint', () => {
    const queue = new ComplaintProcessingQueue();
    queue.enqueue({ id: 'a', title: 'Complaint A', createdAt: new Date('2024-01-01T00:00:00Z') });
    queue.enqueue({ id: 'b', title: 'Complaint B', createdAt: new Date('2024-01-02T00:00:00Z') });

    assert.equal(queue.peek()?.id, 'a');
  });

  it('handles empty queue behavior', () => {
    const queue = new ComplaintProcessingQueue();

    assert.equal(queue.isEmpty(), true);
    assert.equal(queue.size(), 0);
    assert.equal(queue.peek(), null);
    assert.equal(queue.dequeue(), null);
  });

  it('supports multiple enqueue and dequeue operations', () => {
    const queue = new ComplaintProcessingQueue();

    queue.enqueue({ id: 'a', title: 'Complaint A', createdAt: new Date('2024-01-01T00:00:00Z') });
    queue.enqueue({ id: 'b', title: 'Complaint B', createdAt: new Date('2024-01-02T00:00:00Z') });
    queue.enqueue({ id: 'c', title: 'Complaint C', createdAt: new Date('2024-01-03T00:00:00Z') });

    assert.equal(queue.dequeue()?.id, 'a');
    assert.equal(queue.size(), 2);
    assert.equal(queue.peek()?.id, 'b');
    assert.equal(queue.dequeue()?.id, 'b');
    assert.equal(queue.dequeue()?.id, 'c');
    assert.equal(queue.isEmpty(), true);
  });
});
