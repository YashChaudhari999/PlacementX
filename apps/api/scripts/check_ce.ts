import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const records = await prisma.importedStudent.findMany({
    where: { department: 'Computer Engineering' },
    select: { studentId: true, academicYear: true, studentStatus: true }
  });
  console.log('Computer Engineering Records:', records.length);
  const byYear = {};
  for (const r of records) {
    byYear[r.academicYear] = (byYear[r.academicYear] || 0) + 1;
  }
  console.log(byYear);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
