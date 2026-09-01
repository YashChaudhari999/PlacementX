import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'akshay.deshmukh.regular20@example.com';
  
  const importedStudent = await prisma.importedStudent.findFirst({
    where: { email }
  });

  if (!importedStudent) {
    console.log(`ImportedStudent ${email} not found.`);
    return;
  }

  console.log("=== ImportedStudent Details ===");
  console.log("studentId:", importedStudent.studentId);
  console.log("fullName:", importedStudent.fullName);
  console.log("email:", importedStudent.email);
  console.log("profileComplete:", importedStudent.profileComplete);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
