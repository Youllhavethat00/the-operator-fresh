import React, { useState } from 'react';
import { Flame, Target, Shield, Save, Edit2 } from 'lucide-react';

interface DailyIntentionProps {
  intention: string;
  sacrifice: string;
  comfortRefused: string;
  onUpdate: (updates: { intention?: string; sacrifice?: string; comfortRefused?: string }) => void;
}

export const DailyIntention: React.FC<DailyIntentionProps> = ({
  intention,
  sacrifice,
  comfortRefused,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localIntention, setLocalIntention] = useState(intention);
  const [localSacrifice, setLocalSacrifice] = useState(sacrifice);
  const [localComfort, setLocalComfort] = useState(comfortRefused);

  const handleSave = () => {
    onUpdate({
      intention: localIntention,
      sacrifice: localSacrifice,
      comfortRefused: localComfort
    });
    setIsEditing(false);
  };

  const allFilled = intention && sacrifice && comfortRefused;

  if (!isEditing && allFilled) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Daily Commitment</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Edit2 size={16} className="text-zinc-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Target size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Today's Intention</p>
              <p className="text-white">{intention}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Flame size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">The Sacrifice I'm Making</p>
              <p className="text-white">{sacrifice}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Comfort I'm Refusing</p>
              <p className="text-white">{comfortRefused}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-amber-400">Set Your Daily Commitment</h3>
        {!allFilled && (
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">Required</span>
        )}
      </div>

      <p className="text-sm text-zinc-400">
        Before you begin, declare your commitment. This is non-negotiable.
      </p>

      <div className="space-y-4">
        {/* Intention */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
            <Target size={16} className="text-amber-400" />
            What is your intention for today?
          </label>
          <textarea
            value={localIntention}
            onChange={(e) => setLocalIntention(e.target.value)}
            placeholder="I will accomplish..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
            rows={2}
          />
        </div>

        {/* Sacrifice */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
            <Flame size={16} className="text-red-400" />
            What sacrifice are you making today?
          </label>
          <textarea
            value={localSacrifice}
            onChange={(e) => setLocalSacrifice(e.target.value)}
            placeholder="I am giving up..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
            rows={2}
          />
        </div>

        {/* Comfort Refused */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
            <Shield size={16} className="text-green-400" />
            What comfort are you refusing today?
          </label>
          <textarea
            value={localComfort}
            onChange={(e) => setLocalComfort(e.target.value)}
            placeholder="I will not allow myself to..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
            rows={2}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!localIntention || !localSacrifice || !localComfort}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-3 rounded-lg transition-colors"
      >
        <Save size={18} />
        Lock In Commitment
      </button>
    </div>
  );
};
