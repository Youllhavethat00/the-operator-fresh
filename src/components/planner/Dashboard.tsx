import React, { useEffect } from 'react';
import { Flame, Target, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ProgressCard, ProgressRing } from './ProgressCard';
import { TaskList } from './TaskList';
import { TimeBlockScheduler } from './TimeBlockScheduler';
import { DailyIntention } from './DailyIntention';
import { DailyPlan, Task, TimeBlock, OperatingCode } from '@/types/planner';
import { getDailyQuote } from '@/data/quotes';
interface DashboardProps {
  todayPlan: DailyPlan;
  operatingCode: OperatingCode;
  progress: {
    total: number;
    p80: number;
    p60: number;
    p20: number;
  };
  currentBlock: TimeBlock | undefined;
  onUpdatePlan: (updates: Partial<DailyPlan>) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTimeBlocks: (blocks: TimeBlock[]) => void;
}
export const Dashboard: React.FC<DashboardProps> = ({
  todayPlan,
  operatingCode,
  progress,
  currentBlock,
  onUpdatePlan,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTimeBlocks
}) => {
  const quote = getDailyQuote(new Date());
  const hasCommitment = todayPlan.intention && todayPlan.sacrifice && todayPlan.comfortRefused;

  // Calculate task counts
  const p80Tasks = todayPlan.tasks.filter(t => t.priority === '80');
  const p60Tasks = todayPlan.tasks.filter(t => t.priority === '60');
  const p20Tasks = todayPlan.tasks.filter(t => t.priority === '20');
  return <div className="space-y-6">
      {/* Alert Banner if no commitment set */}
      {!hasCommitment && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-red-400 font-bold">Daily Commitment Required</h3>
            <p className="text-zinc-400 text-sm">Set your intention, sacrifice, and comfort refusal before proceeding.</p>
          </div>
        </div>}

      {/* Daily Intention Card */}
      <DailyIntention intention={todayPlan.intention} sacrifice={todayPlan.sacrifice} comfortRefused={todayPlan.comfortRefused} onUpdate={onUpdatePlan} />

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-center">
          <ProgressRing percentage={progress.total} color={progress.total >= 80 ? '#22c55e' : progress.total >= 50 ? '#f59e0b' : '#ef4444'} label="Total" />
        </div>
        <ProgressCard title="80% Priority" percentage={progress.p80} color="#ef4444" subtitle={`${p80Tasks.filter(t => t.completed).length}/${p80Tasks.length} tasks`} icon={<Target size={18} />} />
        <ProgressCard title="60% Priority" percentage={progress.p60} color="#f59e0b" subtitle={`${p60Tasks.filter(t => t.completed).length}/${p60Tasks.length} tasks`} icon={<TrendingUp size={18} />} />
        <ProgressCard title="20% Priority" percentage={progress.p20} color="#22c55e" subtitle={`${p20Tasks.filter(t => t.completed).length}/${p20Tasks.length} tasks`} icon={<CheckCircle2 size={18} />} />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Tasks by Priority */}
        <div className="space-y-6">
          {/* 80% Priority Tasks */}
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <Target size={20} />
                80% Priority - Revenue Generating
              </h3>
              <span className="text-xs text-zinc-500">Most Important</span>
            </div>
            <TaskList tasks={p80Tasks} onAddTask={onAddTask} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} priority="80" />
          </div>

          {/* 60% Priority Tasks */}
          <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <TrendingUp size={20} />
                60% Priority - Growth Activities
              </h3>
              <span className="text-xs text-zinc-500">Important</span>
            </div>
            <TaskList tasks={p60Tasks} onAddTask={onAddTask} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} priority="60" />
          </div>

          {/* 20% Priority Tasks */}
          <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                <CheckCircle2 size={20} />
                20% Priority - Maintenance
              </h3>
              <span className="text-xs text-zinc-500">Can Wait</span>
            </div>
            <TaskList tasks={p20Tasks} onAddTask={onAddTask} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} priority="20" />
          </div>
        </div>

        {/* Right Column: Time Blocks & Current Block */}
        <div className="space-y-6">
          {/* Current Block Highlight */}
          {currentBlock && <div className="bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">CURRENT BLOCK</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{currentBlock.label}</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-zinc-400" data-mixed-content="true">
                  <Clock size={14} className="inline mr-1" />
                  {currentBlock.startTime} - {currentBlock.endTime}
                </span>
                <span className={`px-2 py-0.5 rounded font-medium ${currentBlock.priority === '80' ? 'bg-red-500/20 text-red-400' : currentBlock.priority === '60' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`} data-mixed-content="true">
                  {currentBlock.priority}% Priority
                </span>
              </div>
            </div>}

          {/* Time Block Scheduler */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-amber-400" />
              Time Blocks
            </h3>
            <TimeBlockScheduler timeBlocks={todayPlan.timeBlocks} onUpdateBlocks={onUpdateTimeBlocks} />
          </div>

          {/* Daily Quote Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
            <Flame size={24} className="text-amber-500 mb-4" />
            <blockquote className="text-lg text-white italic mb-3" data-mixed-content="true">
              "{quote.text}"
            </blockquote>
            <p className="text-amber-400 text-sm" data-mixed-content="true">{quote.author}</p>
          </div>
        </div>
      </div>

      {/* End of Day Review */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">End of Day Review</h3>
        <textarea value={todayPlan.endOfDayReview} onChange={e => onUpdatePlan({
        endOfDayReview: e.target.value
      })} placeholder="What did you accomplish today? What could you have done better? What will you do differently tomorrow?" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none" rows={4} />
      </div>
    </div>;
};