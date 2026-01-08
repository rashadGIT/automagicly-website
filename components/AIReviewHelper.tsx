'use client';

import { useState, useEffect } from 'react';

const REVIEW_GENERATOR_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_REVIEW_GENERATOR_WEBHOOK_URL;

interface AIReviewHelperProps {
  isOpen: boolean;
  onClose: () => void;
  currentRating: number;
  onRatingChange: (rating: number) => void;
  onApplyReview: (review: string) => void;
}

interface QuestionAnswers {
  problem: string;
  experience: string;
  results: string;
}

type ToneOption = 'professional' | 'enthusiastic' | 'casual';

export default function AIReviewHelper({
  isOpen,
  onClose,
  currentRating,
  onRatingChange,
  onApplyReview
}: AIReviewHelperProps) {
  const [answers, setAnswers] = useState<QuestionAnswers>({
    problem: '',
    experience: '',
    results: ''
  });
  const [selectedTone, setSelectedTone] = useState<ToneOption>('professional');
  const [generatedReview, setGeneratedReview] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [regenerationsLeft, setRegenerationsLeft] = useState(5);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Load persisted answers on mount
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('ai_review_helper_answers');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAnswers(parsed.answers || answers);
          setSelectedTone(parsed.tone || 'professional');
        } catch (e) {
          console.error('Error loading saved answers:', e);
        }
      }
    }
  }, [isOpen]);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('ai_review_helper_answers', JSON.stringify({
        answers,
        tone: selectedTone
      }));
    }
  }, [answers, selectedTone, isOpen]);

  // Reset regenerations when modal opens
  useEffect(() => {
    if (isOpen) {
      setRegenerationsLeft(5);
      setHasGenerated(false);
      setGeneratedReview('');
      setError('');
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (regenerationsLeft <= 0) {
      setError('No regenerations left for this session.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const payload = {
        source: 'automagicly-website-ai-review-helper',
        submittedAt: new Date().toISOString(),
        rating: currentRating,
        tone: selectedTone,
        answers: [
          {
            question: "What problem or challenge were you facing before working with us?",
            answer: answers.problem
          },
          {
            question: "What did we help you do, and how was the experience working together?",
            answer: answers.experience
          },
          {
            question: "What results or benefits did you see after the work was completed?",
            answer: answers.results
          }
        ]
      };

      if (REVIEW_GENERATOR_WEBHOOK_URL) {
        const response = await fetch(REVIEW_GENERATOR_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Failed to generate review');
        }

        const data = await response.json();
        setGeneratedReview(data.review || data.generatedReview || 'Your generated review will appear here.');
      } else {
        // Demo mode - generate a simple review based on rating
        const demoReview = generateDemoReview(currentRating, selectedTone, answers);
        setGeneratedReview(demoReview);
      }

      setHasGenerated(true);
      setRegenerationsLeft(prev => prev - 1);
    } catch (err) {
      console.error('Error generating review:', err);
      setError('Failed to generate review. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDemoReview = (rating: number, tone: ToneOption, userAnswers: QuestionAnswers): string => {
    // Simple demo review generator
    const templates = {
      professional: {
        5: 'Working with AutoMagicly has been an exceptional experience. They delivered outstanding results and demonstrated deep expertise throughout our engagement.',
        4: 'AutoMagicly provided solid service and delivered good results. The experience was positive overall.',
        3: 'AutoMagicly completed the work as expected. The results were satisfactory.',
        2: 'The service was below expectations. There were some issues that need improvement.',
        1: 'Unfortunately, this experience did not meet our needs.'
      },
      enthusiastic: {
        5: 'Absolutely amazing! AutoMagicly completely transformed our workflow and exceeded all expectations! Highly recommend!',
        4: 'Really great experience! AutoMagicly delivered solid results and I\'m very happy with the outcome!',
        3: 'Good experience overall. AutoMagicly got the job done.',
        2: 'It was okay, but had some issues that were disappointing.',
        1: 'Not what I was hoping for, unfortunately.'
      },
      casual: {
        5: 'These guys are awesome! Seriously impressed with what they did for us. Would definitely work with them again!',
        4: 'Pretty great experience. They did a good job and were easy to work with.',
        3: 'It was fine. Got what we needed done.',
        2: 'Had some issues. Could have been better.',
        1: 'Didn\'t work out for us.'
      }
    };

    // Add context from answers if provided
    let review = templates[tone][rating as 5 | 4 | 3 | 2 | 1];

    if (userAnswers.problem) {
      review += ` ${userAnswers.problem.substring(0, 50)}...`;
    }

    return review;
  };

  const handleApply = () => {
    onApplyReview(generatedReview);
    onClose();
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleRatingClick = (rating: number) => {
    onRatingChange(rating);
  };

  if (!isOpen) return null;

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && handleRatingClick(star)}
            disabled={!interactive}
            className={`text-3xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-xl font-bold text-gray-900">AI Review Helper</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1 rounded-b-xl">
          {/* Quick Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> The more specific details you share, the better your review will be! Even answering 1 question helps.
            </p>
          </div>

          {/* Rating Display */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Rating
            </label>
            {renderStars(currentRating, true)}
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What problem or challenge were you facing before working with us?
              </label>
              <textarea
                value={answers.problem}
                onChange={(e) => setAnswers(prev => ({ ...prev, problem: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., We were spending 10 hours/week on manual data entry"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What did we help you do, and how was the experience working together?
              </label>
              <textarea
                value={answers.experience}
                onChange={(e) => setAnswers(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., They automated our invoice processing and were very responsive"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What results or benefits did you see after the work was completed?
              </label>
              <textarea
                value={answers.results}
                onChange={(e) => setAnswers(prev => ({ ...prev, results: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., We now save 8 hours per week and reduced errors by 90%"
                rows={3}
              />
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Review Tone
            </label>
            <div className="flex gap-3">
              {(['professional', 'enthusiastic', 'casual'] as ToneOption[]).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSelectedTone(tone)}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedTone === tone
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || regenerationsLeft <= 0}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <span>✨</span>
                {hasGenerated ? 'Regenerate Review' : 'Generate Review'}
              </>
            )}
          </button>

          {/* Regenerations Counter */}
          {hasGenerated && (
            <div className="text-center text-sm text-gray-600">
              {regenerationsLeft} regeneration{regenerationsLeft !== 1 ? 's' : ''} left
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Generated Review Display */}
          {generatedReview && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Generated Review</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                <p className="text-gray-800 whitespace-pre-wrap">{generatedReview}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {generatedReview.length} character{generatedReview.length !== 1 ? 's' : ''}
                  {generatedReview.length >= 100 && generatedReview.length <= 300 && ' - great length!'}
                  {generatedReview.length < 100 && ' - consider adding more detail'}
                  {generatedReview.length > 300 && ' - consider being more concise'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleApply}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                >
                  Use This Review
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerationsLeft <= 0}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
