import { createContext, ReactNode } from 'react';
import { PermissionState } from '../types';

export const PermissionContext = createContext<PermissionState | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  return <PermissionContext.Provider value={null as any}>{children}</PermissionContext.Provider>;
};
