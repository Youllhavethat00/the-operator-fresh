import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Menu, Flame, Cloud, CloudOff, RefreshCw, User, LogOut, Download, Settings } from 'lucide-react';
import { getDailyQuote } from '@/data/quotes';
import { getPhaseForMonth, getPhaseColor } from '@/data/operatingCode';
import { SyncStatus } from '@/hooks/useSupabaseSync';
import { SubscriptionBadge } from './SubscriptionBadge';

interface HeaderProps {
  onMenuClick: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  streak: number;
  syncStatus?: SyncStatus;
  isAuthenticated?: boolean;
  userEmail?: string;
  onSignInClick?: () => void;
  onSignOut?: () => void;
  subscriptionPlan?: 'free' | 'pro' | 'business';
  onUpgradeClick?: () => void;
  onManageSubscriptionClick?: () => void;
  onProfileClick?: () => void;
}


export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  notificationsEnabled,
  onToggleNotifications,
  streak,
  syncStatus,
  isAuthenticated,
  userEmail,
  onSignInClick,
  onSignOut,
  subscriptionPlan = 'free',
  onUpgradeClick,
  onManageSubscriptionClick,
  onProfileClick
}) => {


  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const quote = getDailyQuote(new Date());
  const phase = getPhaseForMonth(currentTime.getMonth() + 1);
  const phaseColor = getPhaseColor(phase);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatLastSynced = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getSyncStatusColor = () => {
    if (!syncStatus) return 'text-zinc-500';
    if (!syncStatus.isOnline) return 'text-red-400';
    if (syncStatus.isSyncing) return 'text-amber-400';
    if (syncStatus.error) return 'text-red-400';
    return 'text-green-400';
  };

  const getSyncStatusIcon = () => {
    if (!syncStatus) return <CloudOff size={16} />;
    if (!syncStatus.isOnline) return <CloudOff size={16} />;
    if (syncStatus.isSyncing) return <RefreshCw size={16} className="animate-spin" />;
    return <Cloud size={16} />;
  };

  return (
    <header className="bg-black border-b border-zinc-800 px-4 md:px-6 py-4 safe-area-top">
      <div className="flex items-center justify-between">
        {/* Left: Menu + Date/Time */}
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-zinc-400" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 md:gap-3">
              <h1 className="text-base md:text-xl font-bold text-white">
                <span className="hidden sm:inline">{formatDate(currentTime)}</span>
                <span className="sm:hidden">{formatDateShort(currentTime)}</span>
              </h1>
              <span 
                className="px-2 py-0.5 text-xs font-bold rounded uppercase hidden sm:inline"
                style={{ backgroundColor: `${phaseColor}20`, color: phaseColor }}
              >
                {phase}
              </span>
            </div>
            <p className="text-zinc-500 text-xs md:text-sm font-mono">{formatTime(currentTime)}</p>
          </div>
        </div>

        {/* Center: Quote */}
        <div className="hidden xl:block max-w-xl text-center">
          <p className="text-zinc-400 text-sm italic">"{quote.text}"</p>
          <p className="text-amber-500 text-xs mt-1">— {quote.author}</p>
        </div>

        {/* Right: Sync Status + Streak + Notifications + User */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* PWA Indicator */}
          {isPWA && (
            <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs">
              <Download size={12} />
              <span>App</span>
            </div>
          )}

          {/* Sync Status Indicator */}
          {isAuthenticated && syncStatus && (
            <div 
              className={`hidden sm:flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg border border-zinc-800 ${getSyncStatusColor()}`}
              title={syncStatus.error || (syncStatus.isSyncing ? 'Syncing...' : `Last synced: ${formatLastSynced(syncStatus.lastSynced)}`)}
            >
              {getSyncStatusIcon()}
              <span className="text-xs hidden lg:inline">
                {syncStatus.isSyncing ? 'Syncing...' : formatLastSynced(syncStatus.lastSynced)}
              </span>
            </div>
          )}

          {/* Streak Counter */}
          <div className="hidden sm:flex items-center gap-1 md:gap-2 bg-zinc-900 px-2 md:px-3 py-2 rounded-lg border border-zinc-800">
            <Flame size={18} className="text-amber-500" />
            <span className="text-white font-bold">{streak}</span>
            <span className="text-zinc-500 text-sm hidden lg:inline">day streak</span>
          </div>

          {/* Notification Toggle */}
          <button
            onClick={onToggleNotifications}
            className={`p-2 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
              notificationsEnabled 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title={notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
            aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] justify-center"
                aria-label="User menu"
              >
                <User size={20} className="text-zinc-400" />
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 scale-in">
                    <div className="p-4 border-b border-zinc-800">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-zinc-500">Signed in as</p>
                        <SubscriptionBadge 
                          plan={subscriptionPlan} 
                          onClick={() => {
                            setShowUserMenu(false);
                            onUpgradeClick?.();
                          }}
                        />
                      </div>
                      <p className="text-white font-medium truncate">{userEmail}</p>
                    </div>
                    
                    {syncStatus && (
                      <div className="p-4 border-b border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-400">Sync Status</span>
                          <span className={`flex items-center gap-1 text-xs ${getSyncStatusColor()}`}>
                            {getSyncStatusIcon()}
                            {syncStatus.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Last synced: {formatLastSynced(syncStatus.lastSynced)}
                        </p>
                        {syncStatus.error && (
                          <p className="text-xs text-red-400 mt-1">{syncStatus.error}</p>
                        )}
                      </div>
                    )}

                    <div className="p-2 space-y-1">
                      {/* Profile Link */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onProfileClick?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <User size={18} />
                        Account Settings
                      </button>
                      
                      {subscriptionPlan !== 'free' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onManageSubscriptionClick?.();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <Settings size={18} />
                          Manage Subscription
                        </button>
                      )}
                      {subscriptionPlan === 'free' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onUpgradeClick?.();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        >
                          <Settings size={18} />
                          Upgrade to Pro
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onSignOut?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>

          ) : (
            <button
              onClick={onSignInClick}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors min-h-[44px]"
            >
              <User size={18} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Quote */}
      <div className="xl:hidden mt-4 pt-4 border-t border-zinc-800">
        <p className="text-zinc-400 text-sm italic text-center line-clamp-2">"{quote.text}"</p>
        <p className="text-amber-500 text-xs text-center mt-1">— {quote.author}</p>
      </div>
    </header>
  );
};
