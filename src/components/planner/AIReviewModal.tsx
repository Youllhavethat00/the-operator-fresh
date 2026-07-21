import React, { useEffect, useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle, Check } from 'lucide-react';
import { DailyPlan } from '@/types/planner';

interface ReviewResponse {
  summary: string;
  patterns: string[];
  suggestedReflection: string;
  suggestedAction: string;
}

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: 'week' | 'month';
  periodLabel: string;
  dailyPlans: DailyPlan[];
  onApply: (result: { suggestedReflection: string; suggestedAction: string }) => void;
  context?: {
    operatingPrinciples?: string[];
    businessContext?: string;
  };
}

export const AIReviewModal: React.FC<AIReviewModalProps> = ({
  isOpen,
  onClose,
  period,
  periodLabel,
  dailyPlans,
  onApply,
  context,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResponse | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setResult(null);
    setError(null);
    void runReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const runReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          dailyPlans: dailyPlans.map((p) => ({
            date: p.date,
            intention: p.intention,
            sacrifice: p.sacrifice,
            comfortRefused: p.comfortRefused,
            tasks: p.tasks.map((t) => ({ title: t.title, priority: t.priority, completed: t.completed })),
          })),
          context,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.');
        setLoading(false);
        return;
      }

      setResult(data);
      setLoading(false);
    } catch (err) {
      setError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply({ suggestedReflection: result.suggestedReflection, suggestedAction: result.suggestedAction });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Sparkles size={22} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Review — {periodLabel}</h2>
              <p className="text-xs text-zinc-500">Powered by AI · Looking at what actually happened</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <Loader2 size={32} className="animate-spin text-amber-500 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Looking back at {periodLabel.toLowerCase()}...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              <div className="bg-zinc-800/50 border border-amber-500/30 rounded-lg p-4">
                <p className="text-xs text-amber-400 uppercase font-bold mb-1">Summary</p>
                <p className="text-white">{result.summary}</p>
              </div>

              {result.patterns.length > 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 uppercase font-bold mb-2">Patterns</p>
                  <ul className="space-y-2">
                    {result.patterns.map((pattern, idx) => (
                      <li key={idx} className="text-white text-sm flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestedReflection && (
                <div className="bg-zinc-800/50 border border-red-500/30 rounded-lg p-4">
                  <p className="text-xs text-red-400 uppercase font-bold mb-1">Suggested Reflection</p>
                  <p className="text-white text-sm">{result.suggestedReflection}</p>
                </div>
              )}

              {result.suggestedAction && (
                <div className="bg-zinc-800/50 border border-green-500/30 rounded-lg p-4">
                  <p className="text-xs text-green-400 uppercase font-bold mb-1">
                    {period === 'week' ? 'Sacrifice Momentum' : 'What to Remove'}
                  </p>
                  <p className="text-white text-sm">{result.suggestedAction}</p>
                </div>
              )}

              {(result.suggestedReflection || result.suggestedAction) && (
                <p className="text-xs text-zinc-500 text-center">
                  Apply will fill these into your {period === 'week' ? 'weekly reflection' : 'monthly reflection'} fields — you can still edit them after.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-zinc-800 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors min-h-[44px]"
          >
            Close
          </button>
          {result && (result.suggestedReflection || result.suggestedAction) && (
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors min-h-[44px]"
            >
              <Check size={18} />
              Apply to Reflection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
