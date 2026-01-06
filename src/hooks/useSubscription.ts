import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SubscriptionStatus {
  hasSubscription: boolean;
  plan: 'free' | 'pro' | 'business';
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  subscriptionId?: string;
  customerId?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionStatus;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;
  isPro: boolean;
  isBusiness: boolean;
  isPaid: boolean;
}

const defaultSubscription: SubscriptionStatus = {
  hasSubscription: false,
  plan: 'free',
  status: 'inactive'
};

// Admin emails with free pro access
const ADMIN_EMAILS = [
  'tyler@backyardpyre.com',
  'reviewer@backyardpyre.com'
];

export const useSubscription = (userEmail?: string | null): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>(defaultSubscription);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!userEmail) {
      setSubscription(defaultSubscription);
      return;
    }

    // Check if admin user - grant instant pro access
    if (ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      setSubscription({
        hasSubscription: true,
        plan: 'pro',
        status: 'active',
        subscriptionId: 'admin-bypass',
        customerId: 'admin',
        currentPeriodEnd: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
        cancelAtPeriodEnd: false
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('manage-subscription', {
        body: { 
          action: 'get-status',
          email: userEmail 
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSubscription({
        hasSubscription: data.hasSubscription || false,
        plan: data.plan || 'free',
        status: data.status || 'inactive',
        subscriptionId: data.subscriptionId,
        customerId: data.customerId,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd
      });
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      setError(err.message);
      setSubscription(defaultSubscription);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const cancelSubscription = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!subscription.subscriptionId) {
      return { success: false, error: 'No active subscription found' };
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke('manage-subscription', {
        body: { 
          action: 'cancel',
          subscriptionId: subscription.subscriptionId 
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update local state
      setSubscription(prev => ({
        ...prev,
        cancelAtPeriodEnd: true
      }));

      return { success: true };
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      return { success: false, error: err.message };
    }
  }, [subscription.subscriptionId]);

  const isPro = subscription.plan === 'pro' && subscription.status === 'active';
  const isBusiness = subscription.plan === 'business' && subscription.status === 'active';
  const isPaid = isPro || isBusiness;

  return {
    subscription,
    isLoading,
    error,
    refreshSubscription: fetchSubscriptionStatus,
    cancelSubscription,
    isPro,
    isBusiness,
    isPaid
  };
};
