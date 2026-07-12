import { createContext, ReactNode } from 'react';
import type { RoleState } from '../types';

export const RoleContext = createContext<RoleState | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  return <RoleContext.Provider value={null as any}>{children}</RoleContext.Provider>;
};
