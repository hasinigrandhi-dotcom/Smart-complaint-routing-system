import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ComplaintHashMap } from './complaintHashMap';

describe('ComplaintHashMap', () => {
  it('sets and gets values', () => {
    const map = new ComplaintHashMap<{ id: string }>();
    map.set('complaint-1', { id: 'complaint-1' });

    assert.deepEqual(map.get('complaint-1'), { id: 'complaint-1' });
  });

  it('checks whether a key exists', () => {
    const map = new ComplaintHashMap<number>();
    map.set('a', 100);

    assert.equal(map.has('a'), true);
    assert.equal(map.has('missing'), false);
  });

  it('deletes keys correctly', () => {
    const map = new ComplaintHashMap<string>();
    map.set('x', 'value');

    assert.equal(map.delete('x'), true);
    assert.equal(map.has('x'), false);
    assert.equal(map.delete('missing'), false);
  });

  it('clears all entries', () => {
    const map = new ComplaintHashMap<number>();
    map.set('a', 1);
    map.set('b', 2);

    map.clear();

    assert.equal(map.size(), 0);
    assert.equal(map.has('a'), false);
    assert.equal(map.has('b'), false);
  });

  it('tracks size correctly', () => {
    const map = new ComplaintHashMap<string>();
    assert.equal(map.size(), 0);

    map.set('a', 'one');
    map.set('b', 'two');

    assert.equal(map.size(), 2);
  });

  it('updates an existing key', () => {
    const map = new ComplaintHashMap<string>();
    map.set('complaint-1', 'old');
    map.set('complaint-1', 'new');

    assert.equal(map.get('complaint-1'), 'new');
    assert.equal(map.size(), 1);
  });

  it('returns undefined for missing keys', () => {
    const map = new ComplaintHashMap<string>();

    assert.equal(map.get('missing'), undefined);
  });

  it('handles collisions with separate chaining', () => {
    const map = new ComplaintHashMap<number>();
    map.set('abc', 1);
    map.set('cba', 2);

    assert.equal(map.get('abc'), 1);
    assert.equal(map.get('cba'), 2);
  });

  it('supports multiple keys', () => {
    const map = new ComplaintHashMap<number>();
    map.set('first', 10);
    map.set('second', 20);
    map.set(3, 30);

    assert.equal(map.get('first'), 10);
    assert.equal(map.get('second'), 20);
    assert.equal(map.get(3), 30);
  });
});
