const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "StudentProfile" DROP COLUMN IF EXISTS "profileEmbedding";');
  await prisma.$executeRawUnsafe('ALTER TABLE "PlacementDrive" DROP COLUMN IF EXISTS "jobEmbedding";');
  console.log('Dropped columns');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
