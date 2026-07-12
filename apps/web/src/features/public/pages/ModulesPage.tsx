import { motion } from 'framer-motion';
import { PageContainer } from '@/components/ui';
import { PlatformModules } from '../components/PlatformModules';

export default function ModulesPage() {
  return (
    <PageContainer>
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium mb-6">
              Platform Architecture
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
              A Unified Ecosystem for <br />
              <span className="text-gradient">Every Stakeholder</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              PlacementX is built on a modular architecture, ensuring that students, placement officers, and recruiters each have a dedicated, optimized portal tailored to their specific needs.
            </p>
          </motion.div>
        </div>
        
        <PlatformModules />
      </section>
    </PageContainer>
  );
}
