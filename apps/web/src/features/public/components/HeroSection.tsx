import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { ArrowRight, BarChart3, Building2, GraduationCap, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32 pb-16">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Placement Automation Platform
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
              Intelligent Campus <br/>
              Placement <span className="text-primary">Automation</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Streamline the entire recruitment lifecycle with NMIMS University's official decision support platform. Connect students, placement cells, and recruiters seamlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" className="h-12 px-8 text-base" asChild>
                <RouterLink to="/admin/login">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </RouterLink>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm" asChild>
                <RouterLink to="/student/login">
                  Student Portal
                </RouterLink>
              </Button>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                500+ Recruiters
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                10k+ Students
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                98% Placement
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-lg lg:max-w-none"
          >
            {/* Dashboard Mockup */}
            <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-md shadow-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              <div className="absolute top-0 w-full h-12 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/80"></div>
                  <div className="h-3 w-3 rounded-full bg-warning/80"></div>
                  <div className="h-3 w-3 rounded-full bg-success/80"></div>
                </div>
              </div>
              
              <div className="p-8 w-full mt-12 grid grid-cols-2 gap-4">
                <div className="col-span-2 h-8 w-32 rounded bg-muted/60 mb-4 animate-pulse"></div>
                <div className="h-24 rounded-lg bg-primary/10 border border-primary/20 flex flex-col justify-center px-4">
                  <div className="h-4 w-16 bg-primary/40 rounded mb-2"></div>
                  <div className="h-8 w-12 bg-primary/60 rounded"></div>
                </div>
                <div className="h-24 rounded-lg bg-info/10 border border-info/20 flex flex-col justify-center px-4">
                  <div className="h-4 w-16 bg-info/40 rounded mb-2"></div>
                  <div className="h-8 w-12 bg-info/60 rounded"></div>
                </div>
                <div className="col-span-2 h-40 rounded-lg bg-muted/40 border border-border/50 mt-2"></div>
              </div>
            </div>
            
            {/* Decorative Floating Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 h-24 w-24 rounded-2xl bg-success/10 border border-success/20 backdrop-blur-md shadow-lg flex items-center justify-center"
            >
              <div className="text-success font-bold text-xl flex flex-col items-center">
                <span>98%</span>
                <span className="text-xs font-normal opacity-80">Placed</span>
              </div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-8 h-20 w-48 rounded-xl bg-card border border-border shadow-xl flex items-center px-4 gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Link className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">New Event</p>
                <p className="text-sm font-semibold">TCS Hiring Drive</p>
              </div>
            </motion.div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};
