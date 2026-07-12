import { motion } from 'framer-motion';
import { Card } from '@/components/ui';
import { LayoutDashboard, Smartphone, Building, UserCircle } from 'lucide-react';

const modules = [
  {
    title: 'Placement Cell Admin',
    description: 'A powerful command center to manage students, companies, eligibility criteria, and detailed reporting analytics.',
    icon: <Building className="h-8 w-8 text-primary" />,
    color: 'bg-primary/5',
  },
  {
    title: 'Student Portal',
    description: 'Personalized dashboard for students to track their applications, upcoming interviews, and offer letters.',
    icon: <UserCircle className="h-8 w-8 text-primary" />,
    color: 'bg-info/5',
  },
  {
    title: 'Recruiter Event Portal',
    description: 'Token-based secure environments for recruiters to review shortlisted candidates and submit interview feedback.',
    icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
    color: 'bg-success/5',
  },
  {
    title: 'Mobile Application',
    description: 'Native mobile app for students to receive push notifications for urgent drive updates and schedule changes.',
    icon: <Smartphone className="h-8 w-8 text-primary" />,
    color: 'bg-warning/5',
  },
];

export const PlatformModules = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Integrated Modules
            </h2>
            <p className="text-lg text-muted-foreground">
              A unified ecosystem providing specialized interfaces for every stakeholder in the placement process.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, index) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`p-8 h-full border border-border/50 transition-colors hover:border-primary/30 ${mod.color}`}>
                <div className="flex items-start gap-6">
                  <div className="shrink-0 p-3 bg-background rounded-xl shadow-sm border border-border/50">
                    {mod.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{mod.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
