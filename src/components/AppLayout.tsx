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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showManageSubscription, setShowManageSubscription] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const {
    isLoaded,
    getTodayPlan,
    updateTodayPlan,
    addTask,
    toggleTask,
    deleteTask,
    updateOperatingCode,
    addGoal,
    updateGoal,
    getDailyProgress,
    getCurrentTimeBlock,
    updateTimeBlocks,
    operatingCode,
    goals,
    streak,
    // Auth
    isAuthenticated,
    user,
    signIn,
    signUp,
    signOut,
    syncStatus
  } = usePlanner();

  // Subscription hook
  const {
    subscription,
    refreshSubscription,
    cancelSubscription
  } = useSubscription(user?.email);

  const {
    permission,
    isSupported,
    isIOS,
    isPWA,
    requestPermission,
    startBlockMonitoring,
    sendMorningBriefing,
    playBlockBell,
    scheduleDailyNotifications
  } = useNotifications();

  const todayPlan = getTodayPlan();
  const progress = getDailyProgress();
  const currentBlock = getCurrentTimeBlock();

  // Check if first time user
  useEffect(() => {
    const welcomeCompleted = localStorage.getItem(WELCOME_COMPLETED_KEY);
    if (!welcomeCompleted) {
      setShowWelcome(true);
    }
  }, []);

  // Handle PWA install prompt (for Android/Chrome)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed before
      const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
      if (!dismissed) {
        setTimeout(() => setShowInstallPrompt(true), 10000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Show iOS install prompt
  useEffect(() => {
    if (isIOS && !isPWA && !showWelcome) {
      const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
      if (!dismissed) {
        setTimeout(() => setShowNotificationPrompt(true), 8000);
      }
    }
  }, [isIOS, isPWA, showWelcome]);

  // Check notification permission on mount
  useEffect(() => {
    if (isSupported && permission === 'default' && !showWelcome && !isIOS) {
      // Show prompt after 5 seconds
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, [isSupported, permission, showWelcome, isIOS]);

  // Start block monitoring when notifications are enabled
  useEffect(() => {
    if (notificationsEnabled && todayPlan.timeBlocks.length > 0) {
      const cleanup = startBlockMonitoring(todayPlan.timeBlocks, (block) => {
        console.log('Block changed:', block.label);
      });
      return cleanup;
    }
  }, [notificationsEnabled, todayPlan.timeBlocks, startBlockMonitoring]);

  // Schedule daily notifications
  useEffect(() => {
    if (notificationsEnabled) {
      const cleanup = scheduleDailyNotifications('06:00', '20:00');
      return cleanup;
    }
  }, [notificationsEnabled, scheduleDailyNotifications]);

  // Morning briefing
  useEffect(() => {
    if (notificationsEnabled && isLoaded) {
      const now = new Date();
      const hour = now.getHours();
      
      // Send morning briefing between 5-8 AM
      if (hour >= 5 && hour <= 8) {
        const lastBriefing = localStorage.getItem('last_morning_briefing');
        const today = now.toDateString();
        
        if (lastBriefing !== today) {
          sendMorningBriefing(
            todayPlan.tasks.map(t => ({ title: t.title, priority: t.priority })),
            todayPlan.sacrifice
          );
          localStorage.setItem('last_morning_briefing', today);
        }
      }
    }
  }, [notificationsEnabled, isLoaded, todayPlan, sendMorningBriefing]);

  const handleWelcomeComplete = () => {
    localStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
    setShowWelcome(false);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    setNotificationsEnabled(granted);
    setShowNotificationPrompt(false);
    if (granted) {
      playBlockBell();
    }
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      } else {
        const granted = await requestPermission();
        setNotificationsEnabled(granted);
      }
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
    setShowInstallPrompt(false);
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    setShowNotificationPrompt(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
  };

  const handleSignOut = async () => {
    await signOut();
    // Reset to dashboard view after sign out
    setCurrentView('dashboard');
  };

  const handleSubscribed = () => {
    refreshSubscription();
  };

  const handleUpgradeClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowPricingModal(true);
    }
  };

  const handleProfileClick = () => {
    setCurrentView('profile');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            todayPlan={todayPlan}
            operatingCode={operatingCode}
            progress={progress}
            currentBlock={currentBlock}
            onUpdatePlan={updateTodayPlan}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTimeBlocks={updateTimeBlocks}
          />
        );
      case 'operating-code':
        return (
          <OperatingCodeView
            operatingCode={operatingCode}
            onUpdate={updateOperatingCode}
          />
        );
      case 'daily':
        return (
          <DailyView
            todayPlan={todayPlan}
            progress={progress}
            onUpdatePlan={updateTodayPlan}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTimeBlocks={updateTimeBlocks}
          />
        );
      case 'weekly':
        return <WeeklyView />;
      case 'monthly':
        return <MonthlyView />;
      case 'goals':
        return (
          <GoalsView
            goals={goals}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
          />
        );
      case 'tools':
        return <ToolsView />;
      case 'reference':
        return <ReferenceView />;
      case 'profile':
        return isAuthenticated ? (
          <ProfileView
            user={user}
            onSignOut={handleSignOut}
            streak={streak}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-400 mb-4">Please sign in to view your profile</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        );
      default:
        return null;
    }
  };
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 animate-pulse" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" fill="#09090b" rx="64"/>
            <circle cx="256" cy="256" r="140" fill="none" stroke="#f59e0b" strokeWidth="12"/>
            <circle cx="256" cy="256" r="90" fill="none" stroke="#f59e0b" strokeWidth="6"/>
            <circle cx="256" cy="256" r="30" fill="#f59e0b"/>
            <line x1="256" y1="96" x2="256" y2="156" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
            <line x1="256" y1="356" x2="256" y2="416" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
            <line x1="96" y1="256" x2="156" y2="256" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
            <line x1="356" y1="256" x2="416" y2="256" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
          </svg>
          <p className="text-zinc-400">Loading your planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white safe-area-inset">
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onComplete={handleWelcomeComplete}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        userEmail={user?.email}
        onSubscribed={handleSubscribed}
      />

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal
        isOpen={showManageSubscription}
        onClose={() => setShowManageSubscription(false)}
        subscription={subscription}
        onCancel={cancelSubscription}
        onRefresh={refreshSubscription}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          principles={operatingCode.principles}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
        isAuthenticated={isAuthenticated}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={handleToggleNotifications}
          streak={streak}
          syncStatus={syncStatus}
          isAuthenticated={isAuthenticated}
          userEmail={user?.email}
          onSignInClick={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
          subscriptionPlan={subscription.plan}
          onUpgradeClick={handleUpgradeClick}
          onManageSubscriptionClick={() => setShowManageSubscription(true)}
          onProfileClick={handleProfileClick}
        />

        <main className="p-4 md:p-6 pb-24 lg:pb-6">
          {renderView()}
        </main>

        {/* Sync Banner for unauthenticated users */}
        {!isAuthenticated && !isPWA && (
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-gradient-to-r from-amber-500/10 to-red-500/10 border-t border-amber-500/30 p-4 safe-area-bottom">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <p className="text-white font-medium">Sync your planner across devices</p>
                <p className="text-zinc-400 text-sm">Sign in to enable cloud backup and real-time sync</p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Permission Prompt (also handles iOS install instructions) */}
      <NotificationPrompt
        isVisible={showNotificationPrompt}
        onEnable={handleEnableNotifications}
        onDismiss={handleDismissInstall}
        isIOS={isIOS}
        isPWA={isPWA}
      />

      {/* PWA Install Prompt (Android/Chrome) */}
      <InstallPrompt
        isVisible={showInstallPrompt && !isIOS}
        onInstall={handleInstallApp}
        onDismiss={handleDismissInstall}
      />
    </div>
  );
};

export default AppLayout;
