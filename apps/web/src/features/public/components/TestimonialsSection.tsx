import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      "PlacementX completely transformed our recruitment process. We've reduced administrative overhead by 60% and improved our placement rates significantly.",
    author: 'Dr. Sharma',
    role: 'Director of Placements, NMIMS',
    rating: 5,
  },
  {
    quote:
      'The automated eligibility matching saved me hours of manual filtering. The recruiter portal is intuitive and very well designed.',
    author: 'Priya Desai',
    role: 'University Relations, TCS',
    rating: 5,
  },
  {
    quote:
      'I loved how easy it was to track my applications and receive real-time notifications for my interview rounds.',
    author: 'Rahul Patel',
    role: 'Computer Engineering, Class of 2026',
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">
              Testimonials
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-6">
              Trusted by Universities and Recruiters
            </h3>
            <p className="text-lg text-slate-500 leading-relaxed">
              See what our stakeholders are saying about their experience with PlacementX.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-slate-100" />
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-slate-700 italic mb-8 relative z-10 flex-grow">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.author}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
