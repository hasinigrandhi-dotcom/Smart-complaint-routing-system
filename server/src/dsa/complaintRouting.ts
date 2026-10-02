import { DepartmentGraph } from './departmentGraph';
import { MaxComplaintPriorityQueue } from './complaintPriorityQueue';

export type RoutingComplaintInput = {
  id?: string;
  category?: string;
  priorityScore?: number;
  severity?: number;
  urgency?: number;
  title?: string;
  description?: string;
};

export type CategoryDepartmentMap = Record<string, string[]>;

export type RoutingResult = {
  complaintId?: string;
  sourceDepartmentId?: string;
  destinationDepartmentId: string;
  route: string[];
  totalCost: number;
  reason: string;
  priorityScore?: number;
};

/**
 * ComplaintRoutingService
 *
 * Purpose: resolve a complaint's category to a destination department using
 * a category→department mapping and the department graph. When the source
 * department differs, the service finds a lowest-cost path using a Dijkstra-
 * style traversal (priority queue drives the exploration). The service does
 * not modify persistent state — it returns routing metadata that the caller
 * can use to create assignments.
 *
 * Important notes:
 * - Categories are normalized to upper-case and resolved via a map of aliases.
 * - The graph must be loaded (non-empty) for routing to succeed.
 */
export class ComplaintRoutingService {
  constructor(
    private readonly categoryMap: CategoryDepartmentMap,
    private readonly graph: DepartmentGraph,
    private readonly defaultDepartmentId?: string
  ) {}

  routeComplaint(complaint: RoutingComplaintInput, sourceDepartmentId?: string): RoutingResult | null {
    if (!complaint || !this.graph || !this.graph.getVertices().length) {
      return null;
    }

    const category = complaint.category?.trim();
    if (!category) {
      return null;
    }

    const normalizedCategory = category.toUpperCase();
    const targetDepartmentId = this.resolveDepartmentForCategory(normalizedCategory);

    if (!targetDepartmentId || !this.graph.hasVertex(targetDepartmentId)) {
      return null;
    }

    const startDepartmentId = sourceDepartmentId && this.graph.hasVertex(sourceDepartmentId)
      ? sourceDepartmentId
      : this.defaultDepartmentId && this.graph.hasVertex(this.defaultDepartmentId)
        ? this.defaultDepartmentId
        : targetDepartmentId;

    if (startDepartmentId === targetDepartmentId) {
      return {
        complaintId: complaint.id,
        sourceDepartmentId: startDepartmentId,
        destinationDepartmentId: targetDepartmentId,
        route: [targetDepartmentId],
        totalCost: 0,
        reason: `Complaint category ${normalizedCategory} already maps to the active department ${targetDepartmentId}`,
        priorityScore: complaint.priorityScore
      };
    }

    const path = this.findShortestPath(startDepartmentId, targetDepartmentId);
    if (!path || path.length === 0) {
      return null;
    }

    return {
      complaintId: complaint.id,
      sourceDepartmentId: startDepartmentId,
      destinationDepartmentId: path[path.length - 1],
      route: path,
      totalCost: this.calculatePathCost(path),
      reason: `Complaint category ${normalizedCategory} resolves to ${targetDepartmentId} through the department graph`,
      priorityScore: complaint.priorityScore
    };
  }

  getDepartmentForCategory(category: string): string | null {
    const normalizedCategory = category?.trim().toUpperCase();
    if (!normalizedCategory) {
      return null;
    }

    return this.resolveDepartmentForCategory(normalizedCategory);
  }

  private resolveDepartmentForCategory(category: string): string | null {
    const categoryAliases = this.categoryMap[category] ?? [];

    for (const alias of categoryAliases) {
      const candidate = this.findDepartmentByAlias(alias);
      if (candidate) {
        return candidate;
      }
    }

    return null;
  }

  private findDepartmentByAlias(alias: string): string | null {
    const normalizedAlias = this.normalizeName(alias);
    const vertices = this.graph.getVertices();

    for (const vertex of vertices) {
      const name = this.normalizeName(vertex.name);
      const code = this.normalizeName(vertex.code ?? '');
      if (name.includes(normalizedAlias) || code.includes(normalizedAlias)) {
        return vertex.id;
      }
    }

    return null;
  }

  private normalizeName(value: string): string {
    return value.trim().toLowerCase().replace(/[_-]+/g, ' ');
  }

  private findShortestPath(startId: string, targetId: string): string[] | null {
    if (!this.graph.hasVertex(startId) || !this.graph.hasVertex(targetId)) {
      return null;
    }

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const queue = new MaxComplaintPriorityQueue();

    for (const vertex of this.graph.getVertices()) {
      distances[vertex.id] = Infinity;
      previous[vertex.id] = null;
    }

    distances[startId] = 0;
    queue.enqueue({
      id: startId,
      title: startId,
      priorityScore: 0,
      createdAt: new Date()
    });

    while (!queue.isEmpty()) {
      const current = queue.extract();
      if (!current) {
        break;
      }

      const currentId = current.id;
      const currentDistance = distances[currentId];
      if (currentDistance === Infinity) {
        continue;
      }

      if (currentId === targetId) {
        break;
      }

      for (const neighbor of this.graph.getNeighbors(currentId)) {
        const nextId = neighbor.to;
        const edgeWeight = neighbor.weight ?? 1;
        const nextDistance = currentDistance + edgeWeight;

        if (nextDistance < (distances[nextId] ?? Infinity)) {
          distances[nextId] = nextDistance;
          previous[nextId] = currentId;
          queue.enqueue({
            id: nextId,
            title: nextId,
            priorityScore: -nextDistance,
            createdAt: new Date()
          });
        }
      }
    }

    if (distances[targetId] === Infinity) {
      return null;
    }

    const path: string[] = [];
    let cursor: string | null = targetId;
    while (cursor) {
      path.unshift(cursor);
      cursor = previous[cursor] ?? null;
    }

    return path.length > 0 ? path : null;
  }

  private calculatePathCost(path: string[]): number {
    if (path.length <= 1) {
      return 0;
    }

    let totalCost = 0;
    for (let index = 0; index < path.length - 1; index += 1) {
      const source = path[index];
      const target = path[index + 1];
      const neighbors = this.graph.getNeighbors(source);
      const nextEdge = neighbors.find((edge) => edge.to === target);
      totalCost += nextEdge?.weight ?? 1;
    }

    return totalCost;
  }
}

export function createDefaultComplaintCategoryMap(): CategoryDepartmentMap {
  return {
    WATER_SUPPLY: ['water', 'water supply', 'water and sewer'],
    ROADS: ['roads', 'road maintenance', 'transport'],
    ELECTRICITY: ['electricity', 'electrical', 'power'],
    SANITATION: ['sanitation', 'sanitary', 'sewer'],
    GARBAGE: ['garbage', 'solid waste', 'waste management'],
    PUBLIC_SAFETY: ['public safety', 'safety', 'security'],
    STREET_LIGHTS: ['street lights', 'street lighting', 'lighting'],
    OTHER: ['other', 'general services', 'public works']
  };
}

export function getRoutingPriorityWeight(complaint: RoutingComplaintInput): number {
  if (!complaint) {
    return 0;
  }

  const severityScore = (complaint.severity ?? 1) * 10;
  const urgencyScore = (complaint.urgency ?? 1) * 12;
  const priorityScore = complaint.priorityScore ?? 0;

  return Number((severityScore + urgencyScore + priorityScore).toFixed(2));
}

export function buildCategoryToDepartmentMap(): CategoryDepartmentMap {
  return createDefaultComplaintCategoryMap();
}
