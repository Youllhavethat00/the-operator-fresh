import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import { X, Check, Loader2, Flame, Zap, Crown, ArrowLeft } from 'lucide-react';

// Initialize Stripe with the connected account
const stripePromise = loadStripe('pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ', {
  stripeAccount: 'acct_1Sgi5mQd543XDqWk'
});

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  onSubscribed: () => void;
}

interface Plan {
  id: 'pro' | 'business';
  name: string;
  price: string;
  priceAmount: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    priceAmount: 999,
    description: 'Perfect for individuals serious about productivity',
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    features: [
      'Unlimited cloud sync across devices',
      'Unlimited goals & tracking',
      'AI-powered daily insights',
      'Advanced analytics dashboard',
      'Priority email support',
      'Export data to CSV/PDF',
      'Custom time block templates',
      'Weekly progress reports'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: '$29.99',
    priceAmount: 2999,
    description: 'For teams and power users',
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Everything in Pro',
      'Team collaboration features',
      'Custom branding options',
      'Admin dashboard',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Phone support'
    ]
  }
];

// Payment Form Component
function PaymentForm({ 
  customerId, 
  plan,
  onSuccess, 
  onCancel 
}: { 
  customerId: string;
  plan: 'pro' | 'business';
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError(null);

    try {
      // Confirm the SetupIntent to save payment method
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (setupError) {
        setError(setupError.message || 'Payment setup failed');
        setLoading(false);
        return;
      }

      // If setup succeeded, create the subscription
      if (setupIntent?.status === 'succeeded') {
        const { data, error: subError } = await supabase.functions.invoke('create-subscription', {
          body: { 
            action: 'activate-subscription', 
            customerId,
            plan
          }
        });

        if (subError || data?.error) {
          setError(data?.error || subError?.message || 'Failed to activate subscription');
          setLoading(false);
          return;
        }

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        options={{ 
          layout: 'tabs',
          theme: 'night',
          variables: {
            colorPrimary: '#f59e0b',
            colorBackground: '#18181b',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px'
          }
        }} 
      />
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Subscribe Now'
          )}
        </button>
      </div>
    </form>
  );
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onSubscribed
}) => {
  const [step, setStep] = useState<'plans' | 'payment'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('plans');
      setSelectedPlan(null);
      setClientSecret(null);
      setCustomerId(null);
      setError(null);
    }
  }, [isOpen]);

  const handleSelectPlan = async (plan: Plan) => {
    if (!userEmail) {
      setError('Please sign in to subscribe');
      return;
    }

    setSelectedPlan(plan);
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-subscription', {
        body: { 
          action: 'create-setup-intent',
          email: userEmail,
          plan: plan.id
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setClientSecret(data.clientSecret);
      setCustomerId(data.customerId);
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    onSubscribed();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button
                onClick={() => setStep('plans')}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-500" />
                {step === 'plans' ? 'Upgrade Your Planner' : `Subscribe to ${selectedPlan?.name}`}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {step === 'plans' 
                  ? 'Unlock premium features to supercharge your productivity'
                  : 'Enter your payment details to complete subscription'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {step === 'plans' && (
            <>
              {/* Free Plan Banner */}
              <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Free Plan</h3>
                    <p className="text-zinc-400 text-sm">Basic features with local storage</p>
                  </div>
                  <span className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded-full text-sm">
                    Current Plan
                  </span>
                </div>
              </div>

              {/* Paid Plans */}
              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-2xl border-2 transition-all ${
                      plan.popular 
                        ? 'border-amber-500 bg-amber-500/5' 
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${plan.popular ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-400'}`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <p className="text-zinc-400 text-sm">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-zinc-400">/month</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-zinc-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-amber-500 hover:bg-amber-600 text-black'
                          : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading && selectedPlan?.id === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Get ${plan.name}`
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-500 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Cancel Anytime
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                    Money-back Guarantee
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'payment' && clientSecret && customerId && selectedPlan && (
            <div className="max-w-md mx-auto">
              <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                      {selectedPlan.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedPlan.name} Plan</h3>
                      <p className="text-zinc-400 text-sm">{selectedPlan.price}/month</p>
                    </div>
                  </div>
                </div>
              </div>

              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#f59e0b',
                      colorBackground: '#18181b',
                      colorText: '#ffffff',
                      colorDanger: '#ef4444',
                      fontFamily: 'system-ui, sans-serif',
                      borderRadius: '8px'
                    }
                  }
                }}
              >
                <PaymentForm 
                  customerId={customerId}
                  plan={selectedPlan.id}
                  onSuccess={handleSuccess}
                  onCancel={() => setStep('plans')}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
