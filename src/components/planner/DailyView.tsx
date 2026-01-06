import React from 'react';
import { Calendar, Flame } from 'lucide-react';
import { DailyIntention } from './DailyIntention';
import { TaskList } from './TaskList';
import { TimeBlockScheduler } from './TimeBlockScheduler';
import { ProgressRing } from './ProgressCard';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calendar size={28} className="text-amber-500" />
            Daily Plan
          </h2>
          <p className="text-zinc-400 mt-1">{today}</p>
        </div>
        <ProgressRing 
          percentage={progress.total} 
          size={80}
          color={progress.total >= 80 ? '#22c55e' : progress.total >= 50 ? '#f59e0b' : '#ef4444'}
          label="Complete"
        />
      </div>

      {/* Daily Quote */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Flame size={24} className="text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <blockquote className="text-lg text-white italic">"{quote.text}"</blockquote>
            <p className="text-amber-400 text-sm mt-2">— {quote.author}</p>
          </div>
        </div>
      </div>

      {/* Daily Intention */}
      <DailyIntention
        intention={todayPlan.intention}
        sacrifice={todayPlan.sacrifice}
        comfortRefused={todayPlan.comfortRefused}
        onUpdate={onUpdatePlan}
      />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Tasks */}
        <div className="space-y-6">
          {/* 80% Tasks */}
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-400">80% Priority</h3>
              <span className="text-2xl font-bold text-red-400">{progress.p80}%</span>
            </div>
            <p className="text-zinc-500 text-sm mb-4">Revenue-generating, high-impact tasks</p>
            <TaskList
              tasks={todayPlan.tasks.filter(t => t.priority === '80')}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              priority="80"
            />
          </div>

          {/* 60% Tasks */}
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-amber-400">60% Priority</h3>
              <span className="text-2xl font-bold text-amber-400">{progress.p60}%</span>
            </div>
            <p className="text-zinc-500 text-sm mb-4">Growth and development activities</p>
            <TaskList
              tasks={todayPlan.tasks.filter(t => t.priority === '60')}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              priority="60"
            />
          </div>

          {/* 20% Tasks */}
          <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-green-400">20% Priority</h3>
              <span className="text-2xl font-bold text-green-400">{progress.p20}%</span>
            </div>
            <p className="text-zinc-500 text-sm mb-4">Maintenance and admin tasks</p>
            <TaskList
              tasks={todayPlan.tasks.filter(t => t.priority === '20')}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              priority="20"
            />
          </div>
        </div>

        {/* Right: Time Blocks & Review */}
        <div className="space-y-6">
          {/* Time Blocks */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Time Block Schedule</h3>
            <TimeBlockScheduler
              timeBlocks={todayPlan.timeBlocks}
              onUpdateBlocks={onUpdateTimeBlocks}
            />
          </div>

          {/* End of Day Review */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">End of Day Review</h3>
            <p className="text-zinc-500 text-sm mb-3">
              Reflect on your day. What worked? What didn't? What will you do differently tomorrow?
            </p>
            <textarea
              value={todayPlan.endOfDayReview}
              onChange={(e) => onUpdatePlan({ endOfDayReview: e.target.value })}
              placeholder="Write your reflection here..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              rows={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
