import { createContext, ReactNode } from 'react';
import { Session } from '../types';

export const SessionContext = createContext<{ session: Session | null; refreshSession: () => void } | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  return <SessionContext.Provider value={null as any}>{children}</SessionContext.Provider>;
};
