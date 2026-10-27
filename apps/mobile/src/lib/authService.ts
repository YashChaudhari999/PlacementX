import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { LoginCredentials, User } from '../types';
import { auth } from './firebaseApp';
import { signInWithEmailAndPassword } from 'firebase/auth';

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

  requestPasswordReset: async (email: string) =>
    (await apiClient.post(API_ENDPOINTS.PASSWORD_RESET_REQUEST, { email: email.trim() })).data,

  resendPasswordReset: async (email: string) =>
    (await apiClient.post(API_ENDPOINTS.PASSWORD_RESET_RESEND, { email: email.trim() })).data,

  verifyPasswordResetOtp: async (email: string, otp: string) =>
    (await apiClient.post<{ resetGrant: string; expiresInSeconds: number }>(API_ENDPOINTS.PASSWORD_RESET_VERIFY, { email: email.trim(), otp })).data,

  confirmPasswordReset: async (resetGrant: string, newPassword: string) =>
    (await apiClient.post(API_ENDPOINTS.PASSWORD_RESET_CONFIRM, { resetGrant, newPassword })).data,

  getMe: async () => {
    const response = await apiClient.get<User>(API_ENDPOINTS.ME);
    return response.data;
  },
};
