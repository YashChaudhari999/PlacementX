import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function generateCredentials() {
  try {
    const profiles = await prisma.studentProfile.findMany({
      take: 20,
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    let markdown = `# Login Credentials (First 20 Students)\n\n`;
    markdown += `Below are the login credentials for 20 of the newly provisioned student accounts.\n\n`;
    markdown += `| Name | Email (Username) | Default Password | Role |\n`;
    markdown += `|------|------------------|------------------|------|\n`;

    for (const p of profiles) {
      if (p.user) {
        markdown += `| ${p.firstName} ${p.lastName} | \`${p.user.email}\` | \`student@123\` | ${p.user.role} |\n`;
      }
    }

    const outputPath = path.resolve(__dirname, '../../../login_credentials.md');
    fs.writeFileSync(outputPath, markdown);
    
    console.log(`Successfully wrote credentials to ${outputPath}`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

generateCredentials();
