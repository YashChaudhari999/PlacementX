import { motion } from 'framer-motion';
import { Target01Icon, UserMultipleIcon, EnergyIcon, Shield01Icon, Mail01Icon, DatabaseIcon } from 'hugeicons-react';

const features = [
  {
    title: 'Automated Eligibility',
    description:
      'Instantly filter and match students based on recruiter criteria (CGPA, Branch, Active Backlogs).',
    icon: <Target01Icon className="h-6 w-6 text-primary" />,
    color: 'bg-primary/10',
  },
  {
    title: 'Centralized DatabaseIcon',
    description:
      'Maintain a single source of truth for all student academic and placement records.',
    icon: <DatabaseIcon className="h-6 w-6 text-blue-500" />,
    color: 'bg-blue-500/10',
  },
  {
    title: 'Real-time Notifications',
    description:
      'Keep students updated instantly regarding shortlists, interview schedules, and offers.',
    icon: <EnergyIcon className="h-6 w-6 text-amber-500" />,
    color: 'bg-amber-500/10',
  },
  {
    title: 'Secure Recruiter Portal',
    description:
      'Provide recruiters with token-based, secure access to review candidates without complex logins.',
    icon: <Shield01Icon className="h-6 w-6 text-emerald-500" />,
    color: 'bg-emerald-500/10',
  },
  {
    title: 'Integrated Communication',
    description: 'Seamlessly email batches of students directly from the dashboard.',
    icon: <Mail01Icon className="h-6 w-6 text-purple-500" />,
    color: 'bg-purple-500/10',
  },
  {
    title: 'Role-Based Access',
    description:
      'Strict separation of concerns between Students, Placement Cell Admins, and Recruiters.',
    icon: <UserMultipleIcon className="h-6 w-6 text-rose-500" />,
    color: 'bg-rose-500/10',
  },
];

export const FeaturesGrid = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">
              Platform Features
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-6">
              Everything you need for seamless placements
            </h3>
            <p className="text-lg text-slate-500 leading-relaxed">
              PlacementX provides enterprise-grade tools to automate repetitive tasks, allowing the
              Placement Cell to focus on strategic corporate relations.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${feature.color}`}
              >
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h4>
              <p className="text-slate-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
