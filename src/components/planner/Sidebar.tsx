import React from 'react';
import { Flame, LayoutDashboard, Target, Calendar, CalendarDays, CalendarRange, Wrench, Database, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { ViewType } from '@/types/planner';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  principles: string[];
  isAuthenticated?: boolean;
}

const navItems: { view: ViewType; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { view: 'operating-code', label: 'Operating Code', icon: <Flame size={20} /> },
  { view: 'daily', label: 'Daily Plan', icon: <Calendar size={20} /> },
  { view: 'weekly', label: 'Weekly Plan', icon: <CalendarDays size={20} /> },
  { view: 'monthly', label: 'Monthly Plan', icon: <CalendarRange size={20} /> },
  { view: 'goals', label: 'Goals', icon: <Target size={20} /> },
  { view: 'tools', label: 'Tools', icon: <Wrench size={20} /> },
  { view: 'reference', label: 'Reference', icon: <Database size={20} /> },
];


// The Operator Logo Component
const OperatorLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#09090b" rx="64"/>
    <circle cx="256" cy="256" r="140" fill="none" stroke="#f59e0b" strokeWidth="12"/>
    <circle cx="256" cy="256" r="90" fill="none" stroke="#f59e0b" strokeWidth="6"/>
    <circle cx="256" cy="256" r="30" fill="#f59e0b"/>
    <line x1="256" y1="96" x2="256" y2="156" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
    <line x1="256" y1="356" x2="256" y2="416" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
    <line x1="96" y1="256" x2="156" y2="256" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
    <line x1="356" y1="256" x2="416" y2="256" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  principles,
  isAuthenticated = false
}) => {
  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-black border-r border-zinc-800 transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OperatorLogo className="w-8 h-8" />
          {!isCollapsed && (
            <span className="font-bold text-white tracking-wider">THE OPERATOR</span>
          )}
        </div>
        <button 
          onClick={onToggleCollapse}
          className="p-1 hover:bg-zinc-800 rounded transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} className="text-zinc-400" /> : <ChevronLeft size={16} className="text-zinc-400" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map(item => (
            <li key={item.view}>
              <button
                onClick={() => onViewChange(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  currentView === item.view
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {item.icon}
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
          
          {/* Profile Link - Only show when authenticated */}
          {isAuthenticated && (
            <li className="pt-2 mt-2 border-t border-zinc-800">
              <button
                onClick={() => onViewChange('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  currentView === 'profile'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <User size={20} />
                {!isCollapsed && <span className="text-sm font-medium">Profile</span>}
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Operating Code Preview (when expanded) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-zinc-800">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
            Operating Code
          </h3>
          <ul className="space-y-2">
            {principles.slice(0, 3).map((principle, idx) => (
              <li key={idx} className="text-xs text-zinc-500 leading-tight line-clamp-2">
                {idx + 1}. {principle}
              </li>
            ))}
            {principles.length > 3 && (
              <li className="text-xs text-zinc-600">
                +{principles.length - 3} more...
              </li>
            )}
          </ul>
        </div>
      )}
    </aside>
  );
};
