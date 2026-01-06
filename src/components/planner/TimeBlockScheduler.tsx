import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Pause, Bell, Edit2, Check, X, Plus, Trash2, Volume2, VolumeX } from 'lucide-react';
import { TimeBlock } from '@/types/planner';

interface TimeBlockSchedulerProps {
  timeBlocks: TimeBlock[];
  onUpdateBlocks: (blocks: TimeBlock[]) => void;
  onBlockChange?: (block: TimeBlock) => void;
  compact?: boolean;
}

const priorityColors = {
  '80': { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', accent: '#ef4444' },
  '60': { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', accent: '#f59e0b' },
  '20': { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', accent: '#22c55e' }
};

export const TimeBlockScheduler: React.FC<TimeBlockSchedulerProps> = ({
  timeBlocks,
  onUpdateBlocks,
  onBlockChange,
  compact = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({ startTime: '09:00', endTime: '10:00', label: '', priority: '80' as '80' | '60' | '20' });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastNotifiedBlock, setLastNotifiedBlock] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTimeString = useCallback(() => {
    return `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
  }, [currentTime]);

  const isBlockActive = useCallback((block: TimeBlock) => {
    const now = getCurrentTimeString();
    return now >= block.startTime && now < block.endTime;
  }, [getCurrentTimeString]);

  const isBlockPast = useCallback((block: TimeBlock) => {
    const now = getCurrentTimeString();
    return now >= block.endTime;
  }, [getCurrentTimeString]);

  // Check for block transitions and notify
  useEffect(() => {
    const activeBlock = timeBlocks.find(isBlockActive);
    if (activeBlock && activeBlock.id !== lastNotifiedBlock) {
      setLastNotifiedBlock(activeBlock.id);
      onBlockChange?.(activeBlock);
      
      // Vibrate on mobile
      if ('vibrate' in navigator && soundEnabled) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [currentTime, timeBlocks, isBlockActive, lastNotifiedBlock, onBlockChange, soundEnabled]);

  const getBlockProgress = (block: TimeBlock) => {
    if (!isBlockActive(block)) return isBlockPast(block) ? 100 : 0;
    
    const [startH, startM] = block.startTime.split(':').map(Number);
    const [endH, endM] = block.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    const totalDuration = endMinutes - startMinutes;
    const elapsed = currentMinutes - startMinutes;
    
    return Math.round((elapsed / totalDuration) * 100);
  };

  const getTimeRemaining = (block: TimeBlock) => {
    if (!isBlockActive(block)) return null;
    
    const [endH, endM] = block.endTime.split(':').map(Number);
    const endMinutes = endH * 60 + endM;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const remaining = endMinutes - currentMinutes;
    
    const hours = Math.floor(remaining / 60);
    const minutes = remaining % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
  };

  const handleEditBlock = (blockId: string, label: string) => {
    setEditingBlock(blockId);
    setEditLabel(label);
  };

  const handleSaveEdit = (blockId: string) => {
    onUpdateBlocks(
      timeBlocks.map(b => 
        b.id === blockId ? { ...b, label: editLabel } : b
      )
    );
    setEditingBlock(null);
  };

  const handleAddBlock = () => {
    if (!newBlock.label.trim()) return;
    
    const block: TimeBlock = {
      id: `block-${Date.now()}`,
      ...newBlock
    };
    
    // Sort blocks by start time
    const updatedBlocks = [...timeBlocks, block].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
    
    onUpdateBlocks(updatedBlocks);
    setShowAddBlock(false);
    setNewBlock({ startTime: '09:00', endTime: '10:00', label: '', priority: '80' });
  };

  const handleDeleteBlock = (blockId: string) => {
    onUpdateBlocks(timeBlocks.filter(b => b.id !== blockId));
  };

  const activeBlock = timeBlocks.find(isBlockActive);

  return (
    <div className="space-y-3">
      {/* Current Time Indicator */}
      <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-amber-400" />
          <span className="text-amber-400 font-mono text-lg">{getCurrentTimeString()}</span>
          <span className="text-zinc-500 text-sm hidden sm:inline">Current Time</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'
            }`}
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          {/* Add Block Button */}
          <button
            onClick={() => setShowAddBlock(!showAddBlock)}
            className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Active Block Highlight */}
      {activeBlock && !compact && (
        <div className="p-4 bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/50 rounded-xl animate-pulse-amber">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400 text-sm font-medium flex items-center gap-2">
              <Play size={14} />
              CURRENT BLOCK
            </span>
            <span className="text-zinc-400 text-sm font-mono">
              {activeBlock.startTime} - {activeBlock.endTime}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">{activeBlock.label}</h3>
          <div className="mt-2 flex items-center gap-2 text-amber-400">
            <Bell size={14} />
            <span className="text-sm">{getTimeRemaining(activeBlock)}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000"
              style={{ width: `${getBlockProgress(activeBlock)}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Block Form */}
      {showAddBlock && (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3 scale-in">
          <h4 className="font-medium text-white">Add Time Block</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Start Time</label>
              <input
                type="time"
                value={newBlock.startTime}
                onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">End Time</label>
              <input
                type="time"
                value={newBlock.endTime}
                onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Label</label>
            <input
              type="text"
              value={newBlock.label}
              onChange={(e) => setNewBlock({ ...newBlock, label: e.target.value })}
              placeholder="What will you focus on?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600"
            />
          </div>
          
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Priority</label>
            <div className="flex gap-2">
              {(['80', '60', '20'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setNewBlock({ ...newBlock, priority: p })}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    newBlock.priority === p 
                      ? `${priorityColors[p].bg} ${priorityColors[p].text} ${priorityColors[p].border} border`
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAddBlock}
              disabled={!newBlock.label.trim()}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-medium rounded-lg transition-colors"
            >
              Add Block
            </button>
            <button
              onClick={() => setShowAddBlock(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Time Blocks List */}
      <div className="space-y-2">
        {timeBlocks.map(block => {
          const colors = priorityColors[block.priority];
          const active = isBlockActive(block);
          const past = isBlockPast(block);
          const progress = getBlockProgress(block);
          const remaining = getTimeRemaining(block);

          return (
            <div
              key={block.id}
              className={`relative overflow-hidden rounded-lg border transition-all ${
                active 
                  ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-offset-black`
                  : past
                  ? 'bg-zinc-900/50 border-zinc-800 opacity-60'
                  : `${colors.bg} ${colors.border}`
              }`}
              style={active ? { '--tw-ring-color': colors.accent } as React.CSSProperties : undefined}
            >
              {/* Progress Bar Background */}
              <div 
                className="absolute inset-0 bg-white/5 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
              
              <div className="relative p-3 md:p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    {/* Time Range */}
                    <div className="text-xs md:text-sm font-mono text-zinc-400">
                      {block.startTime} - {block.endTime}
                    </div>
                    
                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${colors.text} ${colors.bg}`}>
                      {block.priority}%
                    </span>
                    
                    {/* Active Indicator */}
                    {active && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded animate-pulse">
                        <Play size={12} />
                        <span className="hidden sm:inline">ACTIVE</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {!active && !past && (
                      <>
                        <button
                          onClick={() => handleEditBlock(block.id, block.label)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          aria-label="Edit block"
                        >
                          <Edit2 size={14} className="text-zinc-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          className="p-2 hover:bg-red-500/20 rounded transition-colors"
                          aria-label="Delete block"
                        >
                          <Trash2 size={14} className="text-zinc-500 hover:text-red-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Label */}
                <div className="mt-2">
                  {editingBlock === block.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-amber-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(block.id);
                          if (e.key === 'Escape') setEditingBlock(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveEdit(block.id)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded"
                      >
                        <Check size={14} className="text-green-400" />
                      </button>
                      <button
                        onClick={() => setEditingBlock(null)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded"
                      >
                        <X size={14} className="text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <h4 className={`font-medium ${past ? 'text-zinc-500 line-through' : 'text-white'}`}>
                      {block.label}
                    </h4>
                  )}
                </div>

                {/* Time Remaining */}
                {remaining && !compact && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-amber-400">
                    <Bell size={14} />
                    {remaining}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {timeBlocks.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Clock size={32} className="mx-auto mb-2 opacity-50" />
            <p>No time blocks scheduled</p>
            <button
              onClick={() => setShowAddBlock(true)}
              className="mt-2 text-amber-400 hover:text-amber-300 text-sm"
            >
              Add your first block
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
