import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const prisma = new PrismaClient();

// Ensure Supabase Service Role key is available
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("CRITICAL ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  console.error("Account provisioning requires the service role key to bypass RLS and create authenticated users.");
  process.exit(1);
}

// Create a Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function provisionStudents() {
  console.log("========================================");
  console.log("CURRENT YEAR STUDENT PROVISIONING SCRIPT");
  console.log("========================================");
  
  const ACADEMIC_YEAR = '2026/2027';
  const DEFAULT_PASSWORD = 'student@123';
  
  console.log(`Target Academic Year: ${ACADEMIC_YEAR}`);
  console.log(`Default Password (New Accounts): ${DEFAULT_PASSWORD}`);
  console.log("Starting provisioning process...\n");

  let stats = {
    totalStudents: 0,
    accountsCreated: 0,
    profilesCreated: 0,
    alreadyExisting: 0,
    missingEmail: 0,
    failed: 0
  };

  try {
    // 1. Fetch all imported students for current year
    const importedStudents = await prisma.importedStudent.findMany({
      where: { academicYear: ACADEMIC_YEAR }
    });

    stats.totalStudents = importedStudents.length;
    console.log(`Found ${stats.totalStudents} student records for ${ACADEMIC_YEAR}.`);

    if (stats.totalStudents === 0) {
      console.log("No students found to provision. Exiting.");
      return;
    }

    // 2. Iterate and provision
    for (const student of importedStudents) {
      console.log(`\nProcessing: ${student.fullName || 'Unknown'} (${student.studentId})`);
      
      // Validate Email
      if (!student.email || student.email.trim() === '') {
        console.log(`-> Skipped: Missing email address.`);
        stats.missingEmail++;
        continue;
      }
      
      const email = student.email.trim().toLowerCase();
      let authUserId: string | null = null;
      let isNewAccount = false;

      try {
        // Step A: Check Auth User in Supabase
        const { data: { users }, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
        if (fetchError) throw new Error(`Supabase Auth fetch error: ${fetchError.message}`);
        
        let authUser = users.find(u => u.email === email);
        
        if (!authUser) {
          // Create new user in Supabase Auth
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: DEFAULT_PASSWORD,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
              full_name: student.fullName,
              student_id: student.studentId
            }
          });
          
          if (createError) throw new Error(`Supabase Auth creation error: ${createError.message}`);
          
          authUser = newUser.user;
          isNewAccount = true;
          stats.accountsCreated++;
          console.log(`-> Created new Supabase Auth account.`);
        } else {
          stats.alreadyExisting++;
          console.log(`-> Supabase Auth account already exists.`);
        }

        authUserId = authUser?.id || null;
        if (!authUserId) throw new Error("Failed to resolve Auth User ID");

        // Step B: Ensure Prisma User exists
        let user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
          // Because we don't store plain passwords, and Firebase ID isn't used here, we put a dummy or the authUserId in firebaseUid if needed
          user = await prisma.user.create({
            data: {
              email,
              password: '', // Should ideally be handled securely, this column might be unused if relying entirely on Supabase Auth
              firebaseUid: authUserId, // Using firebaseUid column to store Supabase Auth ID
              role: 'STUDENT',
              mustChangePassword: isNewAccount
            }
          });
          console.log(`-> Created new Prisma User record.`);
        } else {
          // Ensure role is student and firebaseUid is linked
          await prisma.user.update({
            where: { email },
            data: { role: 'STUDENT', firebaseUid: authUserId }
          });
        }

        // Step C: Create or Link Student Profile
        let profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
        
        const firstName = student.fullName?.split(' ')[0] || '';
        const lastName = student.fullName?.split(' ').slice(1).join(' ') || '';
        const branch = student.department;
        const cgpa = student.cgpa;
        const gender = student.gender;
        const activeBacklogs = student.activeBacklogs || 0;
        
        let skillsObj = null;
        if (student.skills) {
          skillsObj = student.skills.split(',').map(s => s.trim());
        }

        if (!profile) {
          profile = await prisma.studentProfile.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              branch,
              cgpa,
              gender,
              activeBacklogs,
              skills: skillsObj ? JSON.stringify(skillsObj) : null,
              profileStatus: 'PENDING',
              isProfileComplete: false
            }
          });
          stats.profilesCreated++;
          console.log(`-> Created new Student Profile.`);
        } else {
          // Update missing academic fields if needed
          await prisma.studentProfile.update({
            where: { id: profile.id },
            data: {
              branch: profile.branch || branch,
              cgpa: profile.cgpa || cgpa,
              activeBacklogs: activeBacklogs,
              skills: profile.skills ? profile.skills : (skillsObj ? JSON.stringify(skillsObj) : null)
            }
          });
          console.log(`-> Linked and verified existing Student Profile.`);
        }

        console.log(`-> SUCCESS: Fully provisioned.`);

      } catch (err: any) {
        console.error(`-> FAILED: ${err.message}`);
        stats.failed++;
      }
    }
  } catch (error) {
    console.error("Fatal error during provisioning:", error);
  } finally {
    await prisma.$disconnect();
    
    console.log("\n========================================");
    console.log("PROVISIONING REPORT");
    console.log("========================================");
    console.log(`Total Students (2026/2027) : ${stats.totalStudents}`);
    console.log(`Accounts Created           : ${stats.accountsCreated}`);
    console.log(`Profiles Created           : ${stats.profilesCreated}`);
    console.log(`Already Existing (Auth)    : ${stats.alreadyExisting}`);
    console.log(`Missing Email              : ${stats.missingEmail}`);
    console.log(`Failed                     : ${stats.failed}`);
    console.log("========================================");
  }
}

// Execute
provisionStudents();
