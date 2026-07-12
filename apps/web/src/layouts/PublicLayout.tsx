import { Outlet } from 'react-router-dom';
import { Navbar } from '@/features/public/components/Navbar';
import { Footer } from '@/features/public/components/Footer';

export const PublicLayout = () => { 
  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <Navbar />
      <main className='flex-1 flex flex-col'>
        <Outlet />
      </main>
      <Footer />
    </div>
  ); 
};
