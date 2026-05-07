import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle, Check } from 'lucide-react';

interface SuggestedTask {
  title: string;
  priority: '80' | '60' | '20';
}

interface CoachResponse {
  intention: string;
  sacrifice: string;
  comfortRefused: string;
  suggestedTasks: SuggestedTask[];
}

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: CoachResponse) => void;
  context?: {
    operatingPrinciples?: string[];
    recentGoals?: string[];
    yesterdayReflection?: string;
  };
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  onApply,
  context,
}) => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CoachResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setError("Tell me what you're trying to accomplish today.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: userInput.trim(),
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
    onApply(result);
    handleClose();
  };

  const handleClose = () => {
    setUserInput('');
    setResult(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const priorityColor = (p: '80' | '60' | '20') => {
    if (p === '80') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (p === '60') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-zinc-700 text-zinc-400 border-zinc-600';
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
              <h2 className="text-lg font-bold text-white">Plan My Day</h2>
              <p className="text-xs text-zinc-500">Powered by AI · Less typing, more doing</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm text-zinc-300 mb-2 font-medium">
              What are you trying to accomplish today?
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="e.g. Close the deal with the new trade partner and get ahead on next week's content..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={3}
              disabled={loading || !!result}
              maxLength={1000}
            />
            <p className="text-xs text-zinc-500 mt-1">
              One or two sentences works best. {userInput.length}/1000
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <Loader2 size={32} className="animate-spin text-amber-500 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Coach is thinking...</p>
            </div>
          )}

          {/* Result preview */}
          {result && !loading && (
            <div className="space-y-4">
              <div className="bg-zinc-800/50 border border-amber-500/30 rounded-lg p-4">
                <p className="text-xs text-amber-400 uppercase font-bold mb-1">Intention</p>
                <p className="text-white">{result.intention}</p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Sacrifice</p>
                <p className="text-white">{result.sacrifice}</p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Comfort Refused</p>
                <p className="text-white">{result.comfortRefused}</p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-400 uppercase font-bold mb-2">
                  Suggested Tasks
                </p>
                <ul className="space-y-2">
                  {result.suggestedTasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${priorityColor(task.priority)} flex-shrink-0 mt-0.5`}
                      >
                        {task.priority}%
                      </span>
                      <span className="text-white text-sm">{task.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-zinc-500 text-center">
                Apply will overwrite your current daily commitment fields.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-zinc-800 flex flex-col sm:flex-row gap-2">
          {!result ? (
            <>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors min-h-[44px]"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !userInput.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold rounded-lg transition-colors min-h-[44px]"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors min-h-[44px]"
              >
                Try Again
              </button>
              <button
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors min-h-[44px]"
              >
                <Check size={18} />
                Apply to My Day
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
