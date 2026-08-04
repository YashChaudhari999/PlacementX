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
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    
    // 2. Retrieve Firebase ID Token
    const idToken = await userCredential.user.getIdToken();

    // 3. Send token to backend for verification and fetching standard JWT
    const response = await api.post('/auth/firebase-login', { 
      idToken, 
      role: credentials.role 
    });
    
    const { user, token } = response.data;
    useAuthStore.getState().setAuth(user, token);
    return user;
  },

  async logout() {
    // Sign out from Firebase
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Firebase sign out error:', e);
    }
    useAuthStore.getState().logout();
  },

  async getMe() {
    const response = await api.get('/auth/me');
    const { user } = response.data;
    useAuthStore.getState().updateUser(user);
    return user;
  }
};
