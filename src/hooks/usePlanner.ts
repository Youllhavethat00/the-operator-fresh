import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, TimeBlock, DailyPlan, Goal, OperatingCode, WeeklyPlan, MonthlyPlan } from '@/types/planner';
import { defaultOperatingCode } from '@/data/operatingCode';
import { useSupabaseSync, SyncStatus } from './useSupabaseSync';

const LOCAL_STORAGE_KEY = 'backyard_pyre_planner';

interface LocalPlannerState {
  operatingCode: OperatingCode;
  dailyPlans: Record<string, DailyPlan>;
  weeklyPlans: Record<string, WeeklyPlan>;
  monthlyPlans: Record<string, MonthlyPlan>;
  goals: Goal[];
  streak: number;
  lastActiveDate: string;
}

const getDefaultState = (): LocalPlannerState => ({
  operatingCode: defaultOperatingCode,
  dailyPlans: {},
  weeklyPlans: {},
  monthlyPlans: {},
  goals: [],
  streak: 0,
  lastActiveDate: ''
});

const getTodayKey = () => new Date().toISOString().split('T')[0];

// Sunday-anchored week start key, formatted YYYY-MM-DD
const getWeekKey = (date: Date = new Date()): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // back up to Sunday
  return d.toISOString().split('T')[0];
};

// Monthly key formatted YYYY-MM
const getMonthKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const getDefaultWeeklyPlan = (weekStart: string): WeeklyPlan => ({
  weekStart,
  objective: '',
  focusTheme: '',
  keyOutcomes: ['', '', ''],
  appointments: '',
  notes: '',
  comfortVsStandards: '',
  sacrificeMomentum: '',
  updatedAt: new Date().toISOString()
});

const getDefaultMonthlyPlan = (monthKey: string): MonthlyPlan => ({
  monthKey,
  priorities: ['', '', ''],
  metrics: ['', '', ''],
  focus: '',
  reflection: '',
  removeNext: '',
  updatedAt: new Date().toISOString()
});

const getDefaultTimeBlocks = (): TimeBlock[] => [
  { id: '1', startTime: '05:00', endTime: '07:00', label: '80% - Deep Work Block 1', priority: '80', taskIds: [], isActive: false },
  { id: '2', startTime: '07:00', endTime: '08:00', label: '60% - Admin & Planning', priority: '60', taskIds: [], isActive: false },
  { id: '3', startTime: '08:00', endTime: '12:00', label: '80% - Revenue Generation', priority: '80', taskIds: [], isActive: false },
  { id: '4', startTime: '12:00', endTime: '13:00', label: '20% - Break & Recovery', priority: '20', taskIds: [], isActive: false },
  { id: '5', startTime: '13:00', endTime: '17:00', label: '80% - Deep Work Block 2', priority: '80', taskIds: [], isActive: false },
  { id: '6', startTime: '17:00', endTime: '18:00', label: '60% - Review & Prep', priority: '60', taskIds: [], isActive: false },
  { id: '7', startTime: '18:00', endTime: '20:00', label: '20% - Personal Development', priority: '20', taskIds: [], isActive: false },
];

