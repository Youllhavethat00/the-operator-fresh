import React, { useEffect, useState, useRef } from 'react';
import { CalendarDays, Target, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { WeeklyPlan } from '@/types/planner';

interface WeeklyViewProps {
  weeklyPlan: WeeklyPlan;
  onUpdate: (updates: Partial<WeeklyPlan>) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({ weeklyPlan, onUpdate }) => {
  // Local mirror so typing feels instant; flush to parent on debounce
  const [draft, setDraft] = useState<WeeklyPlan>(weeklyPlan);
  const [savedFlash, setSavedFlash] = useState(false);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);
  const flashTimer = useRef<NodeJS.Timeout | null>(null);

  // Re-sync from props when the underlying plan changes (e.g. week rollover)
  useEffect(() => {
    setDraft(weeklyPlan);
  }, [weeklyPlan.weekStart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced flush to the planner hook
  useEffect(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      // Only flush diffs; equality check avoids spurious writes
      const diff: Partial<WeeklyPlan> = {};
      (Object.keys(draft) as Array<keyof WeeklyPlan>).forEach((k) => {
        if (k === 'updatedAt' || k === 'weekStart') return;
        if (JSON.stringify(draft[k]) !== JSON.stringify(weeklyPlan[k])) {
          // @ts-expect-error narrow is fine here
          diff[k] = draft[k];
        }
      });
      if (Object.keys(diff).length > 0) {
        onUpdate(diff);
        setSavedFlash(true);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setSavedFlash(false), 1500);
      }
    }, 600);
    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const getWeekDates = () => {
    const start = new Date(weeklyPlan.weekStart + 'T00:00:00');
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };
  const weekDates = getWeekDates();

  const updateKeyOutcome = (index: number, value: string) => {
    const updated = [...draft.keyOutcomes];
    updated[index] = value;
    setDraft({ ...draft, keyOutcomes: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarDays size={28} className="text-amber-500" />
            Weekly Planning
          </h2>
          <p className="text-zinc-400 mt-1">{weekDates.start} - {weekDates.end}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          {savedFlash ? (
            <>
              <Check size={16} className="text-green-400" />
              <span className="text-green-400">Saved</span>
            </>
          ) : (
            <span className="text-zinc-500">Auto-saves as you type</span>
          )}
        </div>
      </div>

      {/* Main Planning Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Weekly Objective */}
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Target size={20} />
              Weekly Objective
            </h3>
            <p className="text-zinc-400 text-sm mb-3">What is the ONE thing that must happen this week?</p>
            <textarea
              value={draft.objective}
              onChange={(e) => setDraft({ ...draft, objective: e.target.value })}
              placeholder="This week, I will..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={3}
            />
          </div>

          {/* Focus Theme */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Focus Theme</h3>
            <p className="text-zinc-400 text-sm mb-3">What area of your life/business gets priority this week?</p>
            <input
              type="text"
              value={draft.focusTheme}
              onChange={(e) => setDraft({ ...draft, focusTheme: e.target.value })}
              placeholder="e.g., Sales, Content Creation, Health, Relationships"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Key Outcomes */}
          <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              Key Outcomes (3 Max)
            </h3>
            <p className="text-zinc-400 text-sm mb-3">What specific results will you achieve?</p>
            <div className="space-y-3">
              {draft.keyOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => updateKeyOutcome(idx, e.target.value)}
                    placeholder={`Outcome ${idx + 1}`}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appointments & Deadlines */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Appointments & Deadlines</h3>
            <textarea
              value={draft.appointments}
              onChange={(e) => setDraft({ ...draft, appointments: e.target.value })}
              placeholder="List important meetings, calls, and deadlines..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={6}
            />
          </div>

          {/* Notes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Notes</h3>
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Additional thoughts, ideas, or reminders..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={6}
            />
          </div>
        </div>
      </div>

      {/* Weekly Reflection */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Comfort vs. Standards
          </h3>
          <p className="text-zinc-400 text-sm mb-3">Where did you choose comfort over your standards this week?</p>
          <textarea
            value={draft.comfortVsStandards}
            onChange={(e) => setDraft({ ...draft, comfortVsStandards: e.target.value })}
            placeholder="Be honest with yourself..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
            rows={4}
          />
        </div>

        <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <Target size={20} />
            Sacrifice Momentum
          </h3>
          <p className="text-zinc-400 text-sm mb-3">What sacrifice created momentum this week?</p>
          <textarea
            value={draft.sacrificeMomentum}
            onChange={(e) => setDraft({ ...draft, sacrificeMomentum: e.target.value })}
            placeholder="The sacrifice that paid off..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};
