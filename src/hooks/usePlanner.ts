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
  operatingCode: defa​​​​​​​​​​​​​​​​
