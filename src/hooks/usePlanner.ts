import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Task, TimeBlock, DailyPlan, Goal, OperatingCode,
  WeeklyPlan, MonthlyPlan, ToolsState, ReferenceState
} from '@/types/planner';
import { defaultOperatingCode } from '@/data/operatingCode';
import { useSupabaseSync, SyncStatus } from './useSupabaseSync';

const LOCAL_STORAGE_KEY = 'backyard_pyre_planner';

interface LocalPlannerState {
  operatingCode: OperatingCode;
  dailyPlans: Record<string, DailyPlan>;
  weeklyPlans: Record<string, WeeklyPlan>;
  monthlyPlans: Record<string, MonthlyPlan>;
  tools: ToolsState;
  reference: ReferenceState;
  goals: Goal[];
  streak: number;
  lastActiveDate: string;
}

const getDefaultTools = (): ToolsState => ({
  timeEntries: [
    { id: '1', activity: 'Deep Work / Revenue Tasks', hoursPerWeek: 25, category: 'productive' },
    { id: '2', activity: 'Meetings', hoursPerWeek: 10, category: 'neutral' },
    { id: '3', activity: 'Email / Admin', hoursPerWeek: 8, category: 'neutral' },
    { id: '4', activity: 'Social Media', hoursPerWeek: 5, category: 'waste' },
  ],
  distractions: [],
  morningRoutine: [
    'Wake up at 5:00 AM',
    '10 minutes meditation',
    'Review daily goals',
    'Exercise 30 minutes',
    'Cold shower',
    'Review Operating Code'
  ],
  eveningRoutine: [
    'End of day review',
    'Plan tomorrow',
    'No screens after 9 PM',
    'Read for 30 minutes',
    'Sleep by 10 PM'
  ],
  priorityMatrix: {
    urgentImportant: '',
    notUrgentImportant: '',
    urgentNotImportant: '',
    notUrgentNotImportant: ''
  },
  updatedAt: new Date().toISOString()
});

const getDefaultReference = (): ReferenceState => ({
  business: { name: '', ein: '', duns: '', address: '', registrationInfo: '' },
  contacts: [
    { id: '1', name: '', role: 'Accountant', phone: '', email: '' },
    { id: '2', name: '', role: 'Lawyer', phone: '', email: '' },
    { id: '3', name: '', role: 'Bank Contact', phone: '', email: '' },
  ],
  accountHints: [],
  financial: { bankAccounts: '', creditCards: '', loans: '', subscriptions: '' },
  digitalAssets: [],
  updatedAt: new Date().toISOString()
});

const getDefaultState = (): LocalPlannerState => ({
  operatingCode: defaultOperatingCode,
  dailyPlans: {},
  weeklyPlans: {},
  monthlyPlans: {},
  tools: getDefaultTools(),
  reference: getDefaultReference(),
  goals: [],
  streak: 0,
  lastActiveDate: ''
});

const getTodayKey = () => new Date().toISOString().split('T')[0];

const getWeekKey = (date: Date = new Date()): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
};

const getMonthKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const getDefaultWeeklyPlan = (weekStart: string): WeeklyPlan => ({
  weekStart, objective: '', focusTheme: '', keyOutcomes: ['', '', ''],
  appointments: '', notes: '', comfortVsStandards: '', sacrificeMomentum: '',
  updatedAt: new Date().toISOString()
});

