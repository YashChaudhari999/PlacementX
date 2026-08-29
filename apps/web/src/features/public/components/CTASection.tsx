import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden my-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-20 md:px-12 md:py-24 shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Ready to modernize <br className="hidden sm:block" />
                campus placements?
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                Join the digital transformation of NMIMS University's placement processes.
                Experience an intelligent, automated, and secure platform today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center justify-center rounded-md h-14 px-10 text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all bg-white text-primary hover:bg-slate-50"
                >
                  Placement Cell Login
                </Link>
                <Link
                  to="/student/login"
                  className={
                    buttonVariants({ variant: 'outline', size: 'lg' }) +
                    ' h-14 px-10 text-base font-semibold text-white border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:text-white transition-all'
                  }
                >
                  Student Login
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
