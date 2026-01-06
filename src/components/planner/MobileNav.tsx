import React from 'react';
import { LayoutDashboard, Flame, Calendar, CalendarDays, CalendarRange, Target, Wrench, FolderOpen, X, User } from 'lucide-react';
import { ViewType } from '@/types/planner';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isAuthenticated?: boolean;
}

const navItems: { view: ViewType; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={24} /> },
  { view: 'operating-code', label: 'Operating Code', icon: <Flame size={24} /> },
  { view: 'daily', label: 'Daily', icon: <Calendar size={24} /> },
  { view: 'weekly', label: 'Weekly', icon: <CalendarDays size={24} /> },
  { view: 'monthly', label: 'Monthly', icon: <CalendarRange size={24} /> },
  { view: 'goals', label: 'Goals', icon: <Target size={24} /> },
  { view: 'tools', label: 'Tools', icon: <Wrench size={24} /> },
  { view: 'reference', label: 'Reference', icon: <FolderOpen size={24} /> },
];

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  isAuthenticated = false
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 z-40 lg:hidden fade-in"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-zinc-900 border-r border-zinc-800 z-50 lg:hidden slide-in-from-left safe-area-top safe-area-bottom safe-area-left">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <rect width="512" height="512" fill="#09090b" rx="64"/>
              <circle cx="256" cy="256" r="140" fill="none" stroke="#f59e0b" strokeWidth="12"/>
              <circle cx="256" cy="256" r="90" fill="none" stroke="#f59e0b" strokeWidth="6"/>
              <circle cx="256" cy="256" r="30" fill="#f59e0b"/>
              <line x1="256" y1="96" x2="256" y2="156" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
              <line x1="256" y1="356" x2="256" y2="416" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
              <line x1="96" y1="256" x2="156" y2="256" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
              <line x1="356" y1="256" x2="416" y2="256" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
            </svg>
            <span className="font-bold text-white tracking-wider">THE OPERATOR</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.view}>
                <button
                  onClick={() => {
                    onViewChange(item.view);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all ${
                    currentView === item.view
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white active:bg-zinc-700'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
            
            {/* Profile Link - Only show when authenticated */}
            {isAuthenticated && (
              <li className="pt-2 mt-2 border-t border-zinc-800">
                <button
                  onClick={() => {
                    onViewChange('profile');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all ${
                    currentView === 'profile'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white active:bg-zinc-700'
                  }`}
                >
                  <User size={24} />
                  <span className="font-medium">Profile</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-zinc-900 safe-area-bottom">
          <div className="text-center">
            <p className="text-xs text-zinc-500">THE OPERATOR</p>
            <p className="text-xs text-zinc-600">Master Planner v1.0</p>
          </div>
        </div>
      </div>
    </>
  );
};
