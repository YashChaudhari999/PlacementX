import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mb-16">
          <div className="md:col-span-4 lg:col-span-2 xl:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 inline-flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-sm">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Placement<span className="text-primary">X</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mb-6">
              Intelligent Campus Placement Automation and Decision Support Platform designed for
              modern universities and ambitious students.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-slate-400 hover:text-primary transition-colors text-sm font-semibold"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-primary transition-colors text-sm font-semibold"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-primary transition-colors text-sm font-semibold"
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="lg:col-span-1 xl:col-span-1">
            <h3 className="font-semibold text-sm tracking-wider text-slate-900 uppercase mb-5">
              Product
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link to="/features" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/modules" className="hover:text-primary transition-colors">
                  Modules
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1 xl:col-span-1">
            <h3 className="font-semibold text-sm tracking-wider text-slate-900 uppercase mb-5">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1 xl:col-span-1">
            <h3 className="font-semibold text-sm tracking-wider text-slate-900 uppercase mb-5">
              Portals
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link to="/student/login" className="hover:text-primary transition-colors">
                  Student Login
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-primary transition-colors">
                  Placement Cell Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1 xl:col-span-1">
            <h3 className="font-semibold text-sm tracking-wider text-slate-900 uppercase mb-5">
              Legal
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} PlacementX. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span>Powered by NMIMS University</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
