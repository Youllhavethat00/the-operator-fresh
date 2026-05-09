import React, { useState, useEffect } from 'react';
import { ViewType } from '@/types/planner';
import { usePlanner } from '@/hooks/usePlanner';
import { useNotifications } from '@/hooks/useNotifications';
import { useSubscription } from '@/hooks/useSubscription';
import { Sidebar } from './planner/Sidebar';
import { Header } from './planner/Header';
import { Dashboard } from './planner/Dashboard';
import { OperatingCodeView } from './planner/OperatingCodeView';
import { DailyView } from './planner/DailyView';
import { WeeklyView } from './planner/WeeklyView';
import { MonthlyView } from './planner/MonthlyView';
import { GoalsView } from './planner/GoalsView';
import { ToolsView } from './planner/ToolsView';
import { ReferenceView } from './planner/ReferenceView';
import { ProfileView } from './planner/ProfileView';
import { MobileNav } from './planner/MobileNav';
import { NotificationPrompt, InstallPrompt } from './planner/NotificationPrompt';
import { WelcomeModal } from './planner/WelcomeModal';
import { AuthModal } from './planner/AuthModal';
import { PricingModal } from './planner/PricingModal';
import { ManageSubscriptionModal } from './planner/ManageSubscriptionModal';

const WELCOME_COMPLETED_KEY = 'the_operator_welcome_completed';
const INSTALL_DISMISSED_KEY = 'the_operator_install_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen​​​​​​​​​​​​​​​​
