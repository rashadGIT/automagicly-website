'use client';

import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import CustomBooking from './CustomBooking';

export default function BookingSection() {
  return (
    <section id="booking" className="py-20 px-4 bg-gradient-to-br from-slate-50 via-brand-50/20 to-accent-50/10">
      <div className="max-w-7xl mx-auto">
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
              Free 30-Minute Consultation
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">Schedule Your Free </span>
            <span className="gradient-text">AI Audit</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Let's identify where automation can save you the most time. Pick a time that works for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CustomBooking />
        </motion.div>
      </div>
    </section>
  );
}
