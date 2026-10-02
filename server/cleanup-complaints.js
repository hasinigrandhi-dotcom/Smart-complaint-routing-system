const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.complaintStatusHistory.deleteMany(),
    prisma.complaintAssignment.deleteMany(),
    prisma.complaint.deleteMany(),
  ]);

  console.log('All complaint data removed successfully.');
  console.log('Users and departments were preserved.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });