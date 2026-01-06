import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Task, TimeBlock, DailyPlan, Goal, OperatingCode } from '@/types/planner';
import { defaultOperatingCode } from '@/data/operatingCode';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  error: string | null;
}

interface UseSupabaseSyncReturn {
  // Auth
  user: any;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  
  // Sync status
  syncStatus: SyncStatus;
  
  // Data
  operatingCode: OperatingCode;
  dailyPlans: Record<string, DailyPlan>;
  goals: Goal[];
  streak: number;
  
  // Actions
  updateOperatingCode: (updates: Partial<OperatingCode>) => Promise<void>;
  saveDailyPlan: (date: string, plan: DailyPlan) => Promise<void>;
  saveGoal: (goal: Omit<Goal, 'id'>) => Promise<Goal>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  
  // Loading
  isLoading: boolean;
}

const getDefaultTimeBlocks = (): TimeBlock[] => [
  { id: '1', startTime: '05:00', endTime: '07:00', label: '80% - Deep Work Block 1', priority: '80', taskIds: [], isActive: false },
  { id: '2', startTime: '07:00', endTime: '08:00', label: '60% - Admin & Planning', priority: '60', taskIds: [], isActive: false },
  { id: '3', startTime: '08:00', endTime: '12:00', label: '80% - Revenue Generation', priority: '80', taskIds: [], isActive: false },
  { id: '4', startTime: '12:00', endTime: '13:00', label: '20% - Break & Recovery', priority: '20', taskIds: [], isActive: false },
  { id: '5', startTime: '13:00', endTime: '17:00', label: '80% - Deep Work Block 2', priority: '80', taskIds: [], isActive: false },
  { id: '6', startTime: '17:00', endTime: '18:00', label: '60% - Review & Prep', priority: '60', taskIds: [], isActive: false },
  { id: '7', startTime: '18:00', endTime: '20:00', label: '20% - Personal Development', priority: '20', taskIds: [], isActive: false },
];

