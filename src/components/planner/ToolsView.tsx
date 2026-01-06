import React, { useState } from 'react';
import { Clock, AlertTriangle, DollarSign, Users, FileText, Plus, Trash2 } from 'lucide-react';

interface TimeAuditEntry {
  id: string;
  activity: string;
  hoursPerWeek: number;
  category: 'productive' | 'neutral' | 'waste';
}

interface DistractionEntry {
  id: string;
  trigger: string;
  cost: string;
  removalPlan: string;
}

export const ToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'time' | 'distraction' | 'routine' | 'priority'>('time');
  
  // Time Audit State
  const [timeEntries, setTimeEntries] = useState<TimeAuditEntry[]>([
    { id: '1', activity: 'Deep Work / Revenue Tasks', hoursPerWeek: 25, category: 'productive' },
    { id: '2', activity: 'Meetings', hoursPerWeek: 10, category: 'neutral' },
    { id: '3', activity: 'Email / Admin', hoursPerWeek: 8, category: 'neutral' },
    { id: '4', activity: 'Social Media', hoursPerWeek: 5, category: 'waste' },
  ]);

  // Distraction Log State
  const [distractions, setDistractions] = useState<DistractionEntry[]>([]);
  const [newDistraction, setNewDistraction] = useState({ trigger: '', cost: '', removalPlan: '' });

  // Routine State
  const [morningRoutine, setMorningRoutine] = useState<string[]>([
    'Wake up at 5:00 AM',
    '10 minutes meditation',
    'Review daily goals',
    'Exercise 30 minutes',
    'Cold shower',
    'Review Operating Code'
  ]);
  const [eveningRoutine, setEveningRoutine] = useState<string[]>([
    'End of day review',
    'Plan tomorrow',
    'No screens after 9 PM',
    'Read for 30 minutes',
    'Sleep by 10 PM'
  ]);

  const addTimeEntry = () => {
    setTimeEntries([...timeEntries, {
      id: Date.now().toString(),
      activity: '',
      hoursPerWeek: 0,
      category: 'neutral'
    }]);
  };

  const updateTimeEntry = (id: string, updates: Partial<TimeAuditEntry>) => {
    setTimeEntries(timeEntries.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(timeEntries.filter(e => e.id !== id));
  };

  const addDistraction = () => {
    if (!newDistraction.trigger) return;
    setDistractions([...distractions, { id: Date.now().toString(), ...newDistraction }]);
    setNewDistraction({ trigger: '', cost: '', removalPlan: '' });
  };

  const totalHours = timeEntries.reduce((sum, e) => sum + e.hoursPerWeek, 0);
  const productiveHours = timeEntries.filter(e => e.category === 'productive').reduce((sum, e) => sum + e.hoursPerWeek, 0);
  const wasteHours = timeEntries.filter(e => e.category === 'waste').reduce((sum, e) => sum + e.hoursPerWeek, 0);

  const tabs = [
    { id: 'time', label: 'Time Audit', icon: <Clock size={18} /> },
    { id: 'distraction', label: 'Distraction Log', icon: <AlertTriangle size={18} /> },
    { id: 'routine', label: 'Routines', icon: <FileText size={18} /> },
    { id: 'priority', label: 'Priority Matrix', icon: <Users size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Business Tools</h2>
        <p className="text-zinc-400 mt-1">Systems for execution and accountability.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Time Audit */}
      {activeTab === 'time' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Weekly Time Audit</h3>
            <button
              onClick={addTimeEntry}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              <Plus size={16} />
              Add Activity
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{totalHours}h</p>
              <p className="text-xs text-zinc-500">Total Tracked</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{productiveHours}h</p>
              <p className="text-xs text-zinc-500">Productive</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{wasteHours}h</p>
              <p className="text-xs text-zinc-500">Wasted</p>
            </div>
          </div>

          {/* Time Entries */}
          <div className="space-y-3">
            {timeEntries.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3">
                <input
                  type="text"
                  value={entry.activity}
                  onChange={(e) => updateTimeEntry(entry.id, { activity: e.target.value })}
                  placeholder="Activity name"
                  className="flex-1 bg-transparent text-white focus:outline-none"
                />
                <input
                  type="number"
                  value={entry.hoursPerWeek}
                  onChange={(e) => updateTimeEntry(entry.id, { hoursPerWeek: Number(e.target.value) })}
                  className="w-16 bg-zinc-700 rounded px-2 py-1 text-white text-center focus:outline-none"
                />
                <span className="text-zinc-500 text-sm">hrs</span>
                <select
                  value={entry.category}
                  onChange={(e) => updateTimeEntry(entry.id, { category: e.target.value as any })}
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    entry.category === 'productive' ? 'bg-green-500/20 text-green-400' :
                    entry.category === 'waste' ? 'bg-red-500/20 text-red-400' :
                    'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  <option value="productive">Productive</option>
                  <option value="neutral">Neutral</option>
                  <option value="waste">Waste</option>
                </select>
                <button
                  onClick={() => deleteTimeEntry(entry.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distraction Log */}
      {activeTab === 'distraction' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">Distraction Log</h3>
          <p className="text-zinc-400 text-sm">Track what pulls you off course and plan to eliminate it.</p>

          {/* Add New */}
          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newDistraction.trigger}
              onChange={(e) => setNewDistraction({ ...newDistraction, trigger: e.target.value })}
              placeholder="Trigger (what distracted you)"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newDistraction.cost}
              onChange={(e) => setNewDistraction({ ...newDistraction, cost: e.target.value })}
              placeholder="Cost (time/money lost)"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newDistraction.removalPlan}
                onChange={(e) => setNewDistraction({ ...newDistraction, removalPlan: e.target.value })}
                placeholder="Removal plan"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={addDistraction}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Entries */}
          <div className="space-y-3">
            {distractions.map(d => (
              <div key={d.id} className="bg-zinc-800 border border-red-500/20 rounded-lg p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-red-400 uppercase mb-1">Trigger</p>
                    <p className="text-white">{d.trigger}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 uppercase mb-1">Cost</p>
                    <p className="text-white">{d.cost}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-400 uppercase mb-1">Removal Plan</p>
                    <p className="text-white">{d.removalPlan}</p>
                  </div>
                </div>
              </div>
            ))}
            {distractions.length === 0 && (
              <p className="text-zinc-500 text-center py-8">No distractions logged. Stay focused.</p>
            )}
          </div>
        </div>
      )}

      {/* Routines */}
      {activeTab === 'routine' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4">Morning Routine</h3>
            <ul className="space-y-2">
              {morningRoutine.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white">
                  <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-zinc-900 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-4">Evening Routine</h3>
            <ul className="space-y-2">
              {eveningRoutine.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white">
                  <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Priority Matrix */}
      {activeTab === 'priority' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Eisenhower Priority Matrix</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-bold text-red-400 mb-2">Urgent & Important</h4>
              <p className="text-xs text-zinc-400 mb-3">DO FIRST - Crisis, deadlines, problems</p>
              <textarea
                placeholder="List items here..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h4 className="font-bold text-amber-400 mb-2">Not Urgent & Important</h4>
              <p className="text-xs text-zinc-400 mb-3">SCHEDULE - Planning, growth, relationships</p>
              <textarea
                placeholder="List items here..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-bold text-blue-400 mb-2">Urgent & Not Important</h4>
              <p className="text-xs text-zinc-400 mb-3">DELEGATE - Interruptions, some calls</p>
              <textarea
                placeholder="List items here..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4">
              <h4 className="font-bold text-zinc-400 mb-2">Not Urgent & Not Important</h4>
              <p className="text-xs text-zinc-500 mb-3">ELIMINATE - Time wasters, distractions</p>
              <textarea
                placeholder="List items here..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
