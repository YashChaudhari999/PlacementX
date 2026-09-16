import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu01Icon, Cancel01Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';

export const Navbar = ({ items }: { items: { name: string; href: string }[] }) => {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const location = useLocation();

 return (
 <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
 <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
 <div className="flex items-center gap-2">
 <img src="/nmimslogo_transparent.png"alt="NMIMS Logo"className="dark:brightness-0 dark:invert h-8 w-auto"/>
 <Link to="/"className="font-extrabold text-xl text-foreground tracking-tight">
 PlacementX
 </Link>
 </div>

 {/* Desktop Navigation */}
 <div className="hidden md:flex items-center space-x-8">
 {items.map((item) => {
 const isActive = location.pathname === item.href;
 return (
 <Link
 key={item.href}
 to={item.href}
 className={`text-sm font-medium transition-colors hover:text-primary ${
 isActive ? 'text-primary' : 'text-muted-foreground'
 }`}
 >
 {item.name}
 </Link>
 );
 })}
 </div>

 <div className="hidden md:flex items-center gap-4">
 <Link to="/login">
 <Button variant="default">Sign In</Button>
 </Link>
 </div>

 {/* Mobile Menu Toggle */}
 <button
 className="md:hidden p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-md"
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 >
 {isMobileMenuOpen ? (
 <Cancel01Icon className="h-6 w-6"/>
 ) : (
 <Menu01Icon className="h-6 w-6"/>
 )}
 </button>
 </div>

 {/* Mobile Navigation Dropdown */}
 <AnimatePresence>
 {isMobileMenuOpen && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="md:hidden overflow-hidden border-b border-border bg-background"
 >
 <div className="px-4 py-4 flex flex-col space-y-3">
 {items.map((item) => (
 <Link
 key={item.href}
 to={item.href}
 onClick={() => setIsMobileMenuOpen(false)}
 className="text-base font-medium text-muted-foreground hover:text-primary transition-colors py-2"
 >
 {item.name}
 </Link>
 ))}
 <div className="pt-2">
 <Link to="/login"onClick={() => setIsMobileMenuOpen(false)}>
 <Button variant="default"className="w-full">
 Sign In
 </Button>
 </Link>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </nav>
 );
};
