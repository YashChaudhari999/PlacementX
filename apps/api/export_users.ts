import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching users from the database...');
  
  const users = await prisma.user.findMany({
    select: {
      email: true,
      password: true,
      role: true
    }
  });

  console.log(`Found ${users.length} users. Analyzing passwords and generating PDF...`);

  const doc = new PDFDocument();
  const outputPath = path.join(__dirname, 'User_Credentials.pdf');
  
  doc.pipe(fs.createWriteStream(outputPath));

  doc.fontSize(20).text('User Credentials Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    let displayPassword = '<Encrypted>';
    
    // Check if the hash matches the newly set 'student@123'
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
       try {
          if (bcrypt.compareSync('student@123', user.password)) {
             displayPassword = 'student@123';
          } else {
             displayPassword = '<Encrypted Hash - Cannot Decrypt>';
          }
       } catch(e) {
          displayPassword = '<Error reading hash>';
       }
    } else {
       // If it's stored in plain text for some reason
       displayPassword = user.password;
    }

    doc.fontSize(12)
       .text(`User ${i + 1}:`, { underline: true })
       .text(`Email: ${user.email}`)
       .text(`Password: ${displayPassword}`)
       .text(`Role: ${user.role}`);
    doc.moveDown();
  }

  doc.end();

  console.log(`PDF successfully generated at: ${outputPath}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
