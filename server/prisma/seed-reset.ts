import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma';

async function readFixture<T>(name: string): Promise<T> {
  const file = path.join(__dirname, 'fixtures', name);
  const raw = await fs.promises.readFile(file, 'utf-8');
  return JSON.parse(raw) as T;
}

async function main() {
  console.log('Resetting demo seed data (only demo records will be removed)');
  const users = await readFixture<any[]>('users.json');
  const departments = await readFixture<any[]>('departments.json');
  const complaints = await readFixture<any[]>('complaints.json');

  const complaintIds = complaints.map((c) => c.id);
  const userEmails = users.map((u) => u.email);
  const deptCodes = departments.map((d) => d.code);

  // Remove dependent records first
  // Only remove records tied to demo complaint IDs to avoid touching
  // unrelated production data. This reset is intentionally scoped and
  // non-destructive outside demo fixtures.
  await prisma.complaintAssignment.deleteMany({ where: { complaintId: { in: complaintIds } } });
  await prisma.complaintStatusHistory.deleteMany({ where: { complaintId: { in: complaintIds } } });

  // Remove complaints
  await prisma.complaint.deleteMany({ where: { id: { in: complaintIds } } });

  // Remove departments by code (safe: only the demo codes listed)
  await prisma.department.deleteMany({ where: { code: { in: deptCodes } } });

  // Remove demo users by email
  await prisma.user.deleteMany({ where: { email: { in: userEmails } } });

  console.log('Demo reset complete.');
}

main()
  .catch((err) => {
    console.error('Reset failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
