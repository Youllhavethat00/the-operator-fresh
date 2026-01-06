import React, { useState } from 'react';
import { Flame, ArrowRight, Check } from 'lucide-react';
import { coreManifesto } from '@/data/operatingCode';

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

// The Operator Logo Component
const OperatorLogo = ({ className = "w-24 h-24" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#09090b" rx="64"/>
    <circle cx="256" cy="256" r="160" fill="none" stroke="#f59e0b" strokeWidth="14"/>
    <circle cx="256" cy="256" r="100" fill="none" stroke="#f59e0b" strokeWidth="7"/>
    <circle cx="256" cy="256" r="35" fill="#f59e0b"/>
    <line x1="256" y1="76" x2="256" y2="146" stroke="#f59e0b" strokeWidth="11" strokeLinecap="round"/>
    <line x1="256" y1="366" x2="256" y2="436" stroke="#f59e0b" strokeWidth="11" strokeLinecap="round"/>
    <line x1="76" y1="256" x2="146" y2="256" stroke="#f59e0b" strokeWidth="11" strokeLinecap="round"/>
    <line x1="366" y1="256" x2="436" y2="256" stroke="#f59e0b" strokeWidth="11" strokeLinecap="round"/>
  </svg>
);

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [step, setStep] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  
  if (!isOpen) return null;
  
  const steps = [{
    title: 'Welcome to The Operator',
    content: <div className="text-center space-y-6">
          <OperatorLogo className="w-24 h-24 mx-auto" />
          <div>
            <h2 className="text-2xl font-black text-white mb-2">The Operator</h2>
            <p className="text-zinc-400">Your execution system that enforces focus, priorities, and follow-through</p>
          </div>
          <p className="text-zinc-300 leading-relaxed">This isn't just another system. This is a system designed for people who are done making excuses and ready to execute at the highest level.</p>
        </div>
  }, {
    title: 'The Core Truth',
    content: <div className="text-center space-y-6">
          <Flame size={48} className="text-amber-500 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {coreManifesto.statement}
            </h2>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {coreManifesto.continuation}
            </h2>
          </div>
          <div className="w-16 h-1 bg-amber-500 mx-auto" />
          <p className="text-xl text-amber-400 italic font-medium">
            {coreManifesto.commitment}
          </p>
        </div>
  }, {
    title: 'The 80/60/20 System',
    content: <div className="space-y-6">
          <h2 className="text-xl font-bold text-white text-center mb-6">Prioritize Like a Professional</h2>
          
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-black text-red-400">80%</span>
                <span className="text-white font-bold">Revenue Generating</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Tasks that directly generate income or move the needle on your biggest goals. 
                These get done first, no exceptions.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-black text-amber-400">60%</span>
                <span className="text-white font-bold">Growth Activities</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Tasks that build capacity, develop skills, or create future opportunities. 
                Important but not urgent.
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-black text-green-400">20%</span>
                <span className="text-white font-bold">Maintenance</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Administrative tasks, emails, and routine maintenance. 
                Necessary but should never dominate your day.
              </p>
            </div>
          </div>
        </div>
  }, {
    title: 'Your Commitment',
    content: <div className="space-y-6">
          <h2 className="text-xl font-bold text-white text-center">Before You Begin</h2>
          
          <p className="text-zinc-400 text-center">
            Every day, you will declare three things before you can access your planner:
          </p>

          <div className="space-y-3">
            <div className="bg-zinc-800 rounded-lg p-4 flex items-start gap-3">
              <span className="text-amber-400 font-bold">1.</span>
              <div>
                <p className="text-white font-medium">Your Daily Intention</p>
                <p className="text-zinc-500 text-sm">What you will accomplish today</p>
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 flex items-start gap-3">
              <span className="text-amber-400 font-bold">2.</span>
              <div>
                <p className="text-white font-medium">Your Sacrifice</p>
                <p className="text-zinc-500 text-sm">What you are giving up to get what you want</p>
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 flex items-start gap-3">
              <span className="text-amber-400 font-bold">3.</span>
              <div>
                <p className="text-white font-medium">Comfort Refused</p>
                <p className="text-zinc-500 text-sm">What comfort you are refusing today</p>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-700 rounded-lg cursor-pointer hover:border-amber-500/50 transition-colors">
            <input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500" />
            <span className="text-white">I understand and commit to this system</span>
          </label>
        </div>
  }];
  
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const canProceed = !isLastStep || acknowledged;
  
  return <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Progress */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex gap-2">
            {steps.map((_, idx) => <div key={idx} className={`flex-1 h-1 rounded-full transition-colors ${idx <= step ? 'bg-amber-500' : 'bg-zinc-700'}`} />)}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep.content}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-800 flex justify-between">
          {step > 0 ? <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">
              Back
            </button> : <div />}
          
          <button onClick={() => {
          if (isLastStep) {
            onComplete();
          } else {
            setStep(step + 1);
          }
        }} disabled={!canProceed} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${canProceed ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}>
            {isLastStep ? <>
                <Check size={18} />
                Get Started
              </> : <>
                Continue
                <ArrowRight size={18} />
              </>}
          </button>
        </div>
      </div>
    </div>;
};
