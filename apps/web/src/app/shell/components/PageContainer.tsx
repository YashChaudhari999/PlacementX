// @ts-nocheck
import { ReactNode } from 'react';
export const PageContainer = ({ title, children }: { title?: string, children: ReactNode }) => {
  return <div className='flex-1 p-6 flex flex-col'><h1>{title}</h1>{children}</div>;
};
