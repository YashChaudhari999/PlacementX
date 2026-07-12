import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Profile Setup',
    description: 'Students verify their academic details from NMIMS records and build their placement profile.',
  },
  {
    number: '02',
    title: 'Drive Creation',
    description: 'Placement Cell configures a new recruitment event with specific eligibility criteria.',
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
    <section className="py-24 bg-muted/10 border-y border-border/40 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            How PlacementX Works
          </h2>
          <p className="text-lg text-muted-foreground">
            A seamless, end-to-end workflow designed specifically for modern campus recruitment.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border z-0">
            <motion.div 
              className="absolute inset-0 bg-primary origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div 
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="h-24 w-24 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:border-primary/50 relative">
                  <span className="text-2xl font-bold text-foreground">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-2">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
