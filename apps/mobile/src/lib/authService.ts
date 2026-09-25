import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { LoginCredentials, User } from '../types';
import { auth } from './firebaseApp';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    // 1. Log in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    
    // 2. Retrieve Firebase ID Token
    const idToken = await userCredential.user.getIdToken();

    // 3. Send token to backend
    const response = await apiClient.post<{ user: User; token: string }>(
      API_ENDPOINTS.FIREBASE_LOGIN,
      { idToken }
    );
    return response.data;
  },

  requestPasswordReset: async (email: string) => sendPasswordResetEmail(auth, email),

  getMe: async () => {
    const response = await apiClient.get<User>(API_ENDPOINTS.ME);
    return response.data;
  },
};
