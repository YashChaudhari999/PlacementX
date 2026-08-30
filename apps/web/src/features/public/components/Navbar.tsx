import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu01Icon, Cancel01Icon, ArrowRight01Icon } from 'hugeicons-react';
import { buttonVariants } from '@/components/ui';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Features', path: '/features' },
  { name: 'Modules', path: '/modules' },
  { name: 'How It Works', path: '/how-it-works' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Contact', path: '/contact' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        className={twMerge(
          'fixed top-0 z-50 w-full transition-all duration-300',
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
              P
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              Placement<span className="text-primary">X</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={twMerge(
                    'text-sm font-medium transition-colors hover:text-primary relative py-2',
                    isActive ? 'text-primary' : 'text-slate-600'
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/student/login" className={buttonVariants({ variant: 'ghost', size: 'md' })}>
              Student Login
            </Link>
            <Link to="/admin/login" className={buttonVariants({ variant: 'primary', size: 'md' })}>
              Placement Cell Login
            </Link>
          </div>

          {/* Mobile Menu01Icon Toggle */}
          <button
            className="lg:hidden flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <Cancel01Icon className="h-6 w-6" />
            ) : (
              <Menu01Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu01Icon Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-4 pb-6 lg:hidden flex flex-col h-screen overflow-y-auto"
          >
            <nav className="flex flex-col gap-2 mb-8">
              {NAV_LINKS.map((link) => {
                const isActive =
                  location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={twMerge(
                      'flex items-center justify-between p-4 rounded-xl text-lg font-medium transition-colors',
                      isActive ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {link.name}
                    <ArrowRight01Icon className="h-5 w-5 opacity-50" />
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-3 mt-auto">
              <Link
                to="/student/login"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  className: 'w-full justify-center',
                })}
              >
                Student Login
              </Link>
              <Link
                to="/admin/login"
                className={buttonVariants({
                  variant: 'primary',
                  size: 'lg',
                  className: 'w-full justify-center',
                })}
              >
                Placement Cell Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
