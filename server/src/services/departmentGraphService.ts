import prisma from '../lib/prisma';
import { DepartmentGraph, DepartmentGraphVertex } from '../dsa/departmentGraph';

export type DepartmentEdgeInput = {
  fromDepartmentId: string;
  toDepartmentId: string;
  weight?: number;
};

export async function loadDepartmentGraphFromDatabase() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      area: true
    }
  });

  // Build an in-memory DepartmentGraph used by the routing service. The
  // persistent `Department` table is the source-of-truth; the graph here is
  // a convenience structure used only at runtime for pathfinding demos.
  const graph = new DepartmentGraph();

  departments.forEach((department) => {
    graph.addVertex({
      id: department.id,
      name: department.name,
      code: department.code,
      area: department.area ?? undefined,
      description: department.description ?? null
    });
  });

  const departmentIds = departments.map((department) => department.id);
  departmentIds.forEach((departmentId, index) => {
    const nextDepartmentId = departmentIds[(index + 1) % departmentIds.length];
    if (departmentId !== nextDepartmentId) {
      graph.addEdge(departmentId, nextDepartmentId, 1);
    }
  });

  return graph;
}

export function createDepartmentGraphFromRecords(vertices: DepartmentGraphVertex[], edges: DepartmentEdgeInput[]) {
  const graph = new DepartmentGraph();

  vertices.forEach((vertex) => {
    graph.addVertex(vertex);
  });

  edges.forEach((edge) => {
    graph.addEdge(edge.fromDepartmentId, edge.toDepartmentId, edge.weight);
  });

  return graph;
}
