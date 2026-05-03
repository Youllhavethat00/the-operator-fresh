// The Operator Planner Types

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: '80' | '60' | '20';
  timeEstimate?: number;
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
  objective: string;
  focusTheme: string;
  keyOutcomes: string[];
  appointments: string;
  notes: string;
  comfortVsStandards: string;
  sacrificeMomentum: string;
  updatedAt: string;
}

export interface MonthlyPlan {
  monthKey: string;
  priorities: string[];
  metrics: string[];
  focus: string;
  reflection: string;
  removeNext: string;
  updatedAt: string;
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

// ---------- TOOLS ----------
export interface TimeAuditEntry {
  id: string;
  activity: string;
  hoursPerWeek: number;
  category: 'productive' | 'neutral' | 'waste';
}

export interface DistractionEntry {
  id: string;
  trigger: string;
  cost: string;
  removalPlan: string;
}

export interface PriorityMatrix {
  urgentImportant: string;
  notUrgentImportant: string;
  urgentNotImportant: string;
  notUrgentNotImportant: string;
}

export interface ToolsState {
  timeEntries: TimeAuditEntry[];
  distractions: DistractionEntry[];
  morningRoutine: string[];
  eveningRoutine: string[];
  priorityMatrix: PriorityMatrix;
  updatedAt: string;
}

// ---------- REFERENCE VAULT ----------
export interface BusinessIdentity {
  name: string;
  ein: string;
  duns: string;
  address: string;
  registrationInfo: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface AccountHint {
  id: string;
  platform: string;
  username: string;
  hint: string;
}

export interface FinancialNotes {
  bankAccounts: string;
  creditCards: string;
  loans: string;
  subscriptions: string;
}

export interface DigitalAsset {
  id: string;
  type: string;
  name: string;
  details: string;
}

export interface ReferenceState {
  business: BusinessIdentity;
  contacts: Contact[];
  accountHints: AccountHint[];
  financial: FinancialNotes;
  digitalAssets: DigitalAsset[];
  updatedAt: string;
}

export interface PlannerState {
  dailyPlans: Record<string, DailyPlan>;
  weeklyPlans: Record<string, WeeklyPlan>;
  monthlyPlans: Record<string, MonthlyPlan>;
  goals: Goal[];
  operatingCode: OperatingCode;
  tools: ToolsState;
  reference: ReferenceState;
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
