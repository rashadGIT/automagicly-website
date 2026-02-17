'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Zap, ArrowRight, Calendar, Target, Lightbulb, MessageCircle, Trophy, Mail } from 'lucide-react';
import { PainPoint, Recommendation } from '@/lib/audit-types';

interface AuditResultsProps {
  painPoints: PainPoint[];
  recommendations: Recommendation[];
  nextSteps: string | null;
  confidence: number;
  onBookConsultation: () => void;
  onRestartAudit: () => void;
  onViewConversation?: () => void;
  onEmailResults?: () => void;
  canEmail?: boolean;
}

export default function AuditResults({
  painPoints,
  recommendations,
  nextSteps,
  confidence,
  onBookConsultation,
  onRestartAudit,
  onViewConversation,
  onEmailResults,
  canEmail
}: AuditResultsProps) {
  // Sort recommendations by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => a.priority - b.priority);

  // Get complexity color
  const getComplexityColor = (complexity: 'low' | 'medium' | 'high') => {
    switch (complexity) {
      case 'low':
        return 'bg-success-100 text-success-700';
      case 'medium':
        return 'bg-warning-100 text-warning-700';
      case 'high':
        return 'bg-red-100 text-red-700';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Target className="w-4 h-4 text-warning-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Success Header with Celebration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{
            scale: { delay: 0.2, type: 'spring' },
            rotate: { delay: 0.5, duration: 0.5 }
          }}
          className="w-20 h-20 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          Audit Complete!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600"
        >
          We discovered <span className="font-semibold text-brand-600">{recommendations.length} opportunities</span> for automation in your business.
        </motion.p>
      </motion.div>

      {/* Pain Points Section */}
      {painPoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-500" />
            Identified Pain Points
          </h4>
          <ul className="space-y-3">
            {painPoints.map((point, index) => (
              <motion.li
                key={`${point.category}-${point.description.substring(0, 50)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {getSeverityIcon(point.severity)}
                <div className="flex-1">
                  <span className="text-gray-900">{point.description}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                      {point.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      point.severity === 'high' ? 'bg-red-100 text-red-700' :
                      point.severity === 'medium' ? 'bg-warning-100 text-warning-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {point.severity} impact
                    </span>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent-500" />
          Recommended Automations
        </h4>
        <div className="space-y-4">
          {sortedRecommendations.map((rec, index) => (
            <motion.div
              key={rec.title || `rec-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-4 border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {rec.priority || index + 1}
                  </span>
                  <h5 className="font-semibold text-gray-900">{rec.title || 'Automation Opportunity'}</h5>
                </div>
                {rec.complexity && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(rec.complexity)}`}>
                    {rec.complexity} complexity
                  </span>
                )}
              </div>
              {rec.description && (
                <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
              )}
              {rec.estimatedROI && (
                <p className="text-sm text-success-600 font-medium">
                  Estimated ROI: {rec.estimatedROI}
                </p>
              )}
              {rec.mappedPainPoint && (
                <p className="text-xs text-gray-500 mt-2">
                  Addresses: {rec.mappedPainPoint}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Next Steps Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass p-8 rounded-2xl text-center"
      >
        <h4 className="text-xl font-bold text-gray-900 mb-3">
          Ready to Get Started?
        </h4>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {nextSteps || 'Book a free consultation to discuss these recommendations and create your custom automation roadmap.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {canEmail && onEmailResults && (
            <button
              onClick={onEmailResults}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Email Results
            </button>
          )}
          <button
            onClick={onBookConsultation}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Schedule a Call
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onRestartAudit}
            className="btn-secondary"
          >
            Start New Audit
          </button>
        </div>
        {onViewConversation && (
          <button
            onClick={onViewConversation}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            View Full Conversation
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
