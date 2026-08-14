import admin from 'firebase-admin';

// Check if there's a base64 encoded service account or path provided in env
export const initFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountStr) {
        console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is not set. Push notifications will not work.');
        return;
      }

      let credential;
      
      // Handle both base64 string and JSON string
      if (serviceAccountStr.startsWith('{')) {
        const parsed = JSON.parse(serviceAccountStr);
        if (parsed.private_key) {
          // Fix escaped newlines if they are present
          parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        }
        credential = admin.credential.cert(parsed);
      } else {
        const decoded = Buffer.from(serviceAccountStr, 'base64').toString('utf-8');
        credential = admin.credential.cert(JSON.parse(decoded));
      }

      admin.initializeApp({
        credential,
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://placementx-a3f1d-default-rtdb.firebaseio.com'
      });
      
      console.log('Firebase Admin initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  }
};
