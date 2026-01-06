import React from 'react';
import { Zap, Crown, Sparkles } from 'lucide-react';

interface SubscriptionBadgeProps {
  plan: 'free' | 'pro' | 'business';
  onClick?: () => void;
  showUpgrade?: boolean;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  plan,
  onClick,
  showUpgrade = true
}) => {
  if (plan === 'free' && showUpgrade) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium hover:from-amber-500/30 hover:to-red-500/30 transition-all group"
      >
        <Sparkles className="w-3.5 h-3.5 group-hover:animate-pulse" />
        Upgrade
      </button>
    );
  }

  if (plan === 'pro') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium">
        <Zap className="w-3.5 h-3.5" />
        Pro
      </div>
    );
  }

  if (plan === 'business') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium">
        <Crown className="w-3.5 h-3.5" />
        Business
      </div>
    );
  }

  return null;
};
