import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DepartmentGraph } from './departmentGraph';

describe('DepartmentGraph', () => {
  it('adds vertices', () => {
    const graph = new DepartmentGraph();
    assert.equal(graph.addVertex({ id: 'water', name: 'Water Department' }), true);
    assert.equal(graph.hasVertex('water'), true);
  });

  it('adds edges and retrieves neighbors', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });
    graph.addEdge('water', 'roads', 5);

    assert.equal(graph.hasEdge('water', 'roads'), true);
    assert.deepEqual(graph.getNeighbors('water'), [{ to: 'roads', weight: 5 }]);
  });

  it('checks vertex and edge existence', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'sanitation', name: 'Sanitation Department' });

    assert.equal(graph.hasVertex('sanitation'), true);
    assert.equal(graph.hasVertex('unknown'), false);
    assert.equal(graph.hasEdge('sanitation', 'unknown'), false);
  });

  it('removes edges', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });
    graph.addEdge('water', 'roads', 4);

    assert.equal(graph.removeEdge('water', 'roads'), true);
    assert.equal(graph.hasEdge('water', 'roads'), false);
  });

  it('removes vertices and clears related edges', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });
    graph.addEdge('water', 'roads', 3);

    assert.equal(graph.removeVertex('roads'), true);
    assert.equal(graph.hasVertex('roads'), false);
    assert.equal(graph.hasEdge('water', 'roads'), false);
  });

  it('supports weighted edges', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'electricity', name: 'Electricity Department' });
    graph.addVertex({ id: 'garbage', name: 'Garbage Department' });
    graph.addEdge('electricity', 'garbage', 8);

    const neighbors = graph.getNeighbors('electricity');
    assert.equal(neighbors[0].weight, 8);
  });

  it('prevents duplicate vertices and edges', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'water', name: 'Duplicate' });
    graph.addEdge('water', 'water', 2);

    assert.equal(graph.size(), 1);
    assert.equal(graph.hasEdge('water', 'water'), false);
  });
});
