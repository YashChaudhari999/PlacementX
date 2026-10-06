import api from './api';
import { useAuthStore } from '../stores/authStore';
import type { Role } from '../stores/authStore';
import { auth } from './firebase/config/firebaseApp';
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth';

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

  async sendPasswordReset(email: string) {
    try {
      // 1. Try custom PlacementX HTML email endpoint (bypasses Firebase Console's locked template editor)
      const response = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });
      return response.data;
    } catch {
      // 2. Fallback to Firebase native client SDK if backend API or SMTP is unavailable
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/reset-password`,
          handleCodeInApp: true,
        };
        await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
        return {
          success: true,
          message: "Check your email. If an account exists with this email, we've sent you a password reset link.",
        };
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          return {
            success: true,
            message: "Check your email. If an account exists with this email, we've sent you a password reset link.",
          };
        }
        let message = 'Failed to send password reset email. Please try again.';
        if (error.code === 'auth/invalid-email') {
          message = 'Please enter a valid email address.';
        } else if (error.code === 'auth/too-many-requests') {
          message = 'Too many attempts. Please wait a few minutes before trying again.';
        } else if (error.message) {
          message = error.message;
        }
        throw new Error(message);
      }
    }
  },

  async verifyResetCode(code: string) {
    try {
      const email = await verifyPasswordResetCode(auth, code);
      return { valid: true, email };
    } catch (error: any) {
      let message = 'Invalid or expired password reset link.';
      if (error.code === 'auth/expired-action-code') {
        message = 'This password reset link has expired. Please request a new link.';
      } else if (error.code === 'auth/invalid-action-code') {
        message = 'This password reset link is invalid or has already been used.';
      } else if (error.code === 'auth/user-disabled') {
        message = 'This account has been disabled. Please contact the Placement Cell.';
      } else if (error.message) {
        message = error.message;
      }
      throw new Error(message);
    }
  },

  async confirmResetPassword(code: string, newPassword: string) {
    try {
      await confirmPasswordReset(auth, code, newPassword);
      return { success: true };
    } catch (error: any) {
      let message = 'Failed to reset password. Please try again.';
      if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 8 characters long.';
      } else if (error.code === 'auth/expired-action-code') {
        message = 'This password reset link has expired. Please request a new link.';
      } else if (error.code === 'auth/invalid-action-code') {
        message = 'This password reset link is invalid or has already been used.';
      } else if (error.message) {
        message = error.message;
      }
      throw new Error(message);
    }
  },
};
