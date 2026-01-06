import React, { useState } from 'react';
import { X, Zap, Crown, Calendar, AlertTriangle, Loader2, Check } from 'lucide-react';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    plan: 'free' | 'pro' | 'business';
    status: string;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: boolean;
  };
  onCancel: () => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onCancel,
  onRefresh
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  if (!isOpen) return null;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancel = async () => {
    setCanceling(true);
    setError(null);
    
    const result = await onCancel();
    
    if (result.success) {
      setCancelSuccess(true);
      onRefresh();
    } else {
      setError(result.error || 'Failed to cancel subscription');
    }
    
    setCanceling(false);
  };

  const getPlanIcon = () => {
    if (subscription.plan === 'business') {
      return <Crown className="w-8 h-8 text-purple-400" />;
    }
    return <Zap className="w-8 h-8 text-amber-400" />;
  };

  const getPlanColor = () => {
    if (subscription.plan === 'business') return 'purple';
    return 'amber';
  };

  const color = getPlanColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Manage Subscription</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Info */}
          <div className={`p-4 bg-${color}-500/10 border border-${color}-500/30 rounded-xl mb-6`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
                {getPlanIcon()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white capitalize">
                  {subscription.plan} Plan
                </h3>
                <p className={`text-${color}-400 text-sm`}>
                  {subscription.plan === 'pro' ? '$9.99/month' : '$29.99/month'}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Status</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                subscription.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {subscription.cancelAtPeriodEnd ? 'Canceling' : subscription.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <span className="text-zinc-400">
                {subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing Date'}
              </span>
              <span className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>
          </div>

          {/* Cancel Section */}
          {!subscription.cancelAtPeriodEnd && !cancelSuccess && (
            <>
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30"
                >
                  Cancel Subscription
                </button>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Cancel Subscription?</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        You'll keep access until {formatDate(subscription.currentPeriodEnd)}, then your account will revert to the free plan.
                      </p>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/20 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                    >
                      Keep Plan
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={canceling}
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {canceling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Canceling...
                        </>
                      ) : (
                        'Yes, Cancel'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Canceled Message */}
          {(subscription.cancelAtPeriodEnd || cancelSuccess) && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Subscription Canceled</h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    You'll have access to {subscription.plan} features until {formatDate(subscription.currentPeriodEnd)}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features reminder */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-400 mb-3">Your {subscription.plan} features:</h4>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Unlimited cloud sync
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Unlimited goals & tracking
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                AI-powered insights
              </li>
              {subscription.plan === 'business' && (
                <>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Team collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    API access
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
