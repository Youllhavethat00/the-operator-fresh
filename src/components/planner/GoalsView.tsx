import React, { useState } from 'react';
import { Target, Plus, Edit2, Trash2, Check, X, TrendingUp } from 'lucide-react';
import { Goal } from '@/types/planner';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => Goal;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    whyItMatters: '',
    successMetric: '',
    deadline: '',
    type: 'annual' as const,
    quarter: undefined as 1 | 2 | 3 | 4 | undefined
  });

  const annualGoals = goals.filter(g => g.type === 'annual');
  const q1Goals = goals.filter(g => g.type === 'quarterly' && g.quarter === 1);
  const q2Goals = goals.filter(g => g.type === 'quarterly' && g.quarter === 2);
  const q3Goals = goals.filter(g => g.type === 'quarterly' && g.quarter === 3);
  const q4Goals = goals.filter(g => g.type === 'quarterly' && g.quarter === 4);

  const handleAddGoal = () => {
    if (!newGoal.name.trim()) return;
    
    onAddGoal({
      ...newGoal,
      progress: 0
    });
    
    setNewGoal({
      name: '',
      whyItMatters: '',
      successMetric: '',
      deadline: '',
      type: 'annual',
      quarter: undefined
    });
    setIsAdding(false);
  };

  const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const [localProgress, setLocalProgress] = useState(goal.progress);

    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-bold text-white">{goal.name}</h4>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditingId(goal.id)}
              className="p-1 hover:bg-zinc-700 rounded transition-colors"
            >
              <Edit2 size={14} className="text-zinc-500" />
            </button>
          </div>
        </div>
        
        {goal.whyItMatters && (
          <p className="text-sm text-zinc-400 mb-2">
            <span className="text-amber-400">Why:</span> {goal.whyItMatters}
          </p>
        )}
        
        {goal.successMetric && (
          <p className="text-sm text-zinc-400 mb-2">
            <span className="text-green-400">Success:</span> {goal.successMetric}
          </p>
        )}
        
        {goal.deadline && (
          <p className="text-xs text-zinc-500 mb-3">
            Deadline: {new Date(goal.deadline).toLocaleDateString()}
          </p>
        )}
        
        {/* Progress Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Progress</span>
            <span className="text-sm font-bold text-amber-400">{localProgress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={localProgress}
            onChange={(e) => setLocalProgress(Number(e.target.value))}
            onMouseUp={() => onUpdateGoal(goal.id, { progress: localProgress })}
            onTouchEnd={() => onUpdateGoal(goal.id, { progress: localProgress })}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>
    );
  };

  const GoalSection: React.FC<{ title: string; goals: Goal[]; color: string }> = ({ title, goals, color }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-lg font-bold mb-4" style={{ color }}>{title}</h3>
      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 text-sm text-center py-4">No goals set yet</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target size={28} className="text-amber-500" />
            Goals
          </h2>
          <p className="text-zinc-400 mt-1">Set ambitious targets. Track relentlessly.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {isAdding && (
        <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-amber-400">New Goal</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Goal Name</label>
              <input
                type="text"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="What do you want to achieve?"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewGoal({ ...newGoal, type: 'annual', quarter: undefined })}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    newGoal.type === 'annual' 
                      ? 'bg-amber-500 text-black' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  Annual
                </button>
                <button
                  onClick={() => setNewGoal({ ...newGoal, type: 'quarterly', quarter: 1 })}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    newGoal.type === 'quarterly' 
                      ? 'bg-amber-500 text-black' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  Quarterly
                </button>
              </div>
            </div>
          </div>

          {newGoal.type === 'quarterly' && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Quarter</label>
              <div className="flex gap-2">
                {([1, 2, 3, 4] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => setNewGoal({ ...newGoal, quarter: q })}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      newGoal.quarter === q 
                        ? 'bg-amber-500 text-black' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    Q{q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Why It Matters</label>
            <textarea
              value={newGoal.whyItMatters}
              onChange={(e) => setNewGoal({ ...newGoal, whyItMatters: e.target.value })}
              placeholder="Why is this goal important to you?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Success Metric</label>
              <input
                type="text"
                value={newGoal.successMetric}
                onChange={(e) => setNewGoal({ ...newGoal, successMetric: e.target.value })}
                placeholder="How will you measure success?"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Deadline</label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddGoal}
              disabled={!newGoal.name.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-2 rounded-lg transition-colors"
            >
              Add Goal
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Annual Goals */}
      <GoalSection title="Annual Big 5 Goals" goals={annualGoals} color="#f59e0b" />

      {/* Quarterly Goals Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <GoalSection title="Q1 - Foundation" goals={q1Goals} color="#6b7280" />
        <GoalSection title="Q2 - Traction" goals={q2Goals} color="#3b82f6" />
        <GoalSection title="Q3 - Expansion" goals={q3Goals} color="#10b981" />
        <GoalSection title="Q4 - Domination" goals={q4Goals} color="#f59e0b" />
      </div>
    </div>
  );
};
