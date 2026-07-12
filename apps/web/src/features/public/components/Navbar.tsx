import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';

export const Navbar = () => {
  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
            P
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Placement<span className="text-primary">X</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-foreground transition-colors hover:text-primary">Home</Link>
          <Link to="/features" className="text-muted-foreground transition-colors hover:text-primary">Features</Link>
          <Link to="/about" className="text-muted-foreground transition-colors hover:text-primary">About</Link>
          <Link to="/contact" className="text-muted-foreground transition-colors hover:text-primary">Contact</Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:inline-flex" asChild>
            <Link to="/student/login">Student Login</Link>
          </Button>
          <Button variant="primary" asChild>
            <Link to="/admin/login">Placement Cell Login</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
