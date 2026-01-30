'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Clock, Target, Sparkles, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import AIBusinessAudit from './AIBusinessAudit';
import CustomBooking from './CustomBooking';

type ViewMode = 'choice' | 'audit' | 'booking';

export default function AuditSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('choice');

  return (
    <section id="ai-audit" className="py-20 px-4 bg-gradient-to-br from-white via-brand-50/30 to-accent-50/20">
      <div className="max-w-7xl mx-auto">
        {/* Header - always visible */}
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
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover automation opportunities tailored to your business
          </p>
        </motion.div>

        {/* Choice Screen */}
        {viewMode === 'choice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {/* Audit Option */}
            <motion.button
              onClick={() => setViewMode('audit')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="card p-8 text-left hover:border-brand-300 hover:shadow-xl transition-all group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Start AI Audit
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Answer a few questions and get personalized automation recommendations in 2-3 minutes.
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3 h-3 text-brand-600" />
                  </div>
                  <span>Takes 2-3 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-3 h-3 text-brand-600" />
                  </div>
                  <span>Personalized insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-brand-600" />
                  </div>
                  <span>Actionable recommendations</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-brand-600 font-semibold group-hover:gap-3 transition-all">
                Get Started <ArrowRight className="w-5 h-5" />
              </div>
            </motion.button>

            {/* Booking Option */}
            <motion.button
              onClick={() => setViewMode('booking')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="card p-8 text-left hover:border-accent-300 hover:shadow-xl transition-all group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Talk to an Expert
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Skip the audit and schedule a free 30-minute call with our automation specialist.
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-3 h-3 text-accent-600" />
                  </div>
                  <span>30-minute consultation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-3 h-3 text-accent-600" />
                  </div>
                  <span>Discuss your specific needs</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-accent-600" />
                  </div>
                  <span>Get expert recommendations</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-accent-600 font-semibold group-hover:gap-3 transition-all">
                Schedule Call <ArrowRight className="w-5 h-5" />
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Audit Mode */}
        {viewMode === 'audit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => setViewMode('choice')}
              className="mb-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to options
            </button>
            <AIBusinessAudit />
          </motion.div>
        )}

        {/* Booking Mode */}
        {viewMode === 'booking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => setViewMode('choice')}
              className="mb-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to options
            </button>
            <div className="max-w-3xl mx-auto">
              <CustomBooking />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
