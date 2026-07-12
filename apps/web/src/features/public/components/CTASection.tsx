import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary z-0" />
      {/* Decorative pattern */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary-foreground mb-6">
            Ready to modernize campus placements?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10">
            Join the digital transformation of NMIMS University's placement processes. 
            Experience an intelligent, automated, and secure platform today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="h-14 px-10 text-base font-semibold shadow-xl" asChild>
              <Link to="/admin/login">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 text-base font-semibold text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
