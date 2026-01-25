'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, Clock, Target } from 'lucide-react';
import AIBusinessAudit from './AIBusinessAudit';

export default function AuditSection() {
  return (
    <section id="ai-audit" className="py-20 px-4 bg-gradient-to-br from-white via-brand-50/30 to-accent-50/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-brand-200 shadow-lg mb-6">
            <Brain className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-900">
              AI-Powered Analysis
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">Get Your Free </span>
            <span className="gradient-text">AI Business Audit</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Answer a few questions and our AI will identify the best automation opportunities for your business.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-brand-600" />
              </div>
              <span>Takes 2-3 minutes</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-accent-600" />
              </div>
              <span>Personalized insights</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-success-600" />
              </div>
              <span>Actionable recommendations</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Audit Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AIBusinessAudit />
        </motion.div>
      </div>
    </section>
  );
}
