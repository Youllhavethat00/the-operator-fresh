import React, { useState } from 'react';
import { Flame, Edit2, Save, Plus, Trash2, Check } from 'lucide-react';
import { OperatingCode } from '@/types/planner';
import { coreManifesto } from '@/data/operatingCode';

interface OperatingCodeViewProps {
  operatingCode: OperatingCode;
  onUpdate: (updates: Partial<OperatingCode>) => void;
}

export const OperatingCodeView: React.FC<OperatingCodeViewProps> = ({
  operatingCode,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrinciples, setEditedPrinciples] = useState(operatingCode.principles);
  const [newPrinciple, setNewPrinciple] = useState('');

  const handleSave = () => {
    onUpdate({ principles: editedPrinciples.filter(p => p.trim()) });
    setIsEditing(false);
  };

  const handleAddPrinciple = () => {
    if (newPrinciple.trim()) {
      setEditedPrinciples([...editedPrinciples, newPrinciple.trim()]);
      setNewPrinciple('');
    }
  };

  const handleRemovePrinciple = (index: number) => {
    setEditedPrinciples(editedPrinciples.filter((_, i) => i !== index));
  };

  const handleUpdatePrinciple = (index: number, value: string) => {
    setEditedPrinciples(editedPrinciples.map((p, i) => i === index ? value : p));
  };

  return (
    <div className="space-y-8">
      {/* Manifesto */}
      <div className="bg-black border-2 border-amber-500/50 rounded-2xl p-8 text-center">
        <Flame size={48} className="text-amber-500 mx-auto mb-6" />
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
          {coreManifesto.statement}
        </h1>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-6 tracking-tight">
          {coreManifesto.continuation}
        </h2>
        <div className="w-24 h-1 bg-amber-500 mx-auto mb-6" />
        <p className="text-xl text-amber-400 italic font-medium">
          {coreManifesto.commitment}
        </p>
      </div>

      {/* Operating Code Principles */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Flame size={24} className="text-amber-500" />
            MY OPERATING CODE
          </h2>
          {!isEditing ? (
            <button
              onClick={() => {
                setEditedPrinciples(operatingCode.principles);
                setIsEditing(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              <Save size={16} />
              Save
            </button>
          )}
        </div>

        <p className="text-zinc-400 mb-6">
          These are your non-negotiable principles. They define how you operate. No exceptions.
        </p>

        {isEditing ? (
          <div className="space-y-3">
            {editedPrinciples.map((principle, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-amber-500 font-bold w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={principle}
                  onChange={(e) => handleUpdatePrinciple(index, e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleRemovePrinciple(index)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            ))}
            
            {/* Add New Principle */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
              <span className="text-zinc-600 font-bold w-6">{editedPrinciples.length + 1}.</span>
              <input
                type="text"
                value={newPrinciple}
                onChange={(e) => setNewPrinciple(e.target.value)}
                placeholder="Add a new principle..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddPrinciple()}
              />
              <button
                onClick={handleAddPrinciple}
                disabled={!newPrinciple.trim()}
                className="p-2 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 rounded-lg transition-colors"
              >
                <Plus size={16} className="text-amber-400" />
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {operatingCode.principles.map((principle, index) => (
              <li key={index} className="flex items-start gap-4 group">
                <span className="text-amber-500 font-bold text-lg">{index + 1}.</span>
                <div className="flex-1">
                  <p className="text-white leading-relaxed">{principle}</p>
                </div>
                <Check size={20} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Daily Application */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-5">
          <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <Flame size={18} />
            Today's Sacrifice
          </h3>
          <p className="text-zinc-400 text-sm mb-3">What are you giving up to get what you want?</p>
          <textarea
            value={operatingCode.dailySacrifice}
            onChange={(e) => onUpdate({ dailySacrifice: e.target.value })}
            placeholder="I am sacrificing..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none text-sm"
            rows={3}
          />
        </div>

        <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-5">
          <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
            <Check size={18} />
            Today's Commitment
          </h3>
          <p className="text-zinc-400 text-sm mb-3">What will you do even if you don't feel like it?</p>
          <textarea
            value={operatingCode.dailyCommitment}
            onChange={(e) => onUpdate({ dailyCommitment: e.target.value })}
            placeholder="I will do..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none text-sm"
            rows={3}
          />
        </div>

        <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-5">
          <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
            <Flame size={18} />
            Comfort Refused
          </h3>
          <p className="text-zinc-400 text-sm mb-3">What comfort are you refusing today?</p>
          <textarea
            value={operatingCode.comfortRefused}
            onChange={(e) => onUpdate({ comfortRefused: e.target.value })}
            placeholder="I refuse to..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 resize-none text-sm"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
