/**
 * GraphEdge represents a directed edge in the department graph.
 * - `to`: destination department id
 * - `weight`: optional numeric cost used by Dijkstra (default assumed 1)
 */
export interface GraphEdge {
  to: string;
  weight?: number;
}

/**
 * DepartmentGraphVertex describes metadata about a department used in the
 * graph (id, name, optional code and area). The `id` is used as the unique
 * vertex identifier when building routes.
 */
export interface DepartmentGraphVertex {
  id: string;
  name: string;
  code?: string;
  area?: string;
  description?: string | null;
}

/**
 * DepartmentGraph
 *
 * Purpose: represent a directed, weighted graph of municipal departments.
 * The graph supports vertex addition/removal and edge creation with an
 * optional numeric weight. This structure is used as the routing substrate
 * for the ComplaintRoutingService which runs Dijkstra to find low-cost paths.
 *
 * Main operations: `addVertex`, `addEdge`, `getNeighbors`, `hasVertex`, and
 * `hasEdge`.
 * Complexity: adjacency lookups are O(1) for neighbor enumeration; Dijkstra
 * runs in O(E log V) when paired with a priority queue (implementation
 * detail resides in the routing service).
 */
export class DepartmentGraph {
  private vertices: Record<string, DepartmentGraphVertex> = {};
  private adjacency: Record<string, GraphEdge[]> = {};

  addVertex(vertex: DepartmentGraphVertex): boolean {
    if (this.vertices[vertex.id]) {
      return false;
    }

    this.vertices[vertex.id] = vertex;
    this.adjacency[vertex.id] = [];
    return true;
  }

  addEdge(fromId: string, toId: string, weight?: number): boolean {
    if (!this.hasVertex(fromId) || !this.hasVertex(toId)) {
      return false;
    }

    if (fromId === toId) {
      return false;
    }

    const neighbors = this.adjacency[fromId] ?? [];
    if (neighbors.some((edge) => edge.to === toId)) {
      return false;
    }

    neighbors.push({ to: toId, weight });
    this.adjacency[fromId] = neighbors;
    return true;
  }

  removeVertex(vertexId: string): boolean {
    if (!this.vertices[vertexId]) {
      return false;
    }

    delete this.vertices[vertexId];
    delete this.adjacency[vertexId];

    for (const currentVertexId of Object.keys(this.adjacency)) {
      this.adjacency[currentVertexId] = (this.adjacency[currentVertexId] ?? []).filter(
        (edge) => edge.to !== vertexId
      );
    }

    return true;
  }

  removeEdge(fromId: string, toId: string): boolean {
    if (!this.adjacency[fromId]) {
      return false;
    }

    const before = this.adjacency[fromId].length;
    this.adjacency[fromId] = this.adjacency[fromId].filter((edge) => edge.to !== toId);
    return this.adjacency[fromId].length !== before;
  }

  getNeighbors(vertexId: string): GraphEdge[] {
    return [...(this.adjacency[vertexId] ?? [])];
  }

  hasVertex(vertexId: string): boolean {
    return !!this.vertices[vertexId];
  }

  hasEdge(fromId: string, toId: string): boolean {
    return (this.adjacency[fromId] ?? []).some((edge) => edge.to === toId);
  }

  getVertices(): DepartmentGraphVertex[] {
    return Object.values(this.vertices);
  }

  size(): number {
    return Object.keys(this.vertices).length;
  }
}
