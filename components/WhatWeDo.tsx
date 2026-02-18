'use client';

import { motion } from 'framer-motion';
import { Search, Wrench, Link2, Rocket, TrendingUp } from 'lucide-react';

export default function WhatWeDo() {
  const steps = [
    {
      icon: Search,
      title: 'Find automation opportunities',
      description: 'We analyze your workflows to identify tasks that drain time and resources',
      color: 'from-brand-500 to-brand-600'
    },
    {
      icon: Wrench,
      title: 'Build AI workflows',
      description: 'Custom automation solutions designed for your specific business needs',
      color: 'from-accent-500 to-accent-600'
    },
    {
      icon: Link2,
      title: 'Integrate your tools',
      description: 'Connect your existing systems - email, CRM, accounting, and more',
      color: 'from-brand-500 to-cyan-500'
    },
    {
      icon: Rocket,
      title: 'Deploy + train',
      description: 'We handle implementation and make sure your team knows how to use it',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Improve over time',
      description: 'Continuous monitoring and refinement to maximize efficiency gains',
      color: 'from-success-500 to-success-600'
    }
  ];

  return (
    <section id="what-we-do" className="py-20 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What We Do
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            End-to-end automation that fits your business
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover-lift p-6 group"
              >
                <div className="text-5xl font-black text-gray-100 mb-2 leading-none">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
