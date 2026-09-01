import prisma from './utils/prisma';
import bcrypt from 'bcrypt';


async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@nmims.edu' },
    update: {},
    create: {
      email: 'admin@nmims.edu',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      adminProfile: {
        create: {
          firstName: 'Placement',
          lastName: 'Admin'
        }
      }
    },
  });

  await prisma.user.upsert({
    where: { email: 'student.name@nmims.edu' },
    update: {},
    create: {
      email: 'student.name@nmims.edu',
      password: studentPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          firstName: 'Student',
          lastName: 'Name',
          branch: 'B.Tech CS'
        }
      }
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
