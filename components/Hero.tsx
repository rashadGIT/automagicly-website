'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Clock, TrendingUp } from 'lucide-react';
import { scrollToElement } from '@/lib/utils';

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-20 pb-16 px-4"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Headline options - using option 1 as default */}
        {/* Alternative headlines:
          - AI automations that save hours every week without hiring more staff.
          - Turn repetitive tasks into workflows that run themselves.
          - Practical AI for real businesses built, tested, and deployed for you.
          - Stop doing the same tasks every day. Let AutoMagicly automate them.
        */}

        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-white">
              Automation that feels like magic
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1]"
          >
            <span className="text-white">Automate the </span>
            <span className="gradient-text">busywork.</span>
            <br />
            <span className="text-white">Run your business </span>
            <span className="gradient-text">faster.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            We design and implement AI-powered workflows that handle repetitive tasks across email, CRM, documents, scheduling, and reporting so your team can focus on customers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => scrollToElement('audit')}
              className="group relative w-full sm:w-auto btn-primary flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              <span>Start Your Free AI Audit</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToElement('examples')}
              className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 rounded-xl px-8 py-4 font-semibold transition-all duration-300"
            >
              See What We Automate
            </button>
          </motion.div>

          {/* Trust nudge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-sm text-gray-400 mt-3 mb-16"
          >
            No signup required &bull; Takes 5 minutes
          </motion.p>

          {/* Trust indicators with icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Practical builds</div>
                <div className="text-xs text-gray-400">Deployed in days, not months</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Secure-by-default</div>
                <div className="text-xs text-gray-400">Built with best practices</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Documented workflows</div>
                <div className="text-xs text-gray-400">Support when you need it</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
}