export const useSupabaseSync = (): UseSupabaseSyncReturn => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSynced: null,
    error: null
  });
  
  const [operatingCode, setOperatingCode] = useState<OperatingCode>(defaultOperatingCode);
  const [dailyPlans, setDailyPlans] = useState<Record<string, DailyPlan>>({});
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streak, setStreak] = useState(0);
  
  const channelsRef = useRef<RealtimeChannel[]>([]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadAllData(session.user.id);
        setupRealtimeSubscriptions(session.user.id);
      } else {
        // Clear data on sign out
        setOperatingCode(defaultOperatingCode);
        setDailyPlans({});
        setGoals([]);
        setStreak(0);
        cleanupSubscriptions();
      }
      
      setIsLoading(false);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadAllData(session.user.id);
        setupRealtimeSubscriptions(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      cleanupSubscriptions();
    };
  }, []);

  const cleanupSubscriptions = () => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  };

  const setupRealtimeSubscriptions = (userId: string) => {
    cleanupSubscriptions();

    // Subscribe to operating_code changes
    const operatingCodeChannel = supabase
      .channel('operating_code_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operating_code',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new) {
            const data = payload.new as any;
            setOperatingCode({
              principles: data.principles || defaultOperatingCode.principles,
              dailySacrifice: data.daily_sacrifice || '',
              dailyCommitment: data.daily_commitment || '',
              comfortRefused: data.comfort_refused || ''
            });
            setSyncStatus(prev => ({ ...prev, lastSynced: new Date() }));
          }
        }
      )
      .subscribe();

    // Subscribe to daily_plans changes
    const dailyPlansChannel = supabase
      .channel('daily_plans_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_plans',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const oldData = payload.old as any;
            setDailyPlans(prev => {
              const updated = { ...prev };
              delete updated[oldData.date];
              return updated;
            });
          } else if (payload.new) {
            const data = payload.new as any;
            const plan: DailyPlan = {
              date: data.date,
              intention: data.intention || '',
              sacrifice: data.sacrifice || '',
              comfortRefused: data.comfort_refused || '',
              tasks: data.tasks || [],
              timeBlocks: data.time_blocks || getDefaultTimeBlocks(),
              endOfDayReview: data.end_of_day_review || '',
              completed: data.completed || false
            };
            setDailyPlans(prev => ({ ...prev, [data.date]: plan }));
            setSyncStatus(prev => ({ ...prev, lastSynced: new Date() }));
          }
        }
      )
      .subscribe();

    // Subscribe to goals changes
    const goalsChannel = supabase
      .channel('goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Reload all goals on any change
          await loadGoals(userId);
          setSyncStatus(prev => ({ ...prev, lastSynced: new Date() }));
        }
      )
      .subscribe();

    channelsRef.current = [operatingCodeChannel, dailyPlansChannel, goalsChannel];
  };

  const loadAllData = async (userId: string) => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    
    try {
      await Promise.all([
        loadOperatingCode(userId),
        loadDailyPlans(userId),
        loadGoals(userId),
        loadUserProfile(userId)
      ]);
      
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSynced: new Date(),
        error: null 
      }));
    } catch (error: any) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        error: error.message 
      }));
    }
  };

  const loadOperatingCode = async (userId: string) => {
    const { data, error } = await supabase
      .from('operating_code')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading operating code:', error);
      return;
    }

    if (data) {
      setOperatingCode({
        principles: data.principles || defaultOperatingCode.principles,
        dailySacrifice: data.daily_sacrifice || '',
        dailyCommitment: data.daily_commitment || '',
        comfortRefused: data.comfort_refused || ''
      });
    }
  };

  const loadDailyPlans = async (userId: string) => {
    // Load last 30 days of plans
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('daily_plans')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

    if (error) {
      console.error('Error loading daily plans:', error);
      return;
    }

    if (data) {
      const plans: Record<string, DailyPlan> = {};
      data.forEach((row: any) => {
        plans[row.date] = {
          date: row.date,
          intention: row.intention || '',
          sacrifice: row.sacrifice || '',
          comfortRefused: row.comfort_refused || '',
          tasks: row.tasks || [],
          timeBlocks: row.time_blocks || getDefaultTimeBlocks(),
          endOfDayReview: row.end_of_day_review || '',
          completed: row.completed || false
        };
      });
      setDailyPlans(plans);
    }
  };

  const loadGoals = async (userId: string) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading goals:', error);
      return;
    }

    if (data) {
      const loadedGoals: Goal[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        whyItMatters: row.why_it_matters || '',
        successMetric: row.success_metric || '',
        deadline: row.deadline || '',
        progress: row.progress || 0,
        type: row.goal_type || 'annual',
        quarter: row.quarter
      }));
      setGoals(loadedGoals);
    }
  };

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading user profile:', error);
      return;
    }

    if (data) {
      setStreak(data.streak || 0);
    }
  };

  // Auth methods
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (!error && data.user) {
      // Create initial profile and operating code
      await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        streak: 0
      });
      
      await supabase.from('operating_code').insert({
        user_id: data.user.id,
        principles: defaultOperatingCode.principles
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Data mutation methods
  const updateOperatingCode = useCallback(async (updates: Partial<OperatingCode>) => {
    if (!user) return;
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    const dbUpdates: any = {};
    if (updates.principles !== undefined) dbUpdates.principles = updates.principles;
    if (updates.dailySacrifice !== undefined) dbUpdates.daily_sacrifice = updates.dailySacrifice;
    if (updates.dailyCommitment !== undefined) dbUpdates.daily_commitment = updates.dailyCommitment;
    if (updates.comfortRefused !== undefined) dbUpdates.comfort_refused = updates.comfortRefused;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('operating_code')
      .upsert({
        user_id: user.id,
        ...dbUpdates
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating operating code:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: error.message }));
    } else {
      setOperatingCode(prev => ({ ...prev, ...updates }));
      setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSynced: new Date() }));
    }
  }, [user]);

  const saveDailyPlan = useCallback(async (date: string, plan: DailyPlan) => {
    if (!user) return;
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    const { error } = await supabase
      .from('daily_plans')
      .upsert({
        user_id: user.id,
        date: date,
        intention: plan.intention,
        sacrifice: plan.sacrifice,
        comfort_refused: plan.comfortRefused,
        tasks: plan.tasks,
        time_blocks: plan.timeBlocks,
        end_of_day_review: plan.endOfDayReview,
        completed: plan.completed,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error('Error saving daily plan:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: error.message }));
    } else {
      setDailyPlans(prev => ({ ...prev, [date]: plan }));
      setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSynced: new Date() }));
    }
  }, [user]);

  const saveGoal = useCallback(async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
    if (!user) throw new Error('Not authenticated');
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        name: goal.name,
        why_it_matters: goal.whyItMatters,
        success_metric: goal.successMetric,
        deadline: goal.deadline || null,
        progress: goal.progress || 0,
        goal_type: goal.type,
        quarter: goal.quarter || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving goal:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: error.message }));
      throw error;
    }

    const newGoal: Goal = {
      id: data.id,
      name: data.name,
      whyItMatters: data.why_it_matters || '',
      successMetric: data.success_metric || '',
      deadline: data.deadline || '',
      progress: data.progress || 0,
      type: data.goal_type || 'annual',
      quarter: data.quarter
    };

    setGoals(prev => [newGoal, ...prev]);
    setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSynced: new Date() }));
    
    return newGoal;
  }, [user]);

  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    if (!user) return;
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.whyItMatters !== undefined) dbUpdates.why_it_matters = updates.whyItMatters;
    if (updates.successMetric !== undefined) dbUpdates.success_metric = updates.successMetric;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.type !== undefined) dbUpdates.goal_type = updates.type;
    if (updates.quarter !== undefined) dbUpdates.quarter = updates.quarter;

    const { error } = await supabase
      .from('goals')
      .update(dbUpdates)
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating goal:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: error.message }));
    } else {
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g));
      setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSynced: new Date() }));
    }
  }, [user]);

  const deleteGoal = useCallback(async (goalId: string) => {
    if (!user) return;
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting goal:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: error.message }));
    } else {
      setGoals(prev => prev.filter(g => g.id !== goalId));
      setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSynced: new Date() }));
    }
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    syncStatus,
    operatingCode,
    dailyPlans,
    goals,
    streak,
    updateOperatingCode,
    saveDailyPlan,
    saveGoal,
    updateGoal,
    deleteGoal,
    isLoading
  };
};
