import { motion } from 'framer-motion';
import { DashboardSquare01Icon, SmartPhone01Icon, Building01Icon, UserCircleIcon } from 'hugeicons-react';

const modules = [
  {
    title: 'Placement Cell Admin',
    description:
      'A powerful command center to manage students, companies, eligibility criteria, and detailed reporting analytics.',
    icon: <Building01Icon className="h-6 w-6 text-primary" />,
    color: 'bg-primary/5',
    borderColor: 'border-primary/20',
  },
  {
    title: 'Student Portal',
    description:
      'Personalized dashboard for students to track their applications, upcoming interviews, and offer letters.',
    icon: <UserCircleIcon className="h-6 w-6 text-blue-500" />,
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    title: 'Recruiter Event Portal',
    description:
      'Token-based secure environments for recruiters to review shortlisted candidates and submit interview feedback.',
    icon: <DashboardSquare01Icon className="h-6 w-6 text-emerald-500" />,
    color: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    title: 'Mobile Application',
    description:
      'Native mobile app for students to receive push notifications for urgent drive updates and schedule changes.',
    icon: <SmartPhone01Icon className="h-6 w-6 text-amber-500" />,
    color: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
];

export const PlatformModules = () => {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">
              Ecosystem
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
              Integrated Platform Modules
            </h3>
            <p className="text-lg text-slate-500 leading-relaxed">
              A unified ecosystem providing specialized interfaces tailored perfectly for every
              stakeholder in the placement process.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {modules.map((mod, index) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`p-8 lg:p-10 h-full rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative group`}
              >
                {/* Subtle corner decoration */}
                <div
                  className={`absolute -right-12 -top-12 w-32 h-32 rounded-full ${mod.color} transition-transform duration-500 group-hover:scale-150 ease-out`}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div
                    className={`shrink-0 mb-6 inline-flex p-4 rounded-xl shadow-sm border bg-white ${mod.borderColor}`}
                  >
                    {mod.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">{mod.title}</h4>
                    <p className="text-slate-500 leading-relaxed">{mod.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
