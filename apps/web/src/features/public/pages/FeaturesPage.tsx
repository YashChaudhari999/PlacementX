import { motion } from 'framer-motion';
import { PageContainer } from '@/components/ui';
import { FeaturesGrid } from '../components/FeaturesGrid';

export default function FeaturesPage() {
  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
              Powerful Features for <br />
              <span className="text-primary">Modern Placements</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              Explore the comprehensive suite of tools designed to automate, streamline, and enhance
              the placement experience for everyone involved.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features Grid */}
      <div className="py-12">
        <FeaturesGrid />
      </div>

      {/* Deep Dive Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Intelligent Resume Parsing</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Our advanced AI engine automatically extracts key information from student resumes,
                standardizing data across the platform. This allows recruiters to filter candidates
                with pinpoint accuracy based on skills, GPA, projects, and past experiences without
                manually reading hundreds of documents.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-100 rounded-2xl p-8 border border-slate-200 shadow-inner"
            >
              {/* Abstract visualization of resume parsing */}
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-slate-300 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-200 rounded animate-pulse delay-75" />
                <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse delay-150" />
                <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse delay-300" />
                <div className="mt-8 flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    React
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                    Python
                  </span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                    8.5 GPA
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl order-2 md:order-1"
            >
              {/* Abstract visualization of analytics */}
              <div className="flex items-end gap-3 h-48 mt-8">
                <div
                  className="w-full bg-primary/40 hover:bg-primary transition-colors rounded-t-md"
                  style={{ height: '40%' }}
                />
                <div
                  className="w-full bg-primary/60 hover:bg-primary transition-colors rounded-t-md"
                  style={{ height: '70%' }}
                />
                <div
                  className="w-full bg-primary/80 hover:bg-primary transition-colors rounded-t-md"
                  style={{ height: '55%' }}
                />
                <div
                  className="w-full bg-primary hover:bg-primary transition-colors rounded-t-md"
                  style={{ height: '90%' }}
                />
                <div
                  className="w-full bg-primary/50 hover:bg-primary transition-colors rounded-t-md"
                  style={{ height: '65%' }}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h2 className="text-3xl font-bold mb-4">Real-time Analytics Dashboard</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Make data-driven decisions with real-time insights into placement drives. Track
                application volumes, interview conversion rates, and historical trends. Generate
                comprehensive PDF reports for university stakeholders with a single click.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
