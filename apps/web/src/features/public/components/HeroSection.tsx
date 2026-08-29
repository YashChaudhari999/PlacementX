import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui';
import { ArrowRight01Icon, BarChartIcon, Building02Icon, Mortarboard01Icon } from 'hugeicons-react';
import { Link as RouterLink } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background pt-24 md:pt-32 lg:pt-40 pb-20">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              The Standard in Placement Automation
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-8">
              Intelligent Campus <br />
              <span className="text-gradient">Placement Platform</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-xl leading-relaxed">
              Streamline the entire recruitment lifecycle with NMIMS University's official decision
              support platform. Connect students, placement cells, and recruiters seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <RouterLink
                to="/admin/login"
                className={
                  buttonVariants({ variant: 'primary', size: 'lg' }) +
                  ' h-14 px-8 text-base rounded-xl shadow-md hover:shadow-lg transition-shadow'
                }
              >
                Placement Cell Login <ArrowRight01Icon className="ml-2 h-5 w-5" />
              </RouterLink>
              <RouterLink
                to="/student/login"
                className={
                  buttonVariants({ variant: 'outline', size: 'lg' }) +
                  ' h-14 px-8 text-base rounded-xl bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm hover:bg-slate-50 transition-colors'
                }
              >
                Student Portal
              </RouterLink>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, staggerChildren: 0.1 }}
              className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium"
            >
              <motion.div
                whileHover={{
                  y: -5,
                  boxShadow:
                    '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                }}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 transition-all cursor-default"
              >
                <Building02Icon className="h-5 w-5 text-primary" />
                500+ Recruiters
              </motion.div>
              <motion.div
                whileHover={{
                  y: -5,
                  boxShadow:
                    '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                }}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 transition-all cursor-default"
              >
                <Mortarboard01Icon className="h-5 w-5 text-primary" />
                10k+ Students
              </motion.div>
              <motion.div
                whileHover={{
                  y: -5,
                  boxShadow:
                    '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                }}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 transition-all cursor-default"
              >
                <BarChartIcon className="h-5 w-5 text-primary" />
                98% Placement
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:ml-auto w-full max-w-lg lg:max-w-none"
          >
            {/* Glow Behind Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 via-blue-500/10 to-transparent rounded-full blur-[80px] -z-10" />

            {/* Hero Image */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="relative rounded-2xl bg-white/40 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center ring-1 ring-slate-900/5 aspect-square sm:aspect-[4/3] lg:aspect-square max-w-md mx-auto lg:max-w-none"
            >
              <img
                src="/hero-image.png"
                alt="NMIMS Placement Platform"
                className="w-full h-full object-contain p-4 md:p-8"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
