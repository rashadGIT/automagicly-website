'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Calendar,
  FileSearch,
  HeadphonesIcon,
  BarChart3,
  Users,
  PenTool,
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function ExampleAutomations() {
  const examples = [
    {
      title: 'Lead Follow-Up Assistant',
      icon: MessageSquare,
      iconColor: 'from-brand-500 to-brand-600',
      problem: 'New leads wait hours or days for a response',
      automation: 'AI sends instant, personalized replies and updates CRM',
      outcome: 'Faster response times, higher conversion rates'
    },
    {
      title: 'Invoice & Receipt Processing',
      icon: FileText,
      iconColor: 'from-success-500 to-success-600',
      problem: 'Manual data entry from invoices takes hours each week',
      automation: 'AI extracts data, categorizes, and syncs to accounting software',
      outcome: 'Eliminate data entry errors, save 5-10 hours weekly'
    },
    {
      title: 'Appointment Scheduling + Reminders',
      icon: Calendar,
      iconColor: 'from-purple-500 to-purple-600',
      problem: 'No-shows waste time and revenue',
      automation: 'Automated booking, confirmations, and smart reminders',
      outcome: 'Reduce no-shows by 40-60%, fill more slots'
    },
    {
      title: 'Proposal Intake Triage',
      icon: FileSearch,
      iconColor: 'from-orange-500 to-orange-600',
      problem: 'Sorting through RFPs and inquiries manually',
      automation: 'Forms auto-capture details, AI summarizes and routes to right team',
      outcome: 'Respond to qualified leads faster, filter noise'
    },
    {
      title: 'Customer Support FAQ Assistant',
      icon: HeadphonesIcon,
      iconColor: 'from-brand-500 to-brand-600',
      problem: 'Same questions answered repeatedly',
      automation: 'AI answers common questions instantly from knowledge base',
      outcome: 'Free up support team, improve response time'
    },
    {
      title: 'Weekly Reporting Automation',
      icon: BarChart3,
      iconColor: 'from-indigo-500 to-indigo-600',
      problem: 'Compiling reports from multiple sources takes hours',
      automation: 'AI pulls data, generates summary, and emails stakeholders',
      outcome: 'Save 3-5 hours weekly, consistent reporting'
    },
    {
      title: 'Recruiting & Onboarding',
      icon: Users,
      iconColor: 'from-pink-500 to-pink-600',
      problem: 'Manual document collection and checklist tracking',
      automation: 'Automated document requests, checklist tracking, and reminders',
      outcome: 'Faster onboarding, better candidate experience'
    },
    {
      title: 'Social/Content Helper',
      icon: PenTool,
      iconColor: 'from-violet-500 to-violet-600',
      problem: 'Content drafting and scheduling is time-consuming',
      automation: 'AI drafts content from prompts, queues for review and posting',
      outcome: 'Consistent content calendar, save hours on drafts'
    }
  ];

  return (
    <section id="examples" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-brand-200 shadow-lg mb-6">
            <Zap className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-900">
              Real-World Solutions
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">Example </span>
            <span className="gradient-text">Automations</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real workflows we build for businesses like yours
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example, index) => {
            const Icon = example.icon;
            return (
              <motion.div
                key={example.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover-lift p-6 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${example.iconColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {example.title}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
                        Problem
                      </div>
                      <p className="text-sm text-gray-700">{example.problem}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">
                        Automation
                      </div>
                      <p className="text-sm text-gray-700">{example.automation}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-success-600 uppercase tracking-wide mb-1">
                        Outcome
                      </div>
                      <p className="text-sm text-gray-700">{example.outcome}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
