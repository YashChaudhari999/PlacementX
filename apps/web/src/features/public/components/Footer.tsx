import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                P
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Placement<span className="text-primary">X</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Intelligent Campus Placement Automation and Decision Support Platform for NMIMS University.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/modules" className="hover:text-primary transition-colors">Modules</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Portals</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/student/login" className="hover:text-primary transition-colors">Student Login</Link></li>
              <li><Link to="/admin/login" className="hover:text-primary transition-colors">Placement Cell Login</Link></li>
              <li><Link to="/recruiter/login" className="hover:text-primary transition-colors">Recruiter Portal</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PlacementX by NMIMS University. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link to="#" className="hover:text-primary transition-colors">LinkedIn</Link>
            <Link to="#" className="hover:text-primary transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