export const usePlanner = () => {
  // Supabase sync hook
  const supabaseSync = useSupabaseSync();

  // Local state for offline/unauthenticated mode + weekly/monthly
  // (weekly/monthly are local-only for now until DB tables exist)
  const [localState, setLocalState] = useState<LocalPlannerState>(getDefaultState);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocalState(prev => ({
          ...prev,
          ...parsed,
          // Ensure new fields exist for users with older saves
          weeklyPlans: parsed.weeklyPlans || {},
          monthlyPlans: parsed.monthlyPlans || {}
        }));
      } catch (e) {
        console.error('Failed to parse saved state');
      }
    }
    setIsLocalLoaded(true);
  }, []);

  // Save to localStorage with debounce
  const saveToLocalStorage = useCallback((state: LocalPlannerState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }, 500);
  }, []);

  // Always save weekly/monthly to localStorage even when authenticated,
  // since those tables don't exist server-side yet.
  useEffect(() => {
    if (isLocalLoaded) {
      saveToLocalStorage(localState);
    }
  }, [localState, isLocalLoaded, saveToLocalStorage]);

  // Determine which data source to use
  const isAuthenticated = supabaseSync.isAuthenticated;
  const isLoaded = isAuthenticated ? !supabaseSync.isLoading : isLocalLoaded;

  // Get current data based on auth state
  const operatingCode = isAuthenticated ? supabaseSync.operatingCode : localState.operatingCode;
  const dailyPlans = isAuthenticated ? supabaseSync.dailyPlans : localState.dailyPlans;
  const goals = isAuthenticated ? supabaseSync.goals : localState.goals;
  const streak = isAuthenticated ? supabaseSync.streak : localState.streak;

  // Weekly + Monthly always come from local for now
  const weeklyPlans = localState.weeklyPlans;
  const monthlyPlans = localState.monthlyPlans;

  // Get or create today's plan
  const getTodayPlan = useCallback((): DailyPlan => {
    const today = getTodayKey();
    if (dailyPlans[today]) {
      return dailyPlans[today];
    }
    return {
      date: today,
      intention: '',
      sacrifice: '',
      comfortRefused: '',
      tasks: [],
      timeBlocks: getDefaultTimeBlocks(),
      endOfDayReview: '',
      completed: false
    };
  }, [dailyPlans]);

  // Update today's plan
  const updateTodayPlan = useCallback((updates: Partial<DailyPlan>) => {
    const today = getTodayKey();
    const currentPlan = getTodayPlan();
    const updatedPlan = { ...currentPlan, ...updates };

    if (isAuthenticated) {
      supabaseSync.saveDailyPlan(today, updatedPlan);
    } else {
      setLocalState(prev => ({
        ...prev,
        dailyPlans: {
          ...prev.dailyPlans,
          [today]: updatedPlan
        }
      }));
    }
  }, [getTodayPlan, isAuthenticated, supabaseSync]);

  // Add task
  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    };
    const todayPlan = getTodayPlan();
    updateTodayPlan({
      tasks: [...todayPlan.tasks, newTask]
    });
    return newTask;
  }, [getTodayPlan, updateTodayPlan]);

  // Toggle task completion
  const toggleTask = useCallback((taskId: string) => {
    const todayPlan = getTodayPlan();
    updateTodayPlan({
      tasks: todayPlan.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    });
  }, [getTodayPlan, updateTodayPlan]);

  // Delete task
  const deleteTask = useCallback((taskId: string) => {
    const todayPlan = getTodayPlan();
    updateTodayPlan({
      tasks: todayPlan.tasks.filter(t => t.id !== taskId)
    });
  }, [getTodayPlan, updateTodayPlan]);

  // Update operating code
  const updateOperatingCode = useCallback((updates: Partial<OperatingCode>) => {
    if (isAuthenticated) {
      supabaseSync.updateOperatingCode(updates);
    } else {
      setLocalState(prev => ({
        ...prev,
        operatingCode: {
          ...prev.operatingCode,
          ...updates
        }
      }));
    }
  }, [isAuthenticated, supabaseSync]);

  // Add goal
  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    if (isAuthenticated) {
      return supabaseSync.saveGoal(goal);
    } else {
      const newGoal: Goal = {
        ...goal,
        id: Date.now().toString()
      };
      setLocalState(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal]
      }));
      return newGoal;
    }
  }, [isAuthenticated, supabaseSync]);

  // Update goal
  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    if (isAuthenticated) {
      supabaseSync.updateGoal(goalId, updates);
    } else {
      setLocalState(prev => ({
        ...prev,
        goals: prev.goals.map(g =>
          g.id === goalId ? { ...g, ...updates } : g
        )
      }));
    }
  }, [isAuthenticated, supabaseSync]);

  // ---------- WEEKLY PLAN METHODS ----------
  const getCurrentWeeklyPlan = useCallback((): WeeklyPlan => {
    const key = getWeekKey();
    return weeklyPlans[key] || getDefaultWeeklyPlan(key);
  }, [weeklyPlans]);

  const updateCurrentWeeklyPlan = useCallback((updates: Partial<WeeklyPlan>) => {
    const key = getWeekKey();
    setLocalState(prev => {
      const current = prev.weeklyPlans[key] || getDefaultWeeklyPlan(key);
      return {
        ...prev,
        weeklyPlans: {
          ...prev.weeklyPlans,
          [key]: {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  }, []);

  // ---------- MONTHLY PLAN METHODS ----------
  const getCurrentMonthlyPlan = useCallback((): MonthlyPlan => {
    const key = getMonthKey();
    return monthlyPlans[key] || getDefaultMonthlyPlan(key);
  }, [monthlyPlans]);

  const updateCurrentMonthlyPlan = useCallback((updates: Partial<MonthlyPlan>) => {
    const key = getMonthKey();
    setLocalState(prev => {
      const current = prev.monthlyPlans[key] || getDefaultMonthlyPlan(key);
      return {
        ...prev,
        monthlyPlans: {
          ...prev.monthlyPlans,
          [key]: {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  }, []);

  // Calculate daily progress
  const getDailyProgress = useCallback(() => {
    const plan = getTodayPlan();
    const tasks = plan.tasks;
    if (tasks.length === 0) return { total: 0, p80: 0, p60: 0, p20: 0 };

    const p80Tasks = tasks.filter(t => t.priority === '80');
    const p60Tasks = tasks.filter(t => t.priority === '60');
    const p20Tasks = tasks.filter(t => t.priority === '20');

    const p80Complete = p80Tasks.filter(t => t.completed).length;
    const p60Complete = p60Tasks.filter(t => t.completed).length;
    const p20Complete = p20Tasks.filter(t => t.completed).length;

    return {
      total: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
      p80: p80Tasks.length > 0 ? Math.round((p80Complete / p80Tasks.length) * 100) : 0,
      p60: p60Tasks.length > 0 ? Math.round((p60Complete / p60Tasks.length) * 100) : 0,
      p20: p20Tasks.length > 0 ? Math.round((p20Complete / p20Tasks.length) * 100) : 0
    };
  }, [getTodayPlan]);

  // Get current time block
  const getCurrentTimeBlock = useCallback(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const plan = getTodayPlan();

    return plan.timeBlocks.find(block => {
      return currentTime >= block.startTime && currentTime < block.endTime;
    });
  }, [getTodayPlan]);

  // Update time blocks
  const updateTimeBlocks = useCallback((timeBlocks: TimeBlock[]) => {
    updateTodayPlan({ timeBlocks });
  }, [updateTodayPlan]);

  return {
    // State
    isLoaded,
    operatingCode,
    goals,
    streak,

    // Auth
    isAuthenticated,
    user: supabaseSync.user,
    signIn: supabaseSync.signIn,
    signUp: supabaseSync.signUp,
    signOut: supabaseSync.signOut,

    // Sync status
    syncStatus: supabaseSync.syncStatus,

    // Daily plan methods
    getTodayPlan,
    updateTodayPlan,
    addTask,
    toggleTask,
    deleteTask,

    // Operating code methods
    updateOperatingCode,

    // Goal methods
    addGoal,
    updateGoal,

    // Weekly plan methods
    getCurrentWeeklyPlan,
    updateCurrentWeeklyPlan,

    // Monthly plan methods
    getCurrentMonthlyPlan,
    updateCurrentMonthlyPlan,

    // Progress methods
    getDailyProgress,
    getCurrentTimeBlock,
    updateTimeBlocks
  };
};
