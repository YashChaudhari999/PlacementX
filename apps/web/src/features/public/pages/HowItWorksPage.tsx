import { motion } from 'framer-motion';
import { PageContainer } from '@/components/ui';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { ArrowRight01Icon } from 'hugeicons-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui';

export default function HowItWorksPage() {
  return (
    <PageContainer>
      <section className="py-20 md:py-28 bg-background relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
              How PlacementX Works
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-10">
              A step-by-step guide to how NMIMS University streamlines the entire campus placement
              lifecycle, from company onboarding to final offer letter generation.
            </p>
            <Link to="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Request Demo <ArrowRight01Icon className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <WorkflowTimeline />
    </PageContainer>
  );
}
