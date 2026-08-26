import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Need to run this script from apps/api
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
    let credential;
    
    if (serviceAccountStr.startsWith('{')) {
      serviceAccountStr = serviceAccountStr
        .replace(/[\x00-\x1F\x7F]/g, (ch) => {
          if (ch === '\n' || ch === '\r' || ch === '\t') return '';
          return ch;
        });
      const parsed = JSON.parse(serviceAccountStr);
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      credential = admin.credential.cert(parsed);
    } else {
      const decoded = Buffer.from(serviceAccountStr, 'base64').toString('utf-8');
      credential = admin.credential.cert(JSON.parse(decoded));
    }
  
    admin.initializeApp({
      credential: credential,
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://placementx-a3f1d-default-rtdb.firebaseio.com',
    });
  } catch (err) {
    console.error("Firebase init failed:", err);
    process.exit(1);
  }
} else {
  console.error("No FIREBASE_SERVICE_ACCOUNT_KEY");
  process.exit(1);
}


async function main() {
  const newPasswordPlain = 'student@123';
  const newPasswordHash = await bcrypt.hash(newPasswordPlain, 10);
  
  // Get all students EXCEPT kunal.khaire177@nmims.in
  const students = await prisma.user.findMany({
    where: { 
      role: 'STUDENT',
      email: {
        not: 'kunal.khaire177@nmims.in'
      }
    },
    select: { id: true, email: true, firebaseUid: true }
  });
  
  console.log(`Found ${students.length} students to update.`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // To avoid hitting Firebase Auth rate limits we process in smaller batches
  const batchSize = 10;
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (student) => {
      try {
        // 1. Update in Postgres
        await prisma.user.update({
          where: { id: student.id },
          data: { password: newPasswordHash } 
        });
  
        // 2. Update in Firebase Auth
        if (student.firebaseUid) {
          try {
            await admin.auth().updateUser(student.firebaseUid, {
              password: newPasswordPlain
            });
          } catch(err: any) {
             if (err.code === 'auth/user-not-found') {
                // User doesn't exist in firebase auth despite having UID in postgres. 
                // Create user.
                const fbUser = await admin.auth().createUser({
                  uid: student.firebaseUid,
                  email: student.email,
                  password: newPasswordPlain,
                  emailVerified: true
                });
             } else {
               throw err;
             }
          }
        } else {
          // If not in Firebase yet, let's create the user in Firebase Auth
          try {
            const fbUser = await admin.auth().createUser({
              email: student.email,
              password: newPasswordPlain,
              emailVerified: true
            });
            
            await prisma.user.update({
              where: { id: student.id },
              data: { firebaseUid: fbUser.uid }
            });
          } catch (fbErr: any) {
            // It might already exist by email
            if (fbErr.code === 'auth/email-already-exists') {
              const userRec = await admin.auth().getUserByEmail(student.email);
              await admin.auth().updateUser(userRec.uid, {
                password: newPasswordPlain
              });
              await prisma.user.update({
                where: { id: student.id },
                data: { firebaseUid: userRec.uid }
              });
            } else {
              throw fbErr;
            }
          }
        }
  
        successCount++;
      } catch (err) {
        console.error(`Error processing ${student.email}:`, err);
        errorCount++;
      }
    }));
    
    console.log(`Processed ${Math.min(i + batchSize, students.length)}/${students.length} users...`);
  }

  console.log(`\nUpdate Complete!`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Failed updates: ${errorCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
