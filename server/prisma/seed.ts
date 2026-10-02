import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';
import { loadDepartmentGraphFromDatabase } from '../src/services/departmentGraphService';
import { ComplaintRoutingService, buildCategoryToDepartmentMap } from '../src/dsa/complaintRouting';
import { sortComplaints, findComplaintByIdLinear } from '../src/services/complaintAlgorithmService';

async function readFixture<T>(name: string): Promise<T> {
  const file = path.join(__dirname, 'fixtures', name);
  const raw = await fs.promises.readFile(file, 'utf-8');
  return JSON.parse(raw) as T;
}

async function main() {
  console.log('Starting demo seed...');

  const users = await readFixture<any[]>('users.json');
  const departments = await readFixture<any[]>('departments.json');
  const complaints = await readFixture<any[]>('complaints.json');

  // Upsert users (hash passwords using bcryptjs to match authService)
  // NOTE: fixtures store plain-text demo passwords for convenience. The
  // seed hashes them before storing in the database so the authentication
  // flow remains consistent with runtime usage. The fixtures use stable
  // ids and unique emails so the upsert below is repeatable.
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash,
        role: u.role === 'ADMIN' ? 'ADMIN' : 'USER'
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role === 'ADMIN' ? 'ADMIN' : 'USER'
      }
    });
  }

  // Upsert departments by unique code
  for (const d of departments) {
    await prisma.department.upsert({
      where: { code: d.code },
      update: {
        name: d.name,
        description: d.description ?? null,
        area: d.area ?? null,
        capacity: d.capacity ?? 0,
        isActive: d.isActive ?? true
      },
      create: {
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description ?? null,
        area: d.area ?? null,
        capacity: d.capacity ?? 0,
        isActive: d.isActive ?? true
      }
    });
  }

  // Upsert complaints using stable IDs and link to user by email
  for (const c of complaints) {
    const user = await prisma.user.findUnique({ where: { email: c.userEmail } });
    if (!user) {
      console.warn(`Skipping complaint ${c.title}: user ${c.userEmail} not found`);
      continue;
    }

    await prisma.complaint.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        description: c.description,
        category: c.category,
        severity: c.severity ?? 1,
        urgency: c.urgency ?? 1,
        status: c.status ?? 'SUBMITTED',
        priorityScore: c.priorityScore ?? 0,
        location: c.location ?? null,
        area: c.area ?? null,
        isEscalated: c.isEscalated ?? false,
        updatedAt: new Date(c.createdAt ?? Date.now())
      },
      create: {
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        severity: c.severity ?? 1,
        urgency: c.urgency ?? 1,
        status: c.status ?? 'SUBMITTED',
        priorityScore: c.priorityScore ?? 0,
        location: c.location ?? null,
        area: c.area ?? null,
        isEscalated: c.isEscalated ?? false,
        createdAt: new Date(c.createdAt ?? Date.now()),
        userId: user.id
      }
    });
  }

  console.log('Seeded users, departments and complaints (upsert).');

  // Verification: counts
  const userCount = await prisma.user.count();
  const deptCount = await prisma.department.count();
  const compCount = await prisma.complaint.count();
  console.log(`Current counts -> users: ${userCount}, departments: ${deptCount}, complaints: ${compCount}`);

  // Load department graph and run routing checks
  const graph = await loadDepartmentGraphFromDatabase();
  const categoryMap = buildCategoryToDepartmentMap();
  const routingService = new ComplaintRoutingService(categoryMap, graph, 'water');

  console.log('Loaded department graph with vertices:', graph.getVertices().map((v) => v.id));

  // Route first few complaints
  const seededComplaints = await prisma.complaint.findMany({ take: 5, orderBy: { createdAt: 'asc' } });
  for (const sc of seededComplaints) {
    const result = routingService.routeComplaint({ id: sc.id, category: sc.category, priorityScore: sc.priorityScore });
    console.log(`Routing for complaint ${sc.id} (${sc.category}):`, result ? { route: result.route, cost: result.totalCost } : 'no route');
  }

  // Demonstrate sorting/searching on a sample list
  const simpleList = seededComplaints.map((c) => ({ id: c.id, title: c.title, priorityScore: c.priorityScore, status: c.status, category: c.category, createdAt: c.createdAt }));
  const sorted = sortComplaints(simpleList, 'priority', 'desc');
  console.log('Top complaint by priority after sort:', sorted[0]?.id ?? 'none');

  const lookupId = seededComplaints[0]?.id;
  if (lookupId) {
    const found = findComplaintByIdLinear(simpleList, lookupId);
    console.log(`Linear search lookup for ${lookupId}:`, found ? 'found' : 'not found');
  }

  console.log('Demo seed complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
