import { motion } from 'framer-motion';

const stats = [
  { label: 'Active Students', value: '10,000+' },
  { label: 'Placement Drives', value: '250+' },
  { label: 'Top Recruiters', value: '500+' },
  { label: 'Hours Saved', value: '1,000+' },
];

export const StatisticsSection = () => {
  return (
    <section className="relative z-10 -mt-10 mb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center justify-center text-center px-4 pt-8 md:pt-0 first:pt-0"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-primary uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
