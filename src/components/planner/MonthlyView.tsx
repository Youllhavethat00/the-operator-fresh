import React, { useState } from 'react';
import { CalendarRange, Target, TrendingUp, Save } from 'lucide-react';
import { getPhaseForMonth, getPhaseColor } from '@/data/operatingCode';

export const MonthlyView: React.FC = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const phase = getPhaseForMonth(currentMonth + 1);
  const phaseColor = getPhaseColor(phase);

  const [priorities, setPriorities] = useState(['', '', '']);
  const [metrics, setMetrics] = useState(['', '', '']);
  const [focus, setFocus] = useState('');
  const [reflection, setReflection] = useState('');
  const [removeNext, setRemoveNext] = useState('');

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const updatePriority = (index: number, value: string) => {
    const updated = [...priorities];
    updated[index] = value;
    setPriorities(updated);
  };

  const updateMetric = (index: number, value: string) => {
    const updated = [...metrics];
    updated[index] = value;
    setMetrics(updated);
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date().getDate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">
          <Save size={18} />
          Save Month
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Calendar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Calendar</h3>
          
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-zinc-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
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
          {/* Top 3 Priorities */}
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Target size={20} />
              Top 3 Priorities
            </h3>
            <div className="space-y-3">
              {priorities.map((priority, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-sm font-bold">
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

          {/* Metrics */}
          <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Key Metrics
            </h3>
            <div className="space-y-3">
              {metrics.map((metric, idx) => (
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
          {/* Monthly Focus */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Monthly Focus</h3>
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="What is your primary focus this month?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={4}
            />
          </div>

          {/* Reflection */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Reflection</h3>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="End of month: What worked? What didn't?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={4}
            />
          </div>

          {/* What to Remove */}
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-400 mb-4">What Needs to Be Removed?</h3>
            <textarea
              value={removeNext}
              onChange={(e) => setRemoveNext(e.target.value)}
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
