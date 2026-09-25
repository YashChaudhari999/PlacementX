import prisma from './utils/prisma';
import bcrypt from 'bcryptjs';
import { firebaseAdmin } from './config/firebase-admin';

const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@nmims.edu').trim().toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const verifyTrustedAdminEmail = process.env.SEED_VERIFY_ADMIN_EMAIL === 'true';

const provisionFirebaseAdmin = async () => {
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be set to a password of at least 8 characters. It is never stored in source control.');
  }

  try {
    const existingUser = await firebaseAdmin.auth().getUserByEmail(adminEmail);
    // Verification bypass is deliberately opt-in. Prefer Firebase's normal
    // verification link for ordinary users; only a trusted operator may use
    // this for a pre-approved administrator address.
    if (verifyTrustedAdminEmail && (!existingUser.emailVerified || existingUser.disabled)) {
      return firebaseAdmin.auth().updateUser(existingUser.uid, {
        emailVerified: true,
        disabled: false,
      });
    }
    return existingUser;
  } catch (error: any) {
    if (error?.code !== 'auth/user-not-found') throw error;

    // This is an administrator-provisioning action, so the trusted operator
    // explicitly supplies the address/password through local environment vars.
    return firebaseAdmin.auth().createUser({
      email: adminEmail,
      password: adminPassword,
      emailVerified: true,
      disabled: false,
    });
  }
};

async function main() {
  const firebaseUser = await provisionFirebaseAdmin();
  const passwordHash = await bcrypt.hash(adminPassword!, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { firebaseUid: firebaseUser.uid },
    create: {
      email: adminEmail,
      password: passwordHash,
      role: 'SUPER_ADMIN',
      firebaseUid: firebaseUser.uid,
      adminProfile: {
        create: {
          firstName: 'Placement',
          lastName: 'Admin'
        }
      }
    },
  });

  console.log(`Admin account provisioned for ${adminEmail}`);
  if (!firebaseUser.emailVerified) {
    console.warn('Admin Firebase email is not verified. Complete Firebase email verification, or rerun with SEED_VERIFY_ADMIN_EMAIL=true after explicit approval.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
