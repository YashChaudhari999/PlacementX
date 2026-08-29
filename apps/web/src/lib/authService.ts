import api from './api';
import { useAuthStore } from '../stores/authStore';
import type { Role } from '../stores/authStore';
import { auth } from './firebase/config/firebaseApp';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    // 1. Log in with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    // 2. Retrieve Firebase ID Token
    const idToken = await userCredential.user.getIdToken();

    // 3. Try to send token to backend for verification
    //    If backend is down, fall back to Firebase-only auth
    let user: any;
    let token: string;

    try {
      const response = await api.post('/auth/firebase-login', {
        idToken,
        role: credentials.role,
      });
      user = response.data.user;
      token = response.data.token;
    } catch (backendError: any) {
      console.warn(
        '[AuthService] Backend unavailable, using Firebase-only auth:',
        backendError.message
      );

      // Build user object from Firebase auth data
      const fbUser = userCredential.user;
      user = {
        id: fbUser.uid,
        email: fbUser.email,
        role: credentials.role,
        firstName:
          fbUser.displayName?.split(' ')[0] || credentials.role === 'SUPER_ADMIN'
            ? 'Admin'
            : 'User',
        lastName: fbUser.displayName?.split(' ')[1] || '',
      };
      token = idToken;
    }

    useAuthStore.getState().setAuth(user, token);
    return user;
  },

  async logout() {
    // Sign out from Firebase
    try {
      await signOut(auth);
    } catch {
      console.error('Firebase sign out error');
    }
    useAuthStore.getState().logout();
  },

  async getMe() {
    try {
      const response = await api.get('/auth/me');
      const { user } = response.data;
      useAuthStore.getState().updateUser(user);
      return user;
    } catch (error) {
      console.warn('[AuthService] Backend unavailable for getMe, using stored user');
      return useAuthStore.getState().user;
    }
  },
};
