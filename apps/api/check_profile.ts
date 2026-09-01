import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'akshay.deshmukh.regular20@example.com';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: true
    }
  });

  if (!user) {
    console.log(`User ${email} not found.`);
    return;
  }

  if (!user.studentProfile) {
    console.log(`User ${email} has no student profile.`);
    return;
  }

  const p = user.studentProfile;
  console.log("=== Profile Details ===");
  console.log("firstName:", p.firstName);
  console.log("lastName:", p.lastName);
  console.log("phone:", p.phone);
  console.log("branch:", p.branch);
  console.log("cgpa:", p.cgpa);
  console.log("passingYear:", p.passingYear);
  console.log("resumeUrl:", p.resumeUrl);
  console.log("isProfileComplete:", p.isProfileComplete);
  console.log("profileStatus:", p.profileStatus);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
