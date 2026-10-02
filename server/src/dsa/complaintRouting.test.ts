import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ComplaintRoutingService, buildCategoryToDepartmentMap } from './complaintRouting';
import { DepartmentGraph } from './departmentGraph';

describe('ComplaintRoutingService', () => {
  it('routes a complaint to the correct department', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });
    graph.addVertex({ id: 'sanitation', name: 'Sanitation Department' });
    graph.addEdge('water', 'roads', 4);
    graph.addEdge('roads', 'sanitation', 2);

    const routing = new ComplaintRoutingService(buildCategoryToDepartmentMap(), graph, 'water');
    const result = routing.routeComplaint({ id: 'c1', category: 'WATER_SUPPLY' }, 'water');

    assert.ok(result);
    assert.equal(result?.destinationDepartmentId, 'water');
    assert.deepEqual(result?.route, ['water']);
  });

  it('finds a valid graph path', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });
    graph.addVertex({ id: 'garbage', name: 'Garbage Department' });
    graph.addEdge('water', 'roads', 3);
    graph.addEdge('roads', 'garbage', 5);

    const routing = new ComplaintRoutingService(buildCategoryToDepartmentMap(), graph, 'water');
    const result = routing.routeComplaint({ id: 'c2', category: 'GARBAGE' }, 'water');

    assert.ok(result);
    assert.deepEqual(result?.route, ['water', 'roads', 'garbage']);
  });

  it('selects the shortest low-cost path when multiple routes exist', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });
    graph.addVertex({ id: 'sanitation', name: 'Sanitation Department' });
    graph.addVertex({ id: 'public-safety', name: 'Public Safety' });
    graph.addEdge('water', 'roads', 4);
    graph.addEdge('water', 'sanitation', 1);
    graph.addEdge('roads', 'public-safety', 2);
    graph.addEdge('sanitation', 'public-safety', 7);

    const routing = new ComplaintRoutingService(buildCategoryToDepartmentMap(), graph, 'water');
    const result = routing.routeComplaint({ id: 'c3', category: 'PUBLIC_SAFETY' }, 'water');

    assert.ok(result);
    assert.equal(result?.destinationDepartmentId, 'public-safety');
    assert.equal(result?.totalCost, 6);
  });

  it('handles no available path', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });

    const routing = new ComplaintRoutingService(buildCategoryToDepartmentMap(), graph, 'water');
    const result = routing.routeComplaint({ id: 'c4', category: 'PUBLIC_SAFETY' }, 'water');

    assert.equal(result, null);
  });

  it('handles unknown complaint category', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });

    const routing = new ComplaintRoutingService(buildCategoryToDepartmentMap(), graph, 'water');
    const result = routing.routeComplaint({ id: 'c5', category: 'UNKNOWN_CATEGORY' }, 'water');

    assert.equal(result, null);
  });

  it('handles missing department in graph', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });

    const routing = new ComplaintRoutingService(buildCategoryToDepartmentMap(), graph, 'water');
    const result = routing.routeComplaint({ id: 'c6', category: 'ROADS' }, 'water');

    assert.equal(result, null);
  });

  it('returns a simple direct route for the mapped department', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });

    const routing = new ComplaintRoutingService(buildCategoryToDepartmentMap(), graph, 'water');
    const result = routing.routeComplaint({ id: 'c7', category: 'WATER_SUPPLY' }, 'water');

    assert.ok(result);
    assert.equal(result?.route.length, 1);
    assert.equal(result?.totalCost, 0);
  });

  it('returns route information correctly', () => {
    const graph = new DepartmentGraph();
    graph.addVertex({ id: 'water', name: 'Water Department' });
    graph.addVertex({ id: 'roads', name: 'Roads Department' });
    graph.addVertex({ id: 'sanitation', name: 'Sanitation Department' });
    graph.addEdge('water', 'roads', 2);
    graph.addEdge('roads', 'sanitation', 3);

    const routing = new ComplaintRoutingService(buildCategoryToDepartmentMap(), graph, 'water');
    const result = routing.routeComplaint({ id: 'c8', category: 'SANITATION' }, 'water');

    assert.ok(result);
    assert.equal(result?.complaintId, 'c8');
    assert.deepEqual(result?.route, ['water', 'roads', 'sanitation']);
    assert.equal(result?.totalCost, 5);
    assert.ok(result?.reason?.includes('SANITATION'));
  });
});
