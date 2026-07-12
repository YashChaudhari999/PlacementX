import { motion } from 'framer-motion';

const stats = [
  { label: 'Active Students', value: '10,000+' },
  { label: 'Placement Drives', value: '250+' },
  { label: 'Top Recruiters', value: '500+' },
  { label: 'Hours Saved', value: '1,000+' },
];

export const StatisticsSection = () => {
  return (
    <section className="border-y border-border/40 bg-muted/10 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/40">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
