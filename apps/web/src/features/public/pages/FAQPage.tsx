import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '@/components/ui';
import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const faqs = [
  {
    question: "How do students get access to PlacementX?",
    answer: "Student accounts are automatically provisioned by the university administration at the beginning of the placement season. You will receive an email with your secure login credentials and instructions on how to set up your profile."
  },
  {
    question: "Can recruiters directly register on the platform?",
    answer: "Recruiters cannot self-register to ensure the integrity of the platform. However, interested companies can contact the placement cell via the Contact page. Once approved, the university will send a secure, tokenized invitation link to access the recruiter portal."
  },
  {
    question: "Is resume parsing automatic?",
    answer: "Yes, when a student uploads their resume (PDF), our built-in parser automatically extracts key information such as GPA, skills, and projects, standardizing the data for recruiters to easily filter."
  },
  {
    question: "How does the matching algorithm work?",
    answer: "The platform uses a rules-based matching engine that compares a student's verified academic data and parsed skills against the specific eligibility criteria (e.g., cut-off GPA, required degrees) defined by the recruiter for a particular job profile."
  },
  {
    question: "Are interview schedules automated?",
    answer: "Yes. Recruiters can select candidates and define time slots. PlacementX automatically allocates slots to students, preventing overlaps and sending calendar invites and notifications to all parties."
  },
  {
    question: "Who can see the final placement reports?",
    answer: "Detailed analytics and reports are only visible to the Placement Cell administrators. Students can only view their personal application statuses, and recruiters can only see data related to their specific hiring drives."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <PageContainer>
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              Everything you need to know about the PlacementX platform, how it works, and how to get support.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={twMerge(
                    "border rounded-2xl overflow-hidden transition-colors duration-300",
                    isOpen ? "border-primary/30 bg-primary/5 shadow-md" : "border-slate-200 bg-white hover:border-primary/30"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-lg text-slate-900">{faq.question}</span>
                    <div className={twMerge(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300",
                      isOpen ? "bg-primary text-white rotate-180" : "bg-slate-100 text-slate-500"
                    )}>
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
