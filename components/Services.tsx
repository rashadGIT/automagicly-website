'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToElement } from '@/lib/utils';
import {
  Users,
  Workflow,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Calendar,
  Settings,
  FileText,
  Wrench,
  Zap,
  Sparkles
} from 'lucide-react';

export default function Services() {
  const [activeService, setActiveService] = useState<'partnership' | 'oneoff'>('partnership');

  const partnershipFeatures = [
    {
      icon: RefreshCw,
      title: 'Ongoing support + continuous improvements',
      description: 'We stay with you as your needs evolve'
    },
    {
      icon: TrendingUp,
      title: 'Monitoring + iteration',
      description: 'We track performance and optimize workflows'
    },
    {
      icon: Calendar,
      title: 'Monthly automation roadmap',
      description: 'Prioritized improvements every month'
    },
    {
      icon: Settings,
      title: 'Unlimited workflow adjustments',
      description: 'Adapt as your business changes'
    }
  ];

  const oneoffFeatures = [
    {
      icon: Workflow,
      title: 'Build a single workflow end-to-end',
      description: 'Focused on solving one specific problem'
    },
    {
      icon: FileText,
      title: 'Training + handoff documentation',
      description: 'Your team takes ownership after launch'
    },
    {
      icon: Wrench,
      title: 'Optional maintenance packages',
      description: 'Add support if you need it later'
    },
    {
      icon: Zap,
      title: 'Faster turnaround',
      description: 'Often delivered in days to a few weeks'
    }
  ];

  return (
    <section id="services" className="py-20 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-brand-200 shadow-lg mb-6">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-900">
              Flexible Options
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">How We </span>
            <span className="gradient-text">Work With You</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the approach that fits your needs
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-white rounded-xl p-1.5 shadow-xl border border-gray-200">
            <button
              onClick={() => setActiveService('partnership')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeService === 'partnership'
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              AI Partnership
            </button>
            <button
              onClick={() => setActiveService('oneoff')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeService === 'oneoff'
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Simple Workflow
            </button>
          </div>
        </motion.div>

        {/* Service Cards */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {activeService === 'partnership' ? (
              <motion.div
                key="partnership"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="card p-8 md:p-12"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      AI Partnership (Full Service)
                    </h3>
                    <p className="text-lg text-gray-600">
                      Ongoing support for teams that want done-for-you automation
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {partnershipFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-50/50 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <Icon className="w-4 h-4 text-brand-600" />
                            {feature.title}
                          </div>
                          <div className="text-sm text-gray-600">{feature.description}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="p-4 bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-200 rounded-lg mb-8">
                  <p className="text-sm text-gray-700">
                    <strong className="text-brand-900">Best for:</strong> Teams that want a long-term automation partner and continuous optimization
                  </p>
                </div>

                <button
                  onClick={() => scrollToElement('booking')}
                  className="btn-primary w-full"
                >
                  Schedule a Free AI Audit
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="oneoff"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="card p-8 md:p-12"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Workflow className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      Simple Workflow Automation (One-Off)
                    </h3>
                    <p className="text-lg text-gray-600">
                      Build a single workflow, start small, and expand when ready
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {oneoffFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50/50 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <Icon className="w-4 h-4 text-purple-600" />
                            {feature.title}
                          </div>
                          <div className="text-sm text-gray-600">{feature.description}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg mb-8">
                  <p className="text-sm text-gray-700">
                    <strong className="text-purple-900">Best for:</strong> Teams starting small or solving a single, well-defined problem
                  </p>
                </div>

                <button
                  onClick={() => scrollToElement('booking')}
                  className="btn-primary w-full"
                >
                  Schedule a Free AI Audit
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
