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
    suggestedTasks: Array<{ title: string; priority: '80​​​​​​​​​​​​​​​​
