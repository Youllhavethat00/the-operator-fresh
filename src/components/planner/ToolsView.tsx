import React, { useEffect, useRef, useState } from 'react';
import { Clock, AlertTriangle, Users, FileText, Plus, Trash2, Check } from 'lucide-react';
import { ToolsState, TimeAuditEntry, DistractionEntry, PriorityMatrix } from '@/types/planner';

interface ToolsViewProps {
  tools: ToolsState;
  onUpdate: (updates: Partial<ToolsState>) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ tools, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'time' | 'distraction' | 'routine' | 'priority'>('time');

  // Local mirror for the priority matrix textareas (debounced flush)
  const [matrixDraft, setMatrixDraft] = useState<PriorityMatrix>(tools.priorityMatrix);
  const [savedFlash, setSavedFlash] = useState(false);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);
  const flashTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMatrixDraft(tools.priorityMatrix);
  }, [tools.priorityMatrix]);

  useEffect(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      if (JSON.stringify(matrixDraft) !== JSON.stringify(tools.priorityMatrix)) {
        onUpdate({ priorityMatrix: matrixDraft });
        setSavedFlash(true);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setSavedFlash(false), 1500);
      }
    }, 600);
    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, [matrixDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  const [newDistraction, setNewDistraction] = useState({ trigger: '', cost: '', removalPlan: '' });
  const [newMorningStep, setNewMorningStep] = useState('');
  const [newEveningStep, setNewEveningStep] = useState('');

  // Time entries
  const addTimeEntry = () => {
    const entry: TimeAuditEntry = {
      id: Date.now().toString(),
      activity: '', hoursPerWeek: 0, category: 'neutral'
    };
    onUpdate({ timeEntries: [...tools.timeEntries, entry] });
  };
  const updateTimeEntry = (id: string, updates: Partial<TimeAuditEntry>) => {
    onUpdate({
      timeEntries: tools.timeEntries.map(e => e.id === id ? { ...e, ...updates } : e)
    });
  };
  const deleteTimeEntry = (id: string) => {
    onUpdate({ timeEntries: tools.timeEntries.filter(e => e.id !== id) });
  };

  // Distractions
  const addDistraction = () => {
    if (!newDistraction.trigger.trim()) return;
    const entry: DistractionEntry = { id: Date.now().toString(), ...newDistraction };
    onUpdate({ distractions: [...tools.distractions, entry] });
    setNewDistraction({ trigger: '', cost: '', removalPlan: '' });
  };
  const deleteDistraction = (id: string) => {
    onUpdate({ distractions: tools.distractions.filter(d => d.id !== id) });
  };

  // Routines
  const addMorningStep = () => {
    if (!newMorningStep.trim()) return;
    onUpdate({ morningRoutine: [...tools.morningRoutine, newMorningStep.trim()] });
    setNewMorningStep('');
  };
  const removeMorningStep = (idx: number) => {
    onUpdate({ morningRoutine: tools.morningRoutine.filter((_, i) => i !== idx) });
  };
  const addEveningStep = () => {
    if (!newEveningStep.trim()) return;
    onUpdate({ eveningRoutine: [...tools.eveningRoutine, newEveningStep.trim()] });
    setNewEveningStep('');
  };
  const removeEveningStep = (idx: number) => {
    onUpdate({ eveningRoutine: tools.eveningRoutine.filter((_, i) => i !== idx) });
  };

  const totalHours = tools.timeEntries.reduce((sum, e) => sum + e.hoursPerWeek, 0);
  const productiveHours = tools.timeEntries.filter(e => e.category === 'productive').reduce((sum, e) => sum + e.hoursPerWeek, 0);
  const wasteHours = tools.timeEntries.filter(e => e.category === 'waste').reduce((sum, e) => sum + e.hoursPerWeek, 0);

  const tabs = [
    { id: 'time', label: 'Time Audit', icon: <Clock size={18} /> },
    { id: 'distraction', label: 'Distraction Log', icon: <AlertTriangle size={18} /> },
    { id: 'routine', label: 'Routines', icon: <FileText size={18} /> },
    { id: 'priority', label: 'Priority Matrix', icon: <Users size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Business Tools</h2>
          <p className="text-zinc-400 mt-1">Systems for execution and accountability.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          {savedFlash ? (
            <>
              <Check size={16} className="text-green-400" />
              <span className="text-green-400">Saved</span>
            </>
          ) : (
            <span className="text-zinc-500">Auto-saves</span>
          )}
        </div>
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Weekly Time Audit</h3>
            <button
              onClick={addTimeEntry}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-zinc-800 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-white">{totalHours}h</p>
              <p className="text-xs text-zinc-500">Total</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-400">{productiveHours}h</p>
              <p className="text-xs text-zinc-500">Productive</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-red-400">{wasteHours}h</p>
              <p className="text-xs text-zinc-500">Wasted</p>
            </div>
          </div>

          <div className="space-y-3">
            {tools.timeEntries.map(entry => (
              <div key={entry.id} className="flex flex-wrap items-center gap-2 sm:gap-3 bg-zinc-800 rounded-lg p-3">
                <input
                  type="text"
                  value={entry.activity}
                  onChange={(e) => updateTimeEntry(entry.id, { activity: e.target.value })}
                  placeholder="Activity"
                  className="flex-1 min-w-[140px] bg-transparent text-white focus:outline-none"
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
            {tools.timeEntries.length === 0 && (
              <p className="text-zinc-500 text-center py-8">No activities tracked yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Distraction Log */}
      {activeTab === 'distraction' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">Distraction Log</h3>
          <p className="text-zinc-400 text-sm">Track what pulls you off course and plan to eliminate it.</p>

          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newDistraction.trigger}
              onChange={(e) => setNewDistraction({ ...newDistraction, trigger: e.target.value })}
              placeholder="Trigger"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newDistraction.cost}
              onChange={(e) => setNewDistraction({ ...newDistraction, cost: e.target.value })}
              placeholder="Cost"
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

          <div className="space-y-3">
            {tools.distractions.map(d => (
              <div key={d.id} className="bg-zinc-800 border border-red-500/20 rounded-lg p-4 relative">
                <button
                  onClick={() => deleteDistraction(d.id)}
                  className="absolute top-3 right-3 p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
                <div className="grid md:grid-cols-3 gap-4 pr-8">
                  <div>
                    <p className="text-xs text-red-400 uppercase mb-1">Trigger</p>
                    <p className="text-white">{d.trigger}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 uppercase mb-1">Cost</p>
                    <p className="text-white">{d.cost || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-400 uppercase mb-1">Removal Plan</p>
                    <p className="text-white">{d.removalPlan || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
            {tools.distractions.length === 0 && (
              <p className="text-zinc-500 text-center py-8">No distractions logged. Stay focused.</p>
            )}
          </div>
        </div>
      )}

      {/* Routines */}
      {activeTab === 'routine' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4">Morning Routine</h3>
            <ul className="space-y-2 mb-4">
              {tools.morningRoutine.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white group">
                  <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{item}</span>
                  <button
                    onClick={() => removeMorningStep(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMorningStep}
                onChange={(e) => setNewMorningStep(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMorningStep()}
                placeholder="Add a step..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
              />
              <button
                onClick={addMorningStep}
                className="px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-blue-500/30 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-4">Evening Routine</h3>
            <ul className="space-y-2 mb-4">
              {tools.eveningRoutine.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white group">
                  <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{item}</span>
                  <button
                    onClick={() => removeEveningStep(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEveningStep}
                onChange={(e) => setNewEveningStep(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEveningStep()}
                placeholder="Add a step..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                onClick={addEveningStep}
                className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Priority Matrix */}
      {activeTab === 'priority' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-bold text-white mb-6">Eisenhower Priority Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-bold text-red-400 mb-2">Urgent & Important</h4>
              <p className="text-xs text-zinc-400 mb-3">DO FIRST — Crisis, deadlines, problems</p>
              <textarea
                value={matrixDraft.urgentImportant}
                onChange={(e) => setMatrixDraft({ ...matrixDraft, urgentImportant: e.target.value })}
                placeholder="List items here..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h4 className="font-bold text-amber-400 mb-2">Not Urgent & Important</h4>
              <p className="text-xs text-zinc-400 mb-3">SCHEDULE — Planning, growth, relationships</p>
              <textarea
                value={matrixDraft.notUrgentImportant}
                onChange={(e) => setMatrixDraft({ ...matrixDraft, notUrgentImportant: e.target.value })}
                placeholder="List items here..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-bold text-blue-400 mb-2">Urgent & Not Important</h4>
              <p className="text-xs text-zinc-400 mb-3">DELEGATE — Interruptions, some calls</p>
              <textarea
                value={matrixDraft.urgentNotImportant}
                onChange={(e) => setMatrixDraft({ ...matrixDraft, urgentNotImportant: e.target.value })}
                placeholder="List items here..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4">
              <h4 className="font-bold text-zinc-400 mb-2">Not Urgent & Not Important</h4>
              <p className="text-xs text-zinc-500 mb-3">ELIMINATE — Time wasters, distractions</p>
              <textarea
                value={matrixDraft.notUrgentNotImportant}
                onChange={(e) => setMatrixDraft({ ...matrixDraft, notUrgentNotImportant: e.target.value })}
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
