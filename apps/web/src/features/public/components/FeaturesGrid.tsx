import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Target, Users, Zap, ShieldCheck, Mail, Database } from 'lucide-react';

const features = [
  {
    title: 'Automated Eligibility',
    description: 'Instantly filter and match students based on recruiter criteria (CGPA, Branch, Active Backlogs).',
    icon: <Target className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Centralized Database',
    description: 'Maintain a single source of truth for all student academic and placement records.',
    icon: <Database className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Real-time Notifications',
    description: 'Keep students updated instantly regarding shortlists, interview schedules, and offers.',
    icon: <Zap className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Secure Recruiter Portal',
    description: 'Provide recruiters with token-based, secure access to review candidates without complex logins.',
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Integrated Communication',
    description: 'Seamlessly email batches of students directly from the dashboard.',
    icon: <Mail className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Role-Based Access',
    description: 'Strict separation of concerns between Students, Placement Cell Admins, and Recruiters.',
    icon: <Users className="h-6 w-6 text-primary" />,
  },
];

export const FeaturesGrid = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Everything you need for seamless placements
          </h2>
          <p className="text-lg text-muted-foreground">
            PlacementX provides enterprise-grade tools to automate repetitive tasks, allowing the Placement Cell to focus on strategic corporate relations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border border-border/50 bg-card hover:shadow-md transition-shadow group">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
