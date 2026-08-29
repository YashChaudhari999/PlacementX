import { motion } from 'framer-motion';
import { PageContainer, Input, Textarea, Button } from '@/components/ui';
import { Mail01Icon, CallIcon, Location01Icon, SentIcon } from 'hugeicons-react';
import { type FormEvent, useState } from 'react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <PageContainer>
      <section className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              Whether you're a recruiter looking to partner with NMIMS University, or a student
              needing assistance, our team is here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 -mt-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl relative z-20">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Contact Information</h3>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail01Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Email Us</p>
                      <p className="text-slate-600 text-sm">placements@nmims.edu</p>
                      <p className="text-slate-600 text-sm">support@placementx.com</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CallIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Call Us</p>
                      <p className="text-slate-600 text-sm">+91 (22) 4235 5555</p>
                      <p className="text-slate-600 text-sm">Mon-Fri, 9am to 6pm IST</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Location01Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Visit Us</p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        V. L. Mehta Road, Vile Parle (West),
                        <br />
                        Mumbai, Maharashtra, India - 400 056
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-xl relative z-20">
                {isSuccess ? (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <SentIcon className="h-10 w-10" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">Message Sent!</h3>
                    <p className="text-slate-600 text-lg mb-8 max-w-md">
                      Thank you for reaching out. We have received your message and will get back to
                      you within 24 hours.
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline">
                      SentIcon Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-slate-900 mb-8">SentIcon us a Message</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">First Name</label>
                          <Input placeholder="John" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Last Name</label>
                          <Input placeholder="Doe" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <Input type="email" placeholder="john.doe@example.com" required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Inquiry Type</label>
                        <select
                          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          required
                        >
                          <option value="">Select a topic...</option>
                          <option value="recruiter">Recruiter Partnership</option>
                          <option value="student">Student Support</option>
                          <option value="technical">Technical Issue</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Message</label>
                        <Textarea
                          placeholder="How can we help you?"
                          className="min-h-[150px] resize-none"
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'SentIcon Message'}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
