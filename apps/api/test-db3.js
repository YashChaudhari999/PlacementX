const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const newHash = await bcrypt.hash('student123', 10);
  await prisma.user.update({
    where: { email: 'aarav.patil.regular01@example.com' },
    data: { password: newHash }
  });
  console.log('Password reset to student123 successfully!');
}

main().finally(() => prisma.$disconnect());
