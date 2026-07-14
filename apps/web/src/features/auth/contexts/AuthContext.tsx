// @ts-nocheck
import { createContext, ReactNode } from 'react';
import type { AuthState } from '../types';

export const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <AuthContext.Provider value={null as any}>{children}</AuthContext.Provider>;
};