const getDefaultMonthlyPlan = (monthKey: string): MonthlyPlan => ({
  monthKey, priorities: ['', '', ''], metrics: ['', '', ''],
  focus: '', reflection: '', removeNext: '',
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
  const supabaseSync = useSupabaseSync();
  const [localState, setLocalState] = useState<LocalPlannerState>(getDefaultState);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocalState(prev => ({
          ...prev,
          ...parsed,
          weeklyPlans: parsed.weeklyPlans || {},
          monthlyPlans: parsed.monthlyPlans || {},
          tools: parsed.tools || getDefaultTools(),
          reference: parsed.reference || getDefaultReference()
        }));
      } catch (e) {
        console.error('Failed to parse saved state');
      }
    }
    setIsLocalLoaded(true);
  }, []);

  const saveToLocalStorage = useCallback((state: LocalPlannerState) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }, 500);
  }, []);

  useEffect(() => {
    if (isLocalLoaded) saveToLocalStorage(localState);
  }, [localState, isLocalLoaded, saveToLocalStorage]);

  const isAuthenticated = supabaseSync.isAuthenticated;
  const isLoaded = isAuthenticated ? !supabaseSync.isLoading : isLocalLoaded;

  const operatingCode = isAuthenticated ? supabaseSync.operatingCode : localState.operatingCode;
  const dailyPlans = isAuthenticated ? supabaseSync.dailyPlans : localState.dailyPlans;
  const goals = isAuthenticated ? supabaseSync.goals : localState.goals;
  const streak = isAuthenticated ? supabaseSync.streak : localState.streak;

  const weeklyPlans = localState.weeklyPlans;
  const monthlyPlans = localState.monthlyPlans;
  const tools = localState.tools;
  const reference = localState.reference;

  const getTodayPlan = useCallback((): DailyPlan => {
    const today = getTodayKey();
    if (dailyPlans[today]) return dailyPlans[today];
    return {
      date: today, intention: '', sacrifice: '', comfortRefused: '',
      tasks: [], timeBlocks: getDefaultTimeBlocks(),
      endOfDayReview: '', completed: false
    };
  }, [dailyPlans]);

  const updateTodayPlan = useCallback((updates: Partial<DailyPlan>) => {
    const today = getTodayKey();
    const currentPlan = getTodayPlan();
    const updatedPlan = { ...currentPlan, ...updates };
    if (isAuthenticated) {
      supabaseSync.saveDailyPlan(today, updatedPlan);
    } else {
      setLocalState(prev => ({
        ...prev,
        dailyPlans: { ...prev.dailyPlans, [today]: updatedPlan }
      }));
    }
  }, [getTodayPlan, isAuthenticated, supabaseSync]);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: Date.now().toString() };
    const todayPlan = getTodayPlan();
    updateTodayPlan({ tasks: [...todayPlan.tasks, newTask] });
    return newTask;
  }, [getTodayPlan, updateTodayPlan]);

  const toggleTask = useCallback((taskId: string) => {
    const todayPlan = getTodayPlan();
    updateTodayPlan({
      tasks: todayPlan.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    });
  }, [getTodayPlan, updateTodayPlan]);

  const deleteTask = useCallback((taskId: string) => {
    const todayPlan = getTodayPlan();
    updateTodayPlan({ tasks: todayPlan.tasks.filter(t => t.id !== taskId) });
  }, [getTodayPlan, updateTodayPlan]);

  const updateOperatingCode = useCallback((updates: Partial<OperatingCode>) => {
    if (isAuthenticated) {
      supabaseSync.updateOperatingCode(updates);
    } else {
      setLocalState(prev => ({
        ...prev,
        operatingCode: { ...prev.operatingCode, ...updates }
      }));
    }
  }, [isAuthenticated, supabaseSync]);

  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    if (isAuthenticated) return supabaseSync.saveGoal(goal);
    const newGoal: Goal = { ...goal, id: Date.now().toString() };
    setLocalState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
    return newGoal;
  }, [isAuthenticated, supabaseSync]);

  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    if (isAuthenticated) {
      supabaseSync.updateGoal(goalId, updates);
    } else {
      setLocalState(prev => ({
        ...prev,
        goals: prev.goals.map(g => g.id === goalId ? { ...g, ...updates } : g)
      }));
    }
  }, [isAuthenticated, supabaseSync]);

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
          [key]: { ...current, ...updates, updatedAt: new Date().toISOString() }
        }
      };
    });
  }, []);

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
          [key]: { ...current, ...updates, updatedAt: new Date().toISOString() }
        }
      };
    });
  }, []);

  const updateTools = useCallback((updates: Partial<ToolsState>) => {
    setLocalState(prev => ({
      ...prev,
      tools: { ...prev.tools, ...updates, updatedAt: new Date().toISOString() }
    }));
  }, []);

  const updateReference = useCallback((updates: Partial<ReferenceState>) => {
    setLocalState(prev => ({
      ...prev,
      reference: { ...prev.reference, ...updates, updatedAt: new Date().toISOString() }
    }));
  }, []);

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

  const getCurrentTimeBlock = useCallback(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const plan = getTodayPlan();
    return plan.timeBlocks.find(block => currentTime >= block.startTime && currentTime < block.endTime);
  }, [getTodayPlan]);

  const updateTimeBlocks = useCallback((timeBlocks: TimeBlock[]) => {
    updateTodayPlan({ timeBlocks });
  }, [updateTodayPlan]);

  return {
    isLoaded,
    operatingCode,
    goals,
    streak,
    isAuthenticated,
    user: supabaseSync.user,
    signIn: supabaseSync.signIn,
    signUp: supabaseSync.signUp,
    signOut: supabaseSync.signOut,
    syncStatus: supabaseSync.syncStatus,
    getTodayPlan,
    updateTodayPlan,
    addTask,
    toggleTask,
    deleteTask,
    updateOperatingCode,
    addGoal,
    updateGoal,
    getCurrentWeeklyPlan,
    updateCurrentWeeklyPlan,
    getCurrentMonthlyPlan,
    updateCurrentMonthlyPlan,
    tools,
    updateTools,
    reference,
    updateReference,
    getDailyProgress,
    getCurrentTimeBlock,
    updateTimeBlocks
  };
};
