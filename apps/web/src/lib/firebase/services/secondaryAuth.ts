import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, type Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export class SecondaryAuthService {
    private static app: FirebaseApp | null = null;
    private static auth: Auth | null = null;

    static getAuthInstance(): Auth {
        if (!this.app) {
            const apps = getApps();
            this.app = apps.find(app => app.name === 'SecondaryApp') || initializeApp(firebaseConfig, 'SecondaryApp');
            this.auth = getAuth(this.app);
        }
        return this.auth!;
    }

    static async createStudentAuth(email: string, password: string): Promise<string> {
        const auth = this.getAuthInstance();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await auth.signOut();
            return userCredential.user.uid;
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                try {
                    const { signInWithEmailAndPassword } = await import('firebase/auth');
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    await auth.signOut();
                    return userCredential.user.uid;
                } catch (signInError) {
                    throw error; // Throw original error if sign in fails (e.g. password changed)
                }
            }
            throw error;
        }
    }
}
