'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Sparkles, ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What tools do you integrate with?',
    answer: 'We integrate with popular business tools including Google Workspace, Microsoft 365, QuickBooks, HubSpot, Salesforce, Notion, Slack, Airtable, Zapier, Make, and many more. If you use a specific tool, we can likely connect it or find a workaround.'
  },
  {
    question: 'Will this replace my employees?',
    answer: 'No. Automation handles repetitive tasks so your team can focus on higher-value work like customer relationships, strategy, and creativity. Think of it as giving your team superpowers, not replacing them.'
  },
  {
    question: 'How do you handle security and data privacy?',
    answer: 'We follow security best practices including encrypted connections, minimal data access (only what is needed), and compliance with industry standards. We never store sensitive customer data unless required for the workflow, and we document all data flows for your review.'
  },
  {
    question: 'How long does a workflow take to build?',
    answer: 'Simple workflows can often be built in days to a week. More complex automations involving multiple tools and custom logic may take a few weeks. We will give you a realistic timeline during your AI Audit.'
  },
  {
    question: 'Do I need to change my current tools?',
    answer: 'Usually no. We build automations around your existing tools and workflows. In rare cases, we might suggest a better tool if it significantly improves the automation, but the choice is always yours.'
  },
  {
    question: 'What is the difference between AI Partnership and One-Off?',
    answer: 'AI Partnership is ongoing support with continuous improvements, monitoring, and monthly roadmaps - best for teams that want long-term optimization. One-Off builds a single workflow with training and handoff - best for teams starting small or solving a specific problem.'
  },
  {
    question: 'What if I do not like the automation?',
    answer: 'We work iteratively and get your approval at each stage. If something is not working, we will refine it until it does. Our goal is to save you time and reduce frustration, not add to it.'
  },
  {
    question: 'Can you automate Microsoft 365 and Google Workspace?',
    answer: 'Yes! Both are commonly used platforms, and we have extensive experience building automations for Outlook, Teams, OneDrive, Gmail, Google Drive, Calendar, Sheets, and more.'
  },
  {
    question: 'What happens after the AI Audit?',
    answer: 'After the audit, we will send you a summary of opportunities with estimated time savings and complexity. If you want to move forward, we will prioritize the highest-impact workflows and create a project plan. No pressure - the audit is free and there is no obligation.'
  },
  {
    question: 'Do you offer refunds or guarantees?',
    answer: 'We work collaboratively and iteratively to ensure you are happy with the result. If there is an issue, we will fix it. Specific refund terms depend on the engagement type and will be outlined in your agreement.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 bg-gradient-to-br from-white via-slate-50/30 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-brand-200 shadow-lg mb-6">
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-900">
              Got Questions?
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">Frequently Asked </span>
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg text-gray-600">
            Common questions about our automation services
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="card overflow-hidden hover-lift"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-brand-50/30 transition-colors group"
              >
                <span className="font-semibold text-gray-900 pr-4 group-hover:text-brand-600 transition-colors">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-brand-600" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
