import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Profile Setup',
    description:
      'Students verify their academic details from NMIMS records and build their placement profile.',
  },
  {
    number: '02',
    title: 'Drive Creation',
    description:
      'Placement Cell configures a new recruitment event with specific eligibility criteria.',
  },
  {
    number: '03',
    title: 'Auto-Filtering',
    description: 'PlacementX instantly matches eligible students and notifies them to apply.',
  },
  {
    number: '04',
    title: 'Recruiter Action',
    description: 'Recruiters receive a secure link to review resumes and shortlist candidates.',
  },
];

export const WorkflowTimeline = () => {
  return (
    <section className="py-24 bg-white border-y border-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">
              Workflow
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
              How PlacementX Works
            </h3>
            <p className="text-lg text-slate-500 leading-relaxed">
              A seamless, end-to-end workflow designed specifically for modern campus recruitment.
            </p>
          </motion.div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-slate-100 rounded-full z-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary to-accent origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.5, delay: 0.2, ease: 'easeInOut' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center group"
              >
                <div className="h-24 w-24 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center mb-6 shadow-sm transition-all duration-300 group-hover:border-primary group-hover:shadow-md group-hover:-translate-y-1 relative">
                  <span className="text-2xl font-black text-slate-300 group-hover:text-primary transition-colors duration-300">
                    {step.number}
                  </span>
                  {/* Decorative dot */}
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed px-2">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
