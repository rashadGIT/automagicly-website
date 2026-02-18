'use client';

import { Sparkles, Mail, ArrowRight, Zap } from 'lucide-react';
import { scrollToElement } from '@/lib/utils';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white py-16 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* CTA Section */}
        <div className="text-center mb-16 pb-12 border-b border-gray-700/50">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-medium">Ready to transform your workflow?</span>
          </div>

          <h3 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Ready to Automate Your Busywork?
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Start your free AI Audit and discover where automation can save you the most time.
          </p>

          <button
            onClick={() => scrollToElement('audit')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Zap className="w-5 h-5" />
            <span>Start Your Free AI Audit</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-brand-400" />
              <h4 className="text-xl font-bold gradient-text">AutoMagicly</h4>
            </div>
            <p className="text-gray-400 leading-relaxed">
              AI automation that feels like magic - without the overwhelm.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'What We Do', id: 'what-we-do' },
                { label: 'Services', id: 'services' },
                { label: 'FAQ', id: 'faq' },
                { label: 'Coming Soon', id: 'coming-soon' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToElement(link.id)}
                    className="text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-brand-400 transition-all duration-300" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@automagicly.com"
                  className="text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  hello@automagicly.com
                </a>
              </li>
              <li>
                <button
                  onClick={() => scrollToElement('audit')}
                  className="text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Schedule a Call
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 border-t border-gray-700/50 text-center">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4 text-sm">
            <a href="#" className="text-gray-400 hover:text-brand-400 transition-colors">
              Privacy Policy
            </a>
            <span className="hidden md:inline text-gray-600">•</span>
            <a href="#" className="text-gray-400 hover:text-brand-400 transition-colors">
              Terms of Service
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} AutoMagicly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
