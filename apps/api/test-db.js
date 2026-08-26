const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.studentProfile.findFirst({
    where: { firstName: 'Aarav' },
    include: { user: true }
  });
  console.log('Email:', profile ? profile.user.email : 'Not found');
  console.log('Password (hashed):', profile ? profile.user.password : 'Not found');
}

main().finally(() => prisma.$disconnect());
