import { motion } from 'framer-motion';
import { PageContainer } from '@/components/ui';
import { Building2, GraduationCap, Users, Target, ShieldCheck, Sparkles } from 'lucide-react';

const stats = [
  { label: 'Students Placed', value: '10,000+', icon: GraduationCap },
  { label: 'Recruiting Partners', value: '500+', icon: Building2 },
  { label: 'Placement Rate', value: '98%', icon: Target },
  { label: 'Active Users', value: '15,000+', icon: Users },
];

export default function AboutPage() {
  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium mb-6">
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              Empowering the Next Generation of <span className="text-gradient">Professionals</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              PlacementX is NMIMS University's official, unified platform bridging the gap between
              exceptional talent and industry-leading organizations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                We believe that the campus placement process should be transparent, efficient, and
                equitable. Our mission is to eliminate administrative friction so that students can
                focus on showcasing their potential, and recruiters can seamlessly identify the best
                fit.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                  <span className="text-slate-700">Data-driven and secure decision making.</span>
                </li>
                <li className="flex gap-3">
                  <Sparkles className="h-6 w-6 text-primary shrink-0" />
                  <span className="text-slate-700">
                    Intelligent matching and automated workflows.
                  </span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-multiply" />
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                alt="Students collaborating"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
