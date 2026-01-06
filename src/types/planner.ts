// The Operator Planner Types

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: '80' | '60' | '20';
  timeEstimate?: number; // in minutes
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  priority: '80' | '60' | '20';
  taskIds: string[];
}

export interface DailyPlan {
  date: string;
  intention: string;
  sacrifice: string;
  comfortRefused: string;
  tasks: Task[];
  timeBlocks: TimeBlock[];
  reflection?: string;
  completed: boolean;
}

export interface WeeklyPlan {
  weekStart: string;
  goals: string[];
  priorities: string[];
  reflection?: string;
}

export interface MonthlyPlan {
  month: string;
  year: number;
  theme: string;
  goals: string[];
  milestones: string[];
  reflection?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  milestones: Milestone[];
  category: 'financial' | 'health' | 'career' | 'personal' | 'relationships';
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface OperatingCode {
  principles: string[];
  nonNegotiables: string[];
  dailyRituals: string[];
  weeklyRituals: string[];
}

export interface PlannerState {
  dailyPlans: Record<string, DailyPlan>;
  weeklyPlans: Record<string, WeeklyPlan>;
  monthlyPlans: Record<string, MonthlyPlan>;
  goals: Goal[];
  operatingCode: OperatingCode;
  streak: number;
  lastActiveDate: string;
}

export type ViewType = 
  | 'dashboard' 
  | 'operating-code' 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'goals' 
  | 'tools'
  | 'reference'
  | 'profile';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  timezone?: string;
  createdAt: string;
}

