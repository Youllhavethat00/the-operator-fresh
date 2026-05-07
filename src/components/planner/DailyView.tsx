import React, { useState } from 'react';
import { Calendar, Flame, Sparkles } from 'lucide-react';
import { DailyIntention } from './DailyIntention';
import { TaskList } from './TaskList';
import { TimeBlockScheduler } from './TimeBlockScheduler';
import { ProgressRing } from './ProgressCard';
import { AICoachModal } from './AICoachModal';
import { DailyPlan, Task, TimeBlock } from '@/types/planner';
import { getDailyQuote } from '@/data/quotes';

interface DailyViewProps {
  todayPlan: DailyPlan;
  progress: { total: number; p80: number; p60: number; p20: number };
  onUpdatePlan: (updates: Partial<DailyPlan>) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTimeBlocks: (blocks: TimeBlock[]) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  todayPlan,
  progress,
  onUpdatePlan,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTimeBlocks
}) => {
  const quote = getDailyQuote(new Date());
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // ----- AI Coach -----
  const [showCoach, setShowCoach] = useState(false);

  const handleApplyCoach = (result: {
    intention: string;
    sacrifice: string;
    comfortRefused: string;
    suggestedTasks: Array<{ title: string; priority: '80' | '60' | '20' }>;
  }) => {
    onUpdatePlan({
      intention: result.intention,
      sacrifice: result.sacrifice,
      comfortRefused: result.comfortRefused,
    });

    result.suggestedTasks.forEach((task) => {
      onAddTask({
        title: task.title,
        priority: task.priority,
        completed: false,
        timeEstimate: 30,
        notes: '',
        createdAt: new Date().toISOString(),
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Coach Modal */}
      <AICoachModal
        isOpen={showCoach}
        onClose={() => setShowCoach(false)}
        onApply={handleApplyCoach}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calendar size={28} className="text-amber-500" />
            Daily Plan
          </h2>
          <p className="text-zinc-400 mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCoach(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20 min-h-[44px]"
          >
            <Sparkles size={18} />
            <span className="hidden sm:inline">Plan My Day</span>
            <span className="sm:hidden">AI Plan</span>
          </button>
          <ProgressRing
            percentage={progress.total}
            size={80}
            color={progress.total >= 80 ? '#22c55e' : progress.total >= 50 ? '#f59e0b' : '#ef4444'}
            label="Complete"
          />
        </div>
      </div>

      {/* Daily Quote */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <Flame size={24} className="text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <p className="text-white text-lg italic mb-2">"{quote.text}"</p>
            <p className="text-amber-500 text-sm">— {quote.author}</p>
          </div>
        </div>
      </div>

      {/* Daily Intention */}
      <DailyIntention
        plan={todayPlan}
        onUpdate={onUpdatePlan}
      />

      {/* Tasks */}
      <TaskList
        tasks={todayPlan.tasks}
        onAdd={onAddTask}
        onToggle={onToggleTask}
        onDelete={onDeleteTask}
      />

      {/* Time Blocks */}
      <TimeBlockScheduler
        timeBlocks={todayPlan.timeBlocks}
        tasks={todayPlan.tasks}
        onUpdate={onUpdateTimeBlocks}
      />

      {/* End of Day Review */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-bold text-white mb-3">End of Day Review</h3>
        <textarea
          value={todayPlan.endOfDayReview}
          onChange={(e) => onUpdatePlan({ endOfDayReview: e.target.value })}
          placeholder="What did you accomplish? What got in the way? What will you do differently tomorrow?"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
          rows={4}
        />
      </div>
    </div>
  );
};
