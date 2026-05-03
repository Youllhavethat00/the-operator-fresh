import React, { useEffect, useRef, useState } from 'react';
import { CalendarRange, Target, TrendingUp, Check } from 'lucide-react';
import { getPhaseForMonth, getPhaseColor } from '@/data/operatingCode';
import { MonthlyPlan } from '@/types/planner';

interface MonthlyViewProps {
  monthlyPlan: MonthlyPlan;
  onUpdate: (updates: Partial<MonthlyPlan>) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({ monthlyPlan, onUpdate }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const phase = getPhaseForMonth(currentMonth + 1);
  const phaseColor = getPhaseColor(phase);

  const [draft, setDraft] = useState<MonthlyPlan>(monthlyPlan);
  const [savedFlash, setSavedFlash] = useState(false);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);
  const flashTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDraft(monthlyPlan);
  }, [monthlyPlan.monthKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      const diff: Partial<MonthlyPlan> = {};
      (Object.keys(draft) as Array<keyof MonthlyPlan>).forEach((k) => {
        if (k === 'updatedAt' || k === 'monthKey') return;
        if (JSON.stringify(draft[k]) !== JSON.stringify(monthlyPlan[k])) {
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

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const updatePriority = (index: number, value: string) => {
    const updated = [...draft.priorities];
    updated[index] = value;
    setDraft({ ...draft, priorities: updated });
  };

  const updateMetric = (index: number, value: string) => {
    const updated = [...draft.metrics];
    updated[index] = value;
    setDraft({ ...draft, metrics: updated });
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date().getDate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarRange size={28} className="text-amber-500" />
            {monthName}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="px-3 py-1 text-sm font-bold rounded"
              style={{ backgroundColor: `${phaseColor}20`, color: phaseColor }}
            >
              {phase}
            </span>
            <span className="text-zinc-500 text-sm">Phase</span>
          </div>
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

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Calendar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Calendar</h3>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-zinc-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                  day === null
                    ? ''
                    : day === today
                    ? 'bg-amber-500 text-black font-bold'
                    : day < today
                    ? 'text-zinc-600 hover:bg-zinc-800'
                    : 'text-zinc-300 hover:bg-zinc-800 cursor-pointer'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Priorities & Metrics */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Target size={20} />
              Top 3 Priorities
            </h3>
            <div className="space-y-3">
              {draft.priorities.map((priority, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={priority}
                    onChange={(e) => updatePriority(idx, e.target.value)}
                    placeholder={`Priority ${idx + 1}`}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Key Metrics
            </h3>
            <div className="space-y-3">
              {draft.metrics.map((metric, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={metric}
                  onChange={(e) => updateMetric(idx, e.target.value)}
                  placeholder={`Metric ${idx + 1} (e.g., Revenue: $10,000)`}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Focus & Reflection */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Monthly Focus</h3>
            <textarea
              value={draft.focus}
              onChange={(e) => setDraft({ ...draft, focus: e.target.value })}
              placeholder="What is your primary focus this month?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={4}
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Reflection</h3>
            <textarea
              value={draft.reflection}
              onChange={(e) => setDraft({ ...draft, reflection: e.target.value })}
              placeholder="End of month: What worked? What didn't?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={4}
            />
          </div>

          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-400 mb-4">What Needs to Be Removed?</h3>
            <textarea
              value={draft.removeNext}
              onChange={(e) => setDraft({ ...draft, removeNext: e.target.value })}
              placeholder="What habits, activities, or people need to go?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

