import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/features/public/components/Navbar';
import { Footer } from '@/features/public/components/Footer';
import { PageTransition } from '@/components/common/PageTransition';

export const PublicLayout = () => { 
  const location = useLocation();
  
  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <Navbar />
      <main className='flex-1 flex flex-col'>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  ); 
};
