import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// The Firebase Admin SDK needs service account credentials.
// You can either provide a path to a service account JSON file
// or use environment variables.

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) return admin.app();

  try {
    // If you have a service account key JSON file path in env:
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    // Alternatively, initialize via separate environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines with actual newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }

    // Fallback if no specific config is provided (assumes default GCP credentials)
    console.warn('No Firebase Service Account config found. Falling back to application default credentials.');
    return admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
};

export const firebaseAdmin = initializeFirebaseAdmin();
