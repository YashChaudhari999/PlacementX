import api from './api';
import { useAuthStore } from '../stores/authStore';
import type { Role } from '../stores/authStore';
import { auth } from './firebase/config/firebaseApp';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface LoginCredentials {
 email: string;
 password: string;
 role?: Role;
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

 // 3. The backend must verify both identity and the database-owned role.
 // Authentication fails closed when that verification is unavailable.
 const response = await api.post('/auth/firebase-login', {
 idToken,
 role: credentials.role,
 });
 const user = response.data.user;
 const token = response.data.token;

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
 useAuthStore.getState().logout();
 throw error;
 }
 },
};
