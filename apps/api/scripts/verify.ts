import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Academic Year Counts ===');
  const yearCounts = await prisma.importedStudent.groupBy({
    by: ['academicYear'],
    _count: { academicYear: true },
    orderBy: { academicYear: 'asc' }
  });
  console.table(yearCounts);

  console.log('\n=== Department + Year Counts ===');
  const deptCounts = await prisma.importedStudent.groupBy({
    by: ['department', 'academicYear', 'studentStatus'],
    _count: { id: true },
    orderBy: [
      { academicYear: 'asc' },
      { department: 'asc' }
    ]
  });
  console.table(deptCounts);

  console.log('\n=== Duplicates Check ===');
  const duplicateCheck = await prisma.importedStudent.groupBy({
    by: ['studentId', 'academicYear'],
    _count: { studentId: true },
    having: {
      studentId: {
        _count: { gt: 1 }
      }
    }
  });
  console.log(`Found duplicates: ${duplicateCheck.length}`);
  if (duplicateCheck.length > 0) {
    console.table(duplicateCheck);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
