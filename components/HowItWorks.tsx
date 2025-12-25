'use client';

import { motion } from 'framer-motion';
import { Search, Target, Wrench, Rocket, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Audit your current process',
      description: 'We review your workflows to identify the biggest time drains and automation opportunities',
      icon: Search,
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: '2',
      title: 'Pick the best opportunities',
      description: 'Together, we prioritize workflows with the highest ROI and fastest time to value',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: '3',
      title: 'Build + test workflows',
      description: 'We design, build, and test custom automations that integrate with your existing tools',
      icon: Wrench,
      color: 'from-orange-500 to-orange-600'
    },
    {
      number: '4',
      title: 'Deploy + train + iterate',
      description: 'We launch the workflows, train your team, monitor performance, and refine over time',
      icon: Rocket,
      color: 'from-success-500 to-success-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-white via-gray-50/30 to-white">
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
              Our Process
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">How It </span>
            <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A simple, proven process from discovery to deployment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector line (hidden on last item and on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(50%+2rem)] w-full h-0.5 bg-gradient-to-r from-brand-200 to-transparent z-0" />
                )}

                <div className="relative z-10 text-center group">
                  {/* Number circle with gradient */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white shadow-xl group-hover:shadow-2xl transition-shadow duration-300`}
                  >
                    {step.number}
                  </motion.div>

                  {/* Icon with background */}
                  <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:border-brand-400 group-hover:shadow-lg transition-all duration-300">
                    <Icon className="w-8 h-8 text-gray-700 group-hover:text-brand-600 transition-colors" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
