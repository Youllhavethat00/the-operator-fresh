import React, { useState } from 'react';
import { CalendarDays, Target, CheckCircle, AlertCircle, Save } from 'lucide-react';

interface WeeklyViewProps {
  weekStart?: string;
}

export const WeeklyView: React.FC<WeeklyViewProps> = () => {
  const [objective, setObjective] = useState('');
  const [focusTheme, setFocusTheme] = useState('');
  const [keyOutcomes, setKeyOutcomes] = useState(['', '', '']);
  const [appointments, setAppointments] = useState('');
  const [notes, setNotes] = useState('');
  const [comfortVsStandards, setComfortVsStandards] = useState('');
  const [sacrificeMomentum, setSacrificeMomentum] = useState('');

  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const weekDates = getWeekDates();

  const updateKeyOutcome = (index: number, value: string) => {
    const updated = [...keyOutcomes];
    updated[index] = value;
    setKeyOutcomes(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarDays size={28} className="text-amber-500" />
            Weekly Planning
          </h2>
          <p className="text-zinc-400 mt-1">{weekDates.start} - {weekDates.end}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">
          <Save size={18} />
          Save Week
        </button>
      </div>

      {/* Main Planning Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Weekly Objective */}
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Target size={20} />
              Weekly Objective
            </h3>
            <p className="text-zinc-400 text-sm mb-3">What is the ONE thing that must happen this week?</p>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
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
              value={focusTheme}
              onChange={(e) => setFocusTheme(e.target.value)}
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
              {keyOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-bold">
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* Appointments & Deadlines */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Appointments & Deadlines</h3>
            <textarea
              value={appointments}
              onChange={(e) => setAppointments(e.target.value)}
              placeholder="List important meetings, calls, and deadlines..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={6}
            />
          </div>

          {/* Notes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            value={comfortVsStandards}
            onChange={(e) => setComfortVsStandards(e.target.value)}
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
            value={sacrificeMomentum}
            onChange={(e) => setSacrificeMomentum(e.target.value)}
            placeholder="The sacrifice that paid off..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};
