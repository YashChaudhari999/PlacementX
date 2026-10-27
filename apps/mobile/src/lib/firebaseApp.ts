import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAe1d7J4LlFfk5Ig7lOvOdNLSA7l9n0vzo',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placementx-a3f1d.firebaseapp.com',
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 'https://placementx-a3f1d-default-rtdb.firebaseio.com',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'placementx-a3f1d',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placementx-a3f1d.firebasestorage.app',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1039676164614',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1039676164614:web:f419b9a304497322da1187',
};

export const firebaseApp: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth: Auth = getAuth(firebaseApp);
